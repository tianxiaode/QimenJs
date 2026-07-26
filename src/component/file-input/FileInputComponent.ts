/**
 * FileInputComponent 文件输入组件
 *
 * 从 ButtonComponent 派生，点击按钮触发文件选择。
 *
 * 双模式上传：
 * - 实体模式：entityKey → entityEmit('upload') → mgr 执行上传
 *   事件走实体通道，外部通过 entityOn 监听
 * - 直传模式：transport: { url } → HttpClient.upload() 直接上传
 *   事件走桥接通道（有 eventKey 时 bridgeEmit）或组件通道（on 监听）
 *
 * tplEvents 事件发布规则：
 * - btn click → handler:true（内部处理选文件）+ emits:['select'] + bridges:['select']
 * - 有 eventKey 时自动走 bridgeEmit，无 eventKey 时只走 emit
 *
 * 支持 hashEnabled 开关，开启后先计算文件哈希再上传（秒传/断点续传）。
 * 文件类型校验通过 MimeTypeRegistrar 与 accept 配置对照。
 *
 * @example
 * new FileInputComponent({ entityKey: 'attachments', text: '上传附件' })
 * new FileInputComponent({ transport: { url: '/api/upload' }, text: '选择文件' })
 * new FileInputComponent({ eventKey: 'avatarUpload', transport: { url: '/api/upload', hashEnabled: true } })
 * fileInput.on('select', ({ files }) => { ... })
 * bridge.bridgeOn('avatarUpload', 'select', (data) => { ... })
 */

import { ButtonComponent } from '../button/ButtonComponent';
import { EntityEventBus } from '@/events/EntityEventBus';
import {
    ENTITY_CRUD_EVENTS,
    ENTITY_UPLOAD_EVENTS,
    ENTITY_REQUEST_STATUS,
    buildRequestEvent,
} from '@/events/entity-events';
import { EventContextBuilder } from '@/context';
import { HttpClient } from '@/http/HttpClient';
import { KernelErrorCode } from '@/error';
import { MimeTypeRegistrar } from '@/mime';
import { createHashTask } from '@/task/hash-task';
import { FileItemStatus, type FileTransportConfig, type FileItem } from './types';

export type { FileItemStatus, FileTransportConfig, FileItem };

export interface FileInputProps {
    text?: string;
    entityKey?: string;
    eventKey?: string;
    transport?: FileTransportConfig;
    accept?: string;
    multiple?: boolean;
    maxSize?: number;
    disabled?: boolean;
    autoUpload?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

let fileIdCounter = 0;

function generateFileId(): string {
    return `file-${++fileIdCounter}-${Date.now()}`;
}

function parseAcceptExts(accept: string): string[] {
    return accept
        .split(',')
        .map(s => s.trim().toLowerCase())
        .filter(s => s.length > 0);
}

function isFileTypeAllowed(file: File, accept: string): boolean {
    if (!accept) return true;

    const exts = parseAcceptExts(accept);
    const fileName = file.name.toLowerCase();
    const fileExt = fileName.includes('.') ? fileName.split('.').pop()! : '';
    const mimeReg = MimeTypeRegistrar.getInstance();

    for (const pattern of exts) {
        if (pattern.startsWith('.')) {
            if (fileExt === pattern.slice(1)) return true;
        } else if (pattern.includes('/')) {
            if (file.type === pattern) return true;
            const allowedExts = mimeReg.getByMime(pattern);
            if (allowedExts && fileExt === allowedExts) return true;
        } else if (pattern === '*' || pattern === '*/*') {
            return true;
        } else {
            const mimes = mimeReg.get(pattern);
            if (mimes.length > 0 && mimes.includes(file.type)) return true;
        }
    }

    return false;
}

export let FileInputComponent = ButtonComponent.replace({
    type: 'FileInput',

    tplEvents: {
        btn: {
            click: {
                handler: true,
                emits: ['select'],
                bridges: ['select'],
            },
        },
    },

    body: {
        nodes: {
            root: { addCls: 'q-file-input' },
        },

        onInitState() {
            const self = this as any;
            const state = self._super.onInitState();
            return {
                ...state,
                _entityKey: '' as string,
                _transport: null as FileTransportConfig | null,
                _accept: '' as string,
                _multiple: false,
                _maxSize: 0,
                _fileDisabled: false,
                _autoUpload: true,
                _fileItems: [] as FileItem[],
                _inputEl: null as HTMLInputElement | null,
                _entityUnsubs: [] as (() => void)[],
            };
        },

        onAfterInit(props?: FileInputProps): void {
            const self = this as any;
            self._initFileInput(props);
        },

        onBeforeDispose(): void {
            const self = this as any;
            for (const off of self._entityUnsubs) {
                if (typeof off === 'function') off();
            }
            self._entityUnsubs = [];
        },

        _initFileInput(props?: FileInputProps): void {
            const self = this as any;

            if (props?.entityKey) self._entityKey = props.entityKey;
            if (props?.eventKey) self.eventKey = props.eventKey;
            if (props?.transport) self._transport = props.transport;
            if (props?.accept) self._accept = props.accept;
            if (props?.multiple) self._multiple = true;
            if (props?.maxSize) self._maxSize = props.maxSize;
            if (props?.disabled) self._fileDisabled = true;
            if (props?.autoUpload !== undefined) self._autoUpload = props.autoUpload;

            self._createFileInput();

            if (self._entityKey) {
                self._initEntityFileListeners();
            }

            self._applyFileState();
        },

        _createFileInput(): void {
            const self = this as any;
            const input = document.createElement('input');
            input.type = 'file';
            input.style.display = 'none';
            if (self._accept) input.accept = self._accept;
            if (self._multiple) input.multiple = true;
            if (self._fileDisabled) input.disabled = true;
            self._inputEl = input;
            self.el.appendChild(input);

            input.addEventListener('change', () => {
                const files = input.files;
                if (!files || files.length === 0) return;
                self._handleFiles(Array.from(files));
                input.value = '';
            });
        },

        onBtnClick(): void {
            const self = this as any;
            if (self._fileDisabled) return;
            self._inputEl?.click();
        },

        _initEntityFileListeners(): void {
            const self = this as any;
            const bus = EntityEventBus.getInstance();
            const key = self._entityKey;

            const offCreated = bus.entityOn(key, ENTITY_CRUD_EVENTS.CREATED, (data: any) => {
                self._onEntityFileCreated(data);
            });
            self._entityUnsubs.push(offCreated);

            const offProgress = bus.entityOn(key, ENTITY_UPLOAD_EVENTS.PROGRESS, (data: any) => {
                self._onEntityFileProgress(data);
            });
            self._entityUnsubs.push(offProgress);

            const offError = bus.entityOn(
                key,
                buildRequestEvent('upload', ENTITY_REQUEST_STATUS.ERROR),
                (data: any) => {
                    self._onEntityFileError(data);
                }
            );
            self._entityUnsubs.push(offError);
        },

        _handleFiles(files: File[]): void {
            const self = this as any;

            for (const file of files) {
                if (self._accept && !isFileTypeAllowed(file, self._accept)) {
                    self.error = KernelErrorCode.FILE_TYPE_MISMATCH;
                    continue;
                }

                if (self._maxSize && file.size > self._maxSize) {
                    self.error = KernelErrorCode.FILE_SIZE_EXCEEDED;
                    continue;
                }

                const item: FileItem = {
                    id: generateFileId(),
                    file,
                    name: file.name,
                    size: file.size,
                    status: FileItemStatus.SELECTED,
                    percent: 0,
                };

                self._fileItems.push(item);
            }

            self._renderFileList();

            if (self._autoUpload) {
                self.upload();
            }
        },

        async upload(): Promise<void> {
            const self = this as any;
            const pending = self._fileItems.filter(
                (i: FileItem) =>
                    i.status === FileItemStatus.SELECTED || i.status === FileItemStatus.ERROR
            );

            for (const item of pending) {
                await self._uploadSingleFile(item);
            }
        },

        async _uploadSingleFile(item: FileItem): Promise<void> {
            const self = this as any;

            if (self._transport?.hashEnabled) {
                item.status = FileItemStatus.HASHING;
                self._renderFileList();
                try {
                    const hashTask = createHashTask(item.file, 'sha256');
                    hashTask.onProgress(snapshot => {
                        item.percent = Math.round((snapshot.progress ?? 0) * 50);
                        self._renderFileList();
                    });
                    await hashTask.start();
                    const hashBuffer = await hashTask.result();
                    const hashArray = Array.from(new Uint8Array(hashBuffer));
                    item.hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                } catch (err: any) {
                    item.status = FileItemStatus.ERROR;
                    item.error = KernelErrorCode.FILE_HASH_FAILED;
                    self._renderFileList();
                    self._bridgeOrEmit('uploadError', {
                        file: item.file,
                        error: item.error,
                        cause: err,
                    });
                    return;
                }
            }

            if (self._entityKey) {
                self._uploadViaEntity(item);
            } else if (self._transport) {
                await self._uploadDirect(item);
            }
        },

        _uploadViaEntity(item: FileItem): void {
            const self = this as any;
            const bus = EntityEventBus.getInstance();

            item.status = FileItemStatus.UPLOADING;
            item.percent = 0;
            self._renderFileList();

            const ctx = EventContextBuilder.create()
                .withEvent(`entity:${self._entityKey}:upload`)
                .withType('upload')
                .withSource(self._entityKey)
                .withSourceType('FileInput')
                .withData({
                    file: item.file,
                    fileId: item.id,
                    hash: item.hash,
                    fileName: item.name,
                    fileSize: item.size,
                })
                .withBusId(bus.getScopeId())
                .build();

            bus.entityEmit(ctx);
        },

        async _uploadDirect(item: FileItem): Promise<void> {
            const self = this as any;
            if (!self._transport) return;

            item.status = FileItemStatus.UPLOADING;
            self._renderFileList();

            try {
                const client = new HttpClient(self._transport.domain);
                const formData = new FormData();
                formData.append('file', item.file);
                if (item.hash) {
                    formData.append('hash', item.hash);
                }

                const task = client.upload(
                    self._transport.url,
                    formData,
                    (ev: ProgressEvent) => {
                        if (ev.lengthComputable) {
                            item.percent = Math.round((ev.loaded / ev.total) * 100);
                            self._renderFileList();
                            self._bridgeOrEmit('uploadProgress', {
                                file: item.file,
                                percent: item.percent,
                            });
                        }
                    },
                    { headers: self._transport.headers }
                );

                const context = await task.context;
                item.status = FileItemStatus.UPLOADED;
                item.result = context.data;
                item.percent = 100;
                self._renderFileList();
                self._bridgeOrEmit('uploaded', { file: item.file, result: context.data });
                self._checkAllUploaded();
            } catch (err: any) {
                item.status = FileItemStatus.ERROR;
                item.error = KernelErrorCode.FILE_UPLOAD_FAILED;
                self._renderFileList();
                self._bridgeOrEmit('uploadError', { file: item.file, error: item.error });
            }
        },

        _bridgeOrEmit(eventName: string, data: any): void {
            const self = this as any;
            self.emit(eventName, data);

            if (self.eventKey && typeof self.bridgeEmit === 'function') {
                const ctx = EventContextBuilder.create()
                    .withEvent(eventName)
                    .withType(eventName)
                    .withSource(self.eventKey)
                    .withSourceType('FileInput')
                    .withData(data)
                    .build();
                self.bridgeEmit(ctx);
            }
        },

        _onEntityFileCreated(data: any): void {
            const self = this as any;
            const item = self._fileItems.find((i: FileItem) => i.id === data?.fileId);
            if (!item) return;

            item.status = FileItemStatus.UPLOADED;
            item.result = data;
            item.percent = 100;
            self._renderFileList();
            self._checkAllUploaded();
        },

        _onEntityFileProgress(data: any): void {
            const self = this as any;
            const item = self._fileItems.find((i: FileItem) => i.id === data?.fileId);
            if (!item) return;

            item.status = FileItemStatus.UPLOADING;
            item.percent = data?.percent ?? 0;
            self._renderFileList();
        },

        _onEntityFileError(data: any): void {
            const self = this as any;
            const item = self._fileItems.find((i: FileItem) => i.id === data?.fileId);
            if (!item) return;

            item.status = FileItemStatus.ERROR;
            item.error = data?.error ?? KernelErrorCode.FILE_UPLOAD_FAILED;
            self._renderFileList();
        },

        _checkAllUploaded(): void {
            const self = this as any;
            const allDone = self._fileItems.every(
                (i: FileItem) =>
                    i.status === FileItemStatus.UPLOADED || i.status === FileItemStatus.ERROR
            );
            if (allDone && self._fileItems.length > 0) {
                const results = self._fileItems.map((i: FileItem) => ({
                    file: i.file,
                    result: i.result,
                    error: i.error,
                }));
                self._bridgeOrEmit('uploadComplete', { results });
            }
        },

        _removeFile(index: number): void {
            const self = this as any;
            const item = self._fileItems[index];
            if (!item) return;

            self._fileItems.splice(index, 1);
            self._renderFileList();
            self._bridgeOrEmit('remove', { file: item.file, index });
        },

        _renderFileList(): void {
            const self = this as any;
            let listEl = self.el.querySelector('.q-file-input__list') as HTMLElement | null;
            if (!listEl) {
                listEl = document.createElement('div');
                listEl.className = 'q-file-input__list';
                self.el.appendChild(listEl);
            }

            listEl.innerHTML = '';

            for (let i = 0; i < self._fileItems.length; i++) {
                const item = self._fileItems[i] as FileItem;
                const row = document.createElement('div');
                row.className = `q-file-input__item q-file-input__item--${item.status}`;

                const name = document.createElement('span');
                name.className = 'q-file-input__name';
                name.textContent = item.name;

                const size = document.createElement('span');
                size.className = 'q-file-input__size';
                size.textContent = self._formatSize(item.size);

                const status = document.createElement('span');
                status.className = 'q-file-input__status';
                status.textContent = self._statusText(item);

                if (
                    item.status === FileItemStatus.UPLOADING ||
                    item.status === FileItemStatus.HASHING
                ) {
                    const progress = document.createElement('div');
                    progress.className = 'q-file-input__progress';
                    const bar = document.createElement('div');
                    bar.className = 'q-file-input__progress-bar';
                    bar.style.width = `${item.percent}%`;
                    progress.appendChild(bar);
                    row.appendChild(name);
                    row.appendChild(size);
                    row.appendChild(status);
                    row.appendChild(progress);
                } else {
                    const remove = document.createElement('span');
                    remove.className = 'q-file-input__remove';
                    remove.dataset.index = String(i);
                    remove.textContent = '×';
                    remove.addEventListener('click', (e: Event) => {
                        e.stopPropagation();
                        self._removeFile(i);
                    });

                    row.appendChild(name);
                    row.appendChild(size);
                    row.appendChild(status);
                    row.appendChild(remove);
                }

                listEl.appendChild(row);
            }
        },

        _formatSize(bytes: number): string {
            if (bytes < 1024) return `${bytes} B`;
            if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
            return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        },

        _statusText(item: FileItem): string {
            switch (item.status) {
                case FileItemStatus.SELECTED:
                    return '待上传';
                case FileItemStatus.HASHING:
                    return `计算中 ${item.percent}%`;
                case FileItemStatus.UPLOADING:
                    return `${item.percent}%`;
                case FileItemStatus.UPLOADED:
                    return '已完成';
                case FileItemStatus.ERROR:
                    return item.error ?? KernelErrorCode.FILE_UPLOAD_FAILED;
                default:
                    return '';
            }
        },

        _applyFileState(): void {
            const self = this as any;
            self.toggleCls('q-file-input--disabled', self._fileDisabled);
        },

        get files(): FileItem[] {
            return (this as any)._fileItems;
        },

        get uploadedFiles(): FileItem[] {
            return (this as any)._fileItems.filter(
                (i: FileItem) => i.status === FileItemStatus.UPLOADED
            );
        },

        getFormValue(): any {
            const self = this as any;
            return self._fileItems
                .filter((i: FileItem) => i.status === FileItemStatus.UPLOADED)
                .map((i: FileItem) => i.result?.id ?? i.id);
        },

        setFormValue(v: any): void {
            if (!Array.isArray(v)) return;
            const self = this as any;
            self._fileItems = v.map((item: any) => ({
                id: item.id ?? generateFileId(),
                file: null,
                name: item.name ?? '',
                size: item.size ?? 0,
                status: FileItemStatus.UPLOADED,
                percent: 100,
                result: item,
            }));
            self._renderFileList();
        },

        formReset(): void {
            const self = this as any;
            self._fileItems = [];
            self._renderFileList();
        },

        getEventData(nodeName: string, eventName: string, eventType: string): Record<string, any> {
            return { files: (this as any)._fileItems };
        },

        update(props?: Partial<FileInputProps>): void {
            const self = this as any;
            self._super.update(props);

            if (props?.accept !== undefined) {
                self._accept = props.accept;
                if (self._inputEl) self._inputEl.accept = props.accept;
            }
            if (props?.multiple !== undefined) {
                self._multiple = props.multiple;
                if (self._inputEl) self._inputEl.multiple = props.multiple;
            }
            if (props?.disabled !== undefined) {
                self._fileDisabled = props.disabled;
                self._applyFileState();
                if (self._inputEl) self._inputEl.disabled = props.disabled;
            }
            if (props?.maxSize !== undefined) self._maxSize = props.maxSize;
            if (props?.autoUpload !== undefined) self._autoUpload = props.autoUpload;
            if (props?.transport !== undefined) self._transport = props.transport;
            if (props?.entityKey !== undefined) {
                self._entityKey = props.entityKey;
                if (props.entityKey) self._initEntityFileListeners();
            }
            if (props?.eventKey !== undefined) self.eventKey = props.eventKey;
        },
    },
});

export type FileInputComponent = InstanceType<typeof FileInputComponent>;
