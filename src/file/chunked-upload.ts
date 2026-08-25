/**
 * 分片上传与断点续传
 *
 * 将大文件切分为多个分片，支持暂停/恢复/续传，
 * 与 FileDispatchCenter 配合使用，通过 HttpClient 发送分片。
 */

import { HttpClient } from '@/http';
import { getId } from '@/utils/string';
import type { ILogger } from '@qimenjs/logger';
import { Logger } from '@qimenjs/logger';

/** 分片信息 */
export interface UploadChunk {
    index: number;
    blob: Blob;
    size: number;
    uploaded: boolean;
}

/** 分片上传状态 */
export type ChunkUploadStatus = 'pending' | 'uploading' | 'uploaded' | 'error';

/** 分片上传进度 */
export interface ChunkProgress {
    chunkIndex: number;
    chunkStatus: ChunkUploadStatus;
    totalChunks: number;
    uploadedChunks: number;
    percent: number;
}

/** 分片上传配置 */
export interface ChunkedUploadConfig {
    /** 上传 URL */
    url: string;
    /** 单个分片大小（字节），默认 2MB */
    chunkSize?: number;
    /** 查询已上传分片的 URL（续传用），默认同 url */
    checkUrl?: string;
    /** 请求头 */
    headers?: Record<string, string>;
    /** 域名 */
    domain?: string;
    /** 分片上传完成后的合并接口 URL */
    mergeUrl?: string;
    /** 合并接口请求头 */
    mergeHeaders?: Record<string, string>;
}

/** 分片上传器 */
export class ChunkedUploader {
    private readonly file: File;
    private readonly config: Required<ChunkedUploadConfig>;
    private readonly uploadId: string;
    private readonly logger: ILogger;
    private chunks: UploadChunk[] = [];
    private status: ChunkUploadStatus[] = [];
    private paused = false;
    private aborted = false;
    private onProgress: ((progress: ChunkProgress) => void) | null = null;

    private resolvePromise!: (result: any) => void;
    private rejectPromise!: (err: any) => void;
    private promise: Promise<any>;

    constructor(file: File, config: ChunkedUploadConfig) {
        this.file = file;
        this.config = {
            url: config.url,
            chunkSize: config.chunkSize ?? 2 * 1024 * 1024,
            checkUrl: config.checkUrl ?? config.url,
            headers: config.headers ?? {},
            domain: config.domain ?? 'default',
            mergeUrl: config.mergeUrl ?? '',
            mergeHeaders: config.mergeHeaders ?? {},
        };
        this.uploadId = `chunk-${getId('up')}-${Date.now()}`;
        this.logger = Logger.for('chunked-upload');
        this._initChunks();
        this.promise = new Promise((resolve, reject) => {
            this.resolvePromise = resolve;
            this.rejectPromise = reject;
        });
    }

    private _initChunks(): void {
        const { chunkSize } = this.config;
        const totalChunks = Math.ceil(this.file.size / chunkSize);
        this.chunks = [];
        this.status = [];
        for (let i = 0; i < totalChunks; i++) {
            const start = i * chunkSize;
            const end = Math.min(start + chunkSize, this.file.size);
            this.chunks.push({
                index: i,
                blob: this.file.slice(start, end),
                size: end - start,
                uploaded: false,
            });
            this.status.push('pending');
        }
    }

    /** 注册进度回调 */
    onProgress(cb: (progress: ChunkProgress) => void): void {
        this.onProgress = cb;
    }

    /** 获取已上传分片信息 */
    get progress(): ChunkProgress {
        const uploaded = this.status.filter(s => s === 'uploaded').length;
        return {
            chunkIndex: -1,
            chunkStatus: 'pending',
            totalChunks: this.chunks.length,
            uploadedChunks: uploaded,
            percent: this.chunks.length > 0 ? Math.round((uploaded / this.chunks.length) * 100) : 0,
        };
    }

    /** 结果 Promise */
    get result(): Promise<any> {
        return this.promise;
    }

    /** 获取 uploadId */
    get id(): string {
        return this.uploadId;
    }

    /** 开始上传 */
    async start(): Promise<any> {
        this.paused = false;
        this.aborted = false;

        try {
            await this._checkUploadedChunks();
            await this._uploadRemaining();
            if (!this.aborted) {
                const result = await this._merge();
                this.resolvePromise(result);
                return result;
            }
        } catch (err) {
            if (!this.aborted) {
                this.rejectPromise(err);
            }
            throw err;
        }
    }

    /** 暂停上传 */
    pause(): void {
        this.paused = true;
    }

    /** 恢复上传 */
    resume(): Promise<any> {
        return this.start();
    }

    /** 取消上传 */
    abort(): void {
        this.aborted = true;
        this.rejectPromise(new Error('upload aborted'));
    }

    /** 查询服务器已存在的分片 */
    private async _checkUploadedChunks(): Promise<void> {
        try {
            const client = new HttpClient(this.config.domain);
            const task = client.post(this.config.checkUrl, {
                uploadId: this.uploadId,
                fileName: this.file.name,
                fileSize: this.file.size,
                chunkSize: this.config.chunkSize,
                totalChunks: this.chunks.length,
            }, { headers: this.config.headers });

            const ctx = await task.context;
            const uploadedIndices: number[] = ctx.data?.uploadedChunks ?? [];

            if (uploadedIndices.length > 0) {
                this.logger.debug?.(`[ChunkedUploader] resume: ${uploadedIndices.length} chunks already uploaded`);
                for (const idx of uploadedIndices) {
                    if (idx >= 0 && idx < this.chunks.length) {
                        this.chunks[idx].uploaded = true;
                        this.status[idx] = 'uploaded';
                    }
                }
            }
        } catch {
            // 续传检查失败，从头开始上传
            this.logger.debug?.('[ChunkedUploader] resume check failed, upload from start');
        }
    }

    /** 上传剩余分片 */
    private async _uploadRemaining(): Promise<void> {
        const client = new HttpClient(this.config.domain);

        for (let i = 0; i < this.chunks.length; i++) {
            if (this.aborted) return;
            if (this.paused) return;
            if (this.chunks[i].uploaded) continue;

            this.status[i] = 'uploading';
            this._emitProgress(i, 'uploading');

            const formData = new FormData();
            formData.append('chunk', this.chunks[i].blob);
            formData.append('uploadId', this.uploadId);
            formData.append('chunkIndex', String(i));
            formData.append('totalChunks', String(this.chunks.length));
            formData.append('fileName', this.file.name);

            try {
                await client.upload(this.config.url, formData, () => {}, {
                    headers: this.config.headers,
                }).context;

                this.chunks[i].uploaded = true;
                this.status[i] = 'uploaded';
                this._emitProgress(i, 'uploaded');
            } catch (err) {
                this.status[i] = 'error';
                this._emitProgress(i, 'error');
                throw err;
            }
        }
    }

    /** 通知服务器合并分片 */
    private async _merge(): Promise<any> {
        if (!this.config.mergeUrl) return { uploadId: this.uploadId };

        const client = new HttpClient(this.config.domain);
        const task = client.post(this.config.mergeUrl, {
            uploadId: this.uploadId,
            fileName: this.file.name,
            fileSize: this.file.size,
            totalChunks: this.chunks.length,
        }, { headers: { ...this.config.headers, ...this.config.mergeHeaders } });

        const ctx = await task.context;
        return ctx.data ?? { uploadId: this.uploadId };
    }

    private _emitProgress(chunkIndex: number, chunkStatus: ChunkUploadStatus): void {
        if (!this.onProgress) return;
        const uploaded = this.status.filter(s => s === 'uploaded').length;
        this.onProgress({
            chunkIndex,
            chunkStatus,
            totalChunks: this.chunks.length,
            uploadedChunks: uploaded,
            percent: this.chunks.length > 0 ? Math.round((uploaded / this.chunks.length) * 100) : 0,
        });
    }
}