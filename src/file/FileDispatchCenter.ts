/**
 * FileDispatchCenter — 文件调度中心（单例）
 *
 * 为组件提供文件上传/下载/校验/哈希的完整编排，持有所有文件通道状态。
 *
 * 架构分层：
 *   1. 通道管理层 — 按 fileKey 维护 FileChannelState（config + items + refCount）
 *   2. 编排层 — 校验 → 哈希 → 上传/下载，驱动文件生命周期
 *   3. 事件层 — 通过 FileEventBus 广播反馈事件，支持多消费者订阅
 *
 * 设计模式：
 *   - 单例（参照 FloatEngine，plain singleton，不继承 RegistrarBase）
 *   - ref-counted connect/disconnect（参照 DataDispatchCenter）
 *   - 直接 API + 反馈总线（非对称，参照 DragEventBus 混合模式）：
 *     组件命令直接调用本中心方法，中心执行后通过 FileEventBus 广播反馈
 *
 * 多消费者：多个组件 connect 同一 fileKey 可共享同一队列与配置，
 * 任一组件触发操作后，所有订阅该 fileKey 的组件都会收到反馈事件。
 *
 * @example
 * const center = FileDispatchCenter.getInstance();
 * center.createChannel('avatars', { transport: { url: '/api/upload', hashEnabled: true }, accept: 'image/*' });
 * center.connect('avatars');
 * const off = fileEventBus.fileOn('avatars', FILE_FEEDBACK_EVENTS.UPLOADED, (data) => { ... });
 * center.addFiles('avatars', files);  // 自动上传
 * // ...
 * center.disconnect('avatars');  // 引用计数到 0 时销毁通道
 */

import { FileEventBus, FILE_ACTIONS, FILE_FEEDBACK_EVENTS } from '@/events';
import { EventContextBuilder } from '@/context';
import { HttpClient } from '@/http';
import { KernelErrorCode } from '@/error';
import { createFileHashTask } from './hash';
import { triggerDownload } from './download';
import { getId } from '@/utils/string';
import { MimeTypeRegistrar } from '@/mime';
import { ILogger, Logger } from '@qimenjs/logger';
import { isFileTypeAllowed } from './format';
import { ChunkedUploader } from './chunked-upload';
import {
    FileItemStatus,
    type FileChannelConfig,
    type FileChannelState,
    type FileItem,
} from './types';

export class FileDispatchCenter {
    private static instance: FileDispatchCenter;

    private readonly channels = new Map<string, FileChannelState>();
    private readonly bus = FileEventBus.getInstance();
    private readonly logger: ILogger;

    /** 文件 ID 自增计数器（集中生成，保证跨通道唯一） */
    private fileIdCounter = 0;

    private constructor() {
        this.logger = Logger.for('file-dispatch');
        this.logger.debug?.('[FileDispatchCenter] initialized, scopeId =', this.bus.getScopeId());
    }

    static getInstance(): FileDispatchCenter {
        if (!FileDispatchCenter.instance) {
            FileDispatchCenter.instance = new FileDispatchCenter();
        }
        return FileDispatchCenter.instance;
    }

    // ──────────────────────────────────────────────
    // 通道生命周期
    // ──────────────────────────────────────────────

    /**
     * 创建或更新通道配置（幂等）
     *
     * 不存在则创建空通道；存在则合并 config（不重置 items 与 refCount）。
     */
    createChannel(fileKey: string, config: FileChannelConfig): void {
        let channel = this.channels.get(fileKey);
        if (!channel) {
            channel = {
                config: { ...config },
                items: [],
                refCount: 0,
                activeTasks: new Map(),
                actionUnsubs: [],
            };
            this.channels.set(fileKey, channel);
            this._listenFileActions(fileKey);
            this.logger.debug?.(`[FileDispatchCenter] created channel "${fileKey}"`);
        } else {
            channel.config = { ...channel.config, ...config };
            this.logger.debug?.(`[FileDispatchCenter] updated channel config "${fileKey}"`);
        }
    }

    /** 连接通道（引用计数 +1），不存在则按默认配置创建 */
    connect(fileKey: string): void {
        const channel = this._ensureChannel(fileKey);
        channel.refCount++;
        this.logger.debug?.(
            `[FileDispatchCenter] connect "${fileKey}", refCount=${channel.refCount}`
        );
    }

    /** 断开通道（引用计数 -1），到 0 销毁通道 */
    disconnect(fileKey: string): void {
        const channel = this.channels.get(fileKey);
        if (!channel) return;

        channel.refCount--;
        this.logger.debug?.(
            `[FileDispatchCenter] disconnect "${fileKey}", refCount=${channel.refCount}`
        );

        if (channel.refCount <= 0) {
            this.destroyChannel(fileKey);
        }
    }

    /** 销毁通道：取消所有进行中任务、取消命令监听并删除状态 */
    destroyChannel(fileKey: string): void {
        const channel = this.channels.get(fileKey);
        if (!channel) return;

        for (const off of channel.actionUnsubs) {
            if (typeof off === 'function') off();
        }
        channel.actionUnsubs = [];

        for (const [, task] of channel.activeTasks) {
            try {
                task.cancel('channel destroyed');
            } catch (e) {
                /* ignore */
            }
        }
        channel.activeTasks.clear();
        this.channels.delete(fileKey);
        this.logger.debug?.(`[FileDispatchCenter] destroyed channel "${fileKey}"`);
    }

    /** 清理所有通道 */
    dispose(): void {
        for (const key of [...this.channels.keys()]) {
            this.destroyChannel(key);
        }
        this.logger.debug?.('[FileDispatchCenter] all channels disposed');
    }

    // ──────────────────────────────────────────────
    // 状态读取
    // ──────────────────────────────────────────────

    getItems(fileKey: string): FileItem[] {
        return this.channels.get(fileKey)?.items ?? [];
    }

    getItem(fileKey: string, itemId: string): FileItem | undefined {
        return this.channels.get(fileKey)?.items.find(i => i.id === itemId);
    }

    /** 清空通道队列（formReset 用） */
    clear(fileKey: string): void {
        const channel = this.channels.get(fileKey);
        if (!channel) return;
        channel.items = [];
    }

    /** 直接设置通道队列（setFormValue 回填用，标记为 UPLOADED） */
    setItems(fileKey: string, items: FileItem[]): void {
        const channel = this._ensureChannel(fileKey);
        channel.items = items.map(item => ({
            id: item.id ?? this._generateFileId(),
            file: item.file ?? null,
            name: item.name ?? '',
            size: item.size ?? 0,
            status: FileItemStatus.UPLOADED,
            percent: 100,
            result: item.result,
        }));
    }

    // ──────────────────────────────────────────────
    // 文件操作
    // ──────────────────────────────────────────────

    /**
     * 添加文件到通道队列
     *
     * 流程：校验类型/大小 → 构建 FileItem push → emit SELECTED → 若 autoUpload 调 upload
     *
     * @returns 通过校验并加入队列的 FileItem 数组
     */
    addFiles(fileKey: string, files: File[]): FileItem[] {
        const channel = this._ensureChannel(fileKey);
        const { accept, maxSize } = channel.config;
        const added: FileItem[] = [];

        for (const file of files) {
            if (accept && !isFileTypeAllowed(file, accept)) {
                this._emit(fileKey, FILE_FEEDBACK_EVENTS.UPLOAD_ERROR, {
                    file,
                    error: KernelErrorCode.FILE_TYPE_MISMATCH,
                });
                continue;
            }

            if (maxSize && file.size > maxSize) {
                this._emit(fileKey, FILE_FEEDBACK_EVENTS.UPLOAD_ERROR, {
                    file,
                    error: KernelErrorCode.FILE_SIZE_EXCEEDED,
                });
                continue;
            }

            const item: FileItem = {
                id: this._generateFileId(),
                file,
                name: file.name,
                size: file.size,
                status: FileItemStatus.SELECTED,
                percent: 0,
            };
            channel.items.push(item);
            added.push(item);
        }

        if (added.length > 0) {
            this._emit(fileKey, FILE_FEEDBACK_EVENTS.SELECTED, { items: added });
        }

        if (added.length > 0 && channel.config.autoUpload !== false) {
            void this.upload(fileKey);
        }

        return added;
    }

    /**
     * 上传通道内所有 SELECTED/ERROR 项（顺序执行）
     */
    async upload(fileKey: string): Promise<void> {
        const channel = this.channels.get(fileKey);
        if (!channel) return;

        const pending = channel.items.filter(
            i => i.status === FileItemStatus.SELECTED || i.status === FileItemStatus.ERROR
        );

        for (const item of pending) {
            await this._uploadSingle(fileKey, item);
        }

        this._checkAllUploaded(fileKey);
    }

    /** 取消指定文件项的上传 */
    cancel(fileKey: string, itemId: string): void {
        const channel = this.channels.get(fileKey);
        if (!channel) return;

        const task = channel.activeTasks.get(itemId);
        if (task) {
            try {
                task.cancel('user cancelled');
            } catch (e) {
                /* ignore */
            }
            channel.activeTasks.delete(itemId);
        }

        const item = channel.items.find(i => i.id === itemId);
        if (item) {
            item.status = FileItemStatus.ERROR;
            item.error = KernelErrorCode.FILE_UPLOAD_FAILED;
            this._emit(fileKey, FILE_FEEDBACK_EVENTS.CANCELLED, { item });
        }
    }

    /** 移除文件项 */
    remove(fileKey: string, itemId: string): void {
        const channel = this.channels.get(fileKey);
        if (!channel) return;

        const idx = channel.items.findIndex(i => i.id === itemId);
        if (idx < 0) return;

        const task = channel.activeTasks.get(itemId);
        if (task) {
            try {
                task.cancel('item removed');
            } catch (e) {
                /* ignore */
            }
            channel.activeTasks.delete(itemId);
        }

        const [item] = channel.items.splice(idx, 1);
        this._emit(fileKey, FILE_FEEDBACK_EVENTS.REMOVED, { item, index: idx });
    }

    /**
     * 下载文件
     *
     * 流程：emit DOWNLOAD_START → HttpClient.download → emit DOWNLOAD_PROGRESS →
     * 解析文件名（提供 > content-disposition > 生成）→ triggerDownload(blob) → emit DOWNLOADED
     *
     * 文件名优先级：
     *   1. 调用方显式提供的 fileName
     *   2. 响应头 content-disposition 中的文件名
     *   3. 自动生成：File_[yyyy-mm-dd]_[getId].[根据 MIME 类型提取的扩展名]
     */
    async download(
        fileKey: string,
        url: string,
        fileName?: string,
        options?: { headers?: Record<string, string>; domain?: string }
    ): Promise<void> {
        this._ensureChannel(fileKey);

        this._emit(fileKey, FILE_FEEDBACK_EVENTS.DOWNLOAD_START, { url, fileName });

        try {
            const client = new HttpClient(options?.domain);
            const task = client.download(
                url,
                (ev: ProgressEvent) => {
                    if (ev.lengthComputable) {
                        const percent = Math.round((ev.loaded / ev.total) * 100);
                        this._emit(fileKey, FILE_FEEDBACK_EVENTS.DOWNLOAD_PROGRESS, {
                            url,
                            percent,
                        });
                    }
                },
                { headers: options?.headers }
            );

            const channel = this.channels.get(fileKey)!;
            channel.activeTasks.set('__download__', { cancel: task.cancel });

            const context = await task.context;
            channel.activeTasks.delete('__download__');

            // 解析最终文件名（提供 > content-disposition > 生成）
            const resolvedName = this._resolveDownloadFileName(fileName, context);

            // 下载响应体即文件内容（Blob），triggerDownload 接收 Blob | string
            // context.data 类型为通用响应包装，下载场景实际为 Blob，经 unknown 中转
            triggerDownload(context.data as unknown as Blob, resolvedName);
            this._emit(fileKey, FILE_FEEDBACK_EVENTS.DOWNLOADED, {
                url,
                fileName: resolvedName,
                data: context.data,
            });
        } catch (err: any) {
            this._emit(fileKey, FILE_FEEDBACK_EVENTS.DOWNLOAD_ERROR, {
                url,
                error: KernelErrorCode.FILE_DOWNLOAD_FAILED,
                cause: err,
            });
        }
    }

    /**
     * 解析下载文件名
     *
     * 优先级：显式提供 > content-disposition > 自动生成
     * 自动生成格式：File_[yyyy-mm-dd]_[getId].[ext]
     * ext 由响应 MIME 类型经 MimeTypeRegistrar.getByMime 反查得到
     */
    private _resolveDownloadFileName(fileName: string | undefined, context: any): string {
        // 1. 显式提供的文件名
        if (fileName) return fileName;

        // 2. 响应头 content-disposition 中的文件名（由 ResponseAnalyzer 解析）
        if (context?.metadata?.fileName) return context.metadata.fileName;

        // 3. 自动生成：File_[yyyy-mm-dd]_[getId].[ext]
        const now = new Date();
        const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        // 从响应中提取 MIME 类型
        let contentType: string =
            context?.metadata?.contentType || context?.response?.headers?.['content-type'] || '';
        if (!contentType && context?.data instanceof Blob) {
            contentType = context.data.type;
        }

        const ext = contentType ? MimeTypeRegistrar.getInstance().getByMime(contentType) : '';
        const extPart = ext || 'bin';

        return `File_${date}_${getId('dl')}.${extPart}`;
    }

    // ──────────────────────────────────────────────
    // 内部：单文件上传
    // ──────────────────────────────────────────────

    private async _uploadSingle(fileKey: string, item: FileItem): Promise<void> {
        const channel = this.channels.get(fileKey);
        if (!channel) return;
        const { transport } = channel.config;
        if (!transport || !item.file) return;

        // 1. 哈希计算（可选，用于秒传校验和文件标识）
        if (transport.hashEnabled) {
            item.status = FileItemStatus.HASHING;
            item.percent = 0;
            this._emit(fileKey, FILE_FEEDBACK_EVENTS.HASH_START, { item });

            try {
                const hashTask = createFileHashTask(item.file, transport.hashAlgorithm ?? 'md5');
                hashTask.onProgress(snapshot => {
                    item.percent = Math.round((snapshot.progress ?? 0) * 50);
                    this._emit(fileKey, FILE_FEEDBACK_EVENTS.HASH_PROGRESS, {
                        item,
                        percent: item.percent,
                    });
                });
                await hashTask.start();
                const hashBuffer = await hashTask.result();
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                item.hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                this._emit(fileKey, FILE_FEEDBACK_EVENTS.HASH_COMPLETE, { item, hash: item.hash });
            } catch (err: any) {
                item.status = FileItemStatus.ERROR;
                item.error = KernelErrorCode.FILE_HASH_FAILED;
                this._emit(fileKey, FILE_FEEDBACK_EVENTS.UPLOAD_ERROR, {
                    item,
                    error: item.error,
                    cause: err,
                });
                return;
            }
        }

        // 2. 秒传校验（hash 存在且有 instantCheckUrl 时，询问服务器是否已存在）
        if (item.hash && transport.instantCheckUrl) {
            try {
                const client = new HttpClient(transport.domain);
                const checkTask = client.post(
                    transport.instantCheckUrl,
                    {
                        hash: item.hash,
                        fileName: item.name,
                        size: item.size,
                    },
                    { headers: transport.headers }
                );
                const checkCtx = await checkTask.context;
                if (checkCtx.data?.exists === true) {
                    item.status = FileItemStatus.UPLOADED;
                    item.result = checkCtx.data.result;
                    item.percent = 100;
                    this._emit(fileKey, FILE_FEEDBACK_EVENTS.UPLOADED, {
                        item,
                        result: item.result,
                    });
                    this._emit(fileKey, FILE_FEEDBACK_EVENTS.UPLOAD_PROGRESS, {
                        item,
                        percent: 100,
                    });
                    return;
                }
            } catch {
                // 秒传校验失败，降级为普通上传
            }
        }

        // 3. 分片上传（断点续传）
        if (transport.chunked && item.file) {
            item.status = FileItemStatus.UPLOADING;
            item.percent = 0;
            this._emit(fileKey, FILE_FEEDBACK_EVENTS.UPLOAD_START, { item });

            try {
                const uploader = new ChunkedUploader(item.file, {
                    url: transport.url,
                    chunkSize: transport.chunkSize,
                    mergeUrl: transport.mergeUrl,
                    headers: transport.headers,
                    domain: transport.domain,
                });

                uploader.onProgress(progress => {
                    item.percent = progress.percent;
                    this._emit(fileKey, FILE_FEEDBACK_EVENTS.UPLOAD_PROGRESS, {
                        item,
                        percent: item.percent,
                        chunked: true,
                        uploadedChunks: progress.uploadedChunks,
                        totalChunks: progress.totalChunks,
                    });
                });

                channel.activeTasks.set(item.id, { cancel: () => uploader.abort() });

                const result = await uploader.start();
                item.status = FileItemStatus.UPLOADED;
                item.result = result;
                item.percent = 100;
                this._emit(fileKey, FILE_FEEDBACK_EVENTS.UPLOADED, { item, result });
            } catch (err: any) {
                item.status = FileItemStatus.ERROR;
                item.error = KernelErrorCode.FILE_UPLOAD_FAILED;
                this._emit(fileKey, FILE_FEEDBACK_EVENTS.UPLOAD_ERROR, {
                    item,
                    error: item.error,
                    cause: err,
                });
            } finally {
                channel.activeTasks.delete(item.id);
            }
            return;
        }

        // 4. 直传（单文件 FormData 上传）
        item.status = FileItemStatus.UPLOADING;
        item.percent = 0;
        this._emit(fileKey, FILE_FEEDBACK_EVENTS.UPLOAD_START, { item });

        try {
            const client = new HttpClient(transport.domain);
            const formData = new FormData();
            formData.append('file', item.file);
            if (item.hash) {
                formData.append('hash', item.hash);
            }

            const task = client.upload(
                transport.url,
                formData,
                (ev: ProgressEvent) => {
                    if (ev.lengthComputable) {
                        item.percent = Math.round((ev.loaded / ev.total) * 100);
                        this._emit(fileKey, FILE_FEEDBACK_EVENTS.UPLOAD_PROGRESS, {
                            item,
                            percent: item.percent,
                        });
                    }
                },
                { headers: transport.headers }
            );

            channel.activeTasks.set(item.id, { cancel: task.cancel });

            const context = await task.context;
            item.status = FileItemStatus.UPLOADED;
            item.result = context.data;
            item.percent = 100;
            this._emit(fileKey, FILE_FEEDBACK_EVENTS.UPLOADED, { item, result: context.data });
        } catch (err: any) {
            item.status = FileItemStatus.ERROR;
            item.error = KernelErrorCode.FILE_UPLOAD_FAILED;
            this._emit(fileKey, FILE_FEEDBACK_EVENTS.UPLOAD_ERROR, {
                item,
                error: item.error,
                cause: err,
            });
        } finally {
            channel.activeTasks.delete(item.id);
        }
    }

    /** 检查通道内是否全部上传完成，是则 emit UPLOAD_COMPLETE */
    private _checkAllUploaded(fileKey: string): void {
        const channel = this.channels.get(fileKey);
        if (!channel || channel.items.length === 0) return;

        const allDone = channel.items.every(
            i => i.status === FileItemStatus.UPLOADED || i.status === FileItemStatus.ERROR
        );
        if (!allDone) return;

        const results = channel.items.map(i => ({
            file: i.file,
            result: i.result,
            error: i.error,
        }));
        this._emit(fileKey, FILE_FEEDBACK_EVENTS.UPLOAD_COMPLETE, { results });
    }

    // ──────────────────────────────────────────────
    // 内部：工具
    // ──────────────────────────────────────────────

    /** 获取通道，不存在则按默认配置创建 */
    private _ensureChannel(fileKey: string): FileChannelState {
        let channel = this.channels.get(fileKey);
        if (!channel) {
            channel = {
                config: { autoUpload: true },
                items: [],
                refCount: 0,
                activeTasks: new Map(),
                actionUnsubs: [],
            };
            this.channels.set(fileKey, channel);
            this._listenFileActions(fileKey);
        }
        return channel;
    }

    /**
     * 订阅通道的命令事件（组件 → 中心）
     *
     * 在 createChannel / _ensureChannel 时调用，destroyChannel 时清理。
     * 组件通过 FileEventBusAbility.fileEmit 发送命令，中心在此接收并执行。
     */
    private _listenFileActions(fileKey: string): void {
        const channel = this.channels.get(fileKey);
        if (!channel) return;

        const sub = (action: string, handler: (data: any) => void) => {
            const off = this.bus.fileOn(fileKey, action, handler);
            channel.actionUnsubs.push(off);
        };

        sub(FILE_ACTIONS.SELECT, (data: any) => {
            const files: File[] = Array.isArray(data?.files) ? data.files : [];
            this.addFiles(fileKey, files);
        });

        sub(FILE_ACTIONS.UPLOAD, () => {
            void this.upload(fileKey);
        });

        sub(FILE_ACTIONS.REMOVE, (data: any) => {
            if (data?.itemId) this.remove(fileKey, data.itemId);
        });

        sub(FILE_ACTIONS.CANCEL, (data: any) => {
            if (data?.itemId) this.cancel(fileKey, data.itemId);
        });

        sub(FILE_ACTIONS.DOWNLOAD, (data: any) => {
            if (data?.url) {
                void this.download(fileKey, data.url, data.fileName, data.options);
            }
        });

        sub(FILE_ACTIONS.CANCEL_DOWNLOAD, () => {
            const task = channel.activeTasks.get('__download__');
            if (task) {
                try {
                    task.cancel('user cancelled download');
                } catch (e) {
                    /* ignore */
                }
                channel.activeTasks.delete('__download__');
            }
        });

        sub(FILE_ACTIONS.SET_ITEMS, (data: any) => {
            if (Array.isArray(data?.items)) this.setItems(fileKey, data.items);
        });

        sub(FILE_ACTIONS.CLEAR, () => {
            this.clear(fileKey);
            this._emit(fileKey, FILE_FEEDBACK_EVENTS.REMOVED, {
                item: null,
                index: -1,
                cleared: true,
            });
        });
    }

    private _generateFileId(): string {
        return `file-${++this.fileIdCounter}-${Date.now()}`;
    }

    /** 构建并广播文件反馈事件 */
    private _emit(fileKey: string, action: string, data: any): void {
        this.bus.fileEmit(
            EventContextBuilder.create()
                .withEvent(`file:${fileKey}:${action}`)
                .withType(action)
                .withSource(fileKey)
                .withSourceType('FileDispatchCenter')
                .withData(data)
                .withBusId(this.bus.getScopeId())
                .build()
        );
    }
}

export const fileDispatchCenter = FileDispatchCenter.getInstance();
