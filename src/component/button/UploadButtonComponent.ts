/**
 * UploadButtonComponent 上传按钮组件
 *
 * 从 ButtonComponent 派生，点击按钮触发文件选择。薄组件，仅负责：
 * - 隐藏 input 与点击交互
 * - 文件列表渲染（setNodeHtml + 事件委托，符合 CommonPropsAbility 约定）
 * - 订阅 FileEventBus 反馈并转发到组件/桥接通道
 *
 * 上传/下载/校验/哈希/状态管理全部委托给 FileDispatchCenter（单例，按 fileKey 持有队列）。
 * 多个组件共享同一 fileKey 可观察同一队列（如拖拽上传区 + 文件列表）。
 *
 * 事件（保留向后兼容，订阅 FileEventBus 后转发）：
 * - select / uploadProgress / uploaded / uploadError / uploadComplete / remove
 * 通过 on(name, cb) 监听；若设置 eventKey，同时经 componentEmit 转发到 ComponentEventBus。
 *
 * @example
 * new UploadButtonComponent({ fileKey: 'avatars', transport: { url: '/api/upload', hashEnabled: true }, accept: 'image/*', multiple: true })
 * new UploadButtonComponent({ fileKey: 'docs', transport: { url: '/api/upload' }, eventKey: 'docUpload' })
 * uploadBtn.on('uploaded', ({ file, result }) => { ... })
 * bus.componentOn('docUpload', 'uploaded', (data) => { ... })
 */

import { ButtonComponent } from './ButtonComponent';
import { fileDispatchCenter } from '@/file/FileDispatchCenter';
import { FILE_ACTIONS, FILE_FEEDBACK_EVENTS } from '@/events/file-events';
import { EventContextBuilder } from '@/context';
import { formatFileSize, formatFileStatus } from '@/file/format';
import { FileItemStatus, type FileTransportConfig, type FileItem } from '@/file/types';

export type { FileItemStatus, FileTransportConfig, FileItem };

export interface UploadButtonProps {
    text?: string;
    /** 文件通道标识（必填），多个组件共享同一 fileKey 可观察同一队列 */
    fileKey: string;
    /** 组件事件 key，设置后反馈事件经 componentEmit 转发到 ComponentEventBus */
    eventKey?: string;
    transport?: FileTransportConfig;
    accept?: string;
    multiple?: boolean;
    maxSize?: number;
    disabled?: boolean;
    autoUpload?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

/** 反馈事件 → 组件 emit 事件名 映射（保留向后兼容） */
const FEEDBACK_TO_EMIT: Record<string, string> = {
    [FILE_FEEDBACK_EVENTS.SELECTED]: 'select',
    [FILE_FEEDBACK_EVENTS.UPLOAD_PROGRESS]: 'uploadProgress',
    [FILE_FEEDBACK_EVENTS.UPLOADED]: 'uploaded',
    [FILE_FEEDBACK_EVENTS.UPLOAD_ERROR]: 'uploadError',
    [FILE_FEEDBACK_EVENTS.UPLOAD_COMPLETE]: 'uploadComplete',
    [FILE_FEEDBACK_EVENTS.REMOVED]: 'remove',
};

export let UploadButtonComponent = ButtonComponent.replace({
    tplReplaces: {
        // 复用按钮模板中未使用的 dropIcon 槽位，替换为文件列表容器
        dropIcon: {
            tag: 'div',
            name: 'list',
            cls: 'q-upload-btn__list',
        },
    },

    body: {
        _fileKey: '' as string,
        _transport: null as FileTransportConfig | null,
        _accept: '' as string,
        _multiple: false as boolean,
        _maxSize: 0 as number,
        _fileDisabled: false as boolean,
        _autoUpload: true as boolean,
        _inputEl: null as HTMLInputElement | null,
        _itemsMap: null as Map<string, FileItem> | null,
        _listClickBound: false as boolean,

        nodes: {
            root: { addCls: 'q-upload-btn' },
        },

        onAfterInit(props?: UploadButtonProps): void {
            const self = this as any;
            self._initUploadButton(props);
        },

        onBeforeDispose(): void {
            const self = this as any;
            // 反馈事件订阅由 FileEventBusAbility 的 onCleanup 自动清理，无需手动 unsub

            if (self._listClickBound) {
                const listEl = self._resolveNodeEl?.('list');
                if (listEl) listEl.removeEventListener('click', self._onListClick);
                self._listClickBound = false;
            }

            // 通道生命周期：直接调用（与 EntityDispatchCenter.connect 同理）
            if (self._fileKey) {
                fileDispatchCenter.disconnect(self._fileKey);
            }
        },

        _initUploadButton(props?: UploadButtonProps): void {
            const self = this as any;

            if (props?.fileKey) self._fileKey = props.fileKey;
            if (props?.eventKey) self.eventKey = props.eventKey;
            if (props?.transport) self._transport = props.transport;
            if (props?.accept) self._accept = props.accept;
            if (props?.multiple) self._multiple = true;
            if (props?.maxSize) self._maxSize = props.maxSize;
            if (props?.disabled) self._fileDisabled = true;
            if (props?.autoUpload !== undefined) self._autoUpload = props.autoUpload;

            self._createFileInput();

            // 本地状态镜像（由反馈事件维护，组件不直接读调度中心）
            self._itemsMap = new Map();

            // 通道生命周期：直接调用（createChannel 时中心注册命令监听）
            fileDispatchCenter.createChannel(self._fileKey, {
                transport: self._transport ?? undefined,
                accept: self._accept || undefined,
                multiple: self._multiple,
                maxSize: self._maxSize || undefined,
                autoUpload: self._autoUpload,
            });
            fileDispatchCenter.connect(self._fileKey);

            // 订阅反馈事件（经 FileEventBusAbility，onCleanup 自动清理）
            self._subscribeFeedback();

            // 事件委托：list 上的 remove 按钮
            self._onListClick = self._onListClick.bind(self);
            const listEl = self._resolveNodeEl('list');
            if (listEl) {
                listEl.addEventListener('click', self._onListClick);
                self._listClickBound = true;
            }

            self._applyFileState();
            self._renderList();
        },

        _createFileInput(): void {
            const self = this as any;
            // 隐藏 input 是功能性元素，需 programmatic click()，保留 createElement
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
                // 命令经 FileEventBusAbility 发送：中心监听 SELECT 校验并入队
                self._fileCmd(FILE_ACTIONS.SELECT, { files: Array.from(files) });
                input.value = '';
            });
        },

        onBtnClick(): void {
            const self = this as any;
            if (self._fileDisabled) return;
            self._inputEl?.click();
        },

        /** 构建并发送文件命令事件（经 FileEventBusAbility） */
        _fileCmd(action: string, data: any): void {
            const self = this as any;
            self.fileEmit(
                EventContextBuilder.create()
                    .withEvent(`file:${self._fileKey}:${action}`)
                    .withType(action)
                    .withSource(self._fileKey)
                    .withSourceType('UploadButton')
                    .withData(data)
                    .build()
            );
        },

        /** 订阅 FileEventBus 反馈事件（经 FileEventBusAbility，onCleanup 自动清理） */
        _subscribeFeedback(): void {
            const self = this as any;
            const key = self._fileKey;
            const events = [
                FILE_FEEDBACK_EVENTS.SELECTED,
                FILE_FEEDBACK_EVENTS.HASH_START,
                FILE_FEEDBACK_EVENTS.HASH_PROGRESS,
                FILE_FEEDBACK_EVENTS.HASH_COMPLETE,
                FILE_FEEDBACK_EVENTS.UPLOAD_START,
                FILE_FEEDBACK_EVENTS.UPLOAD_PROGRESS,
                FILE_FEEDBACK_EVENTS.UPLOADED,
                FILE_FEEDBACK_EVENTS.UPLOAD_ERROR,
                FILE_FEEDBACK_EVENTS.UPLOAD_COMPLETE,
                FILE_FEEDBACK_EVENTS.REMOVED,
                FILE_FEEDBACK_EVENTS.CANCELLED,
            ];

            for (const action of events) {
                // self.fileOn 来自 FileEventBusAbility，返回的 off 经 onCleanup 自动注册
                self.fileOn(key, action, (data: any) => {
                    self._applyFeedback(action, data);
                    self._renderList();
                    self._forward(action, data);
                });
            }
        },

        /** 根据反馈事件更新本地状态镜像 _itemsMap */
        _applyFeedback(action: string, data: any): void {
            const self = this as any;
            const map: Map<string, FileItem> = self._itemsMap;
            if (!map) return;

            if (action === FILE_FEEDBACK_EVENTS.SELECTED && Array.isArray(data?.items)) {
                for (const it of data.items) map.set(it.id, it);
            } else if (action === FILE_FEEDBACK_EVENTS.REMOVED) {
                if (data?.cleared) {
                    map.clear();
                } else if (data?.item?.id) {
                    map.delete(data.item.id);
                }
            } else if (data?.item?.id) {
                // HASH_* / UPLOAD_* / UPLOADED / CANCELLED 等单项状态变更
                map.set(data.item.id, data.item);
            }
        },

        /** 转发反馈到组件 emit + 桥接通道（保留向后兼容） */
        _forward(action: string, data: any): void {
            const self = this as any;
            const emitName = FEEDBACK_TO_EMIT[action];
            if (!emitName) return;

            self.emit(emitName, data);

            if (self.eventKey && typeof self.componentEmit === 'function') {
                const ctx = EventContextBuilder.create()
                    .withEvent(emitName)
                    .withType(emitName)
                    .withSource(self.eventKey)
                    .withSourceType('UploadButton')
                    .withData(data)
                    .build();
                self.componentEmit(ctx);
            }
        },

        /** list 上的点击委托：移除按钮 → 发送 REMOVE 命令事件 */
        _onListClick(e: Event): void {
            const self = this as any;
            const target = e.target as HTMLElement | null;
            const removeEl = target?.closest('.q-upload-btn__remove') as HTMLElement | null;
            if (!removeEl) return;
            e.stopPropagation();
            const itemId = removeEl.dataset.itemId;
            if (itemId) {
                self._fileCmd(FILE_ACTIONS.REMOVE, { itemId });
            }
        },

        /** 渲染文件列表（setNodeHtml，符合 CommonPropsAbility 约定；数据来自本地镜像） */
        _renderList(): void {
            const self = this as any;
            const map: Map<string, FileItem> = self._itemsMap;
            if (!map) return;
            const items = [...map.values()];
            const html = items.map(item => self._renderItem(item)).join('');
            self.setNodeHtml(html, 'list');
        },

        _renderItem(item: FileItem): string {
            const statusCls = `q-upload-btn__item--${item.status}`;
            const name = escapeHtml(item.name);
            const size = formatFileSize(item.size);
            const status = formatFileStatus(item);

            if (item.status === FileItemStatus.UPLOADING || item.status === FileItemStatus.HASHING) {
                return (
                    `<div class="q-upload-btn__item ${statusCls}">` +
                    `<span class="q-upload-btn__name">${name}</span>` +
                    `<span class="q-upload-btn__size">${size}</span>` +
                    `<span class="q-upload-btn__status">${escapeHtml(status)}</span>` +
                    `<div class="q-upload-btn__progress">` +
                    `<div class="q-upload-btn__progress-bar" style="width:${item.percent}%"></div>` +
                    `</div>` +
                    `</div>`
                );
            }

            const removeHtml =
                item.status === FileItemStatus.UPLOADED || item.status === FileItemStatus.SELECTED
                    ? `<span class="q-upload-btn__remove" data-item-id="${item.id}">×</span>`
                    : '';

            return (
                `<div class="q-upload-btn__item ${statusCls}">` +
                `<span class="q-upload-btn__name">${name}</span>` +
                `<span class="q-upload-btn__size">${size}</span>` +
                `<span class="q-upload-btn__status">${escapeHtml(status)}</span>` +
                removeHtml +
                `</div>`
            );
        },

        _applyFileState(): void {
            const self = this as any;
            self.toggleCls('q-upload-btn--disabled', self._fileDisabled);
        },

        get files(): FileItem[] {
            const map: Map<string, FileItem> | null = (this as any)._itemsMap;
            return map ? [...map.values()] : [];
        },

        get uploadedFiles(): FileItem[] {
            const map: Map<string, FileItem> | null = (this as any)._itemsMap;
            return map
                ? [...map.values()].filter(i => i.status === FileItemStatus.UPLOADED)
                : [];
        },

        /**
         * 默认事件数据 — getter，replace 模式下 super 不可用，
         * 沿原型链查找父类 defaultEventData getter 并合并
         */
        get defaultEventData(): Record<string, any> {
            const self = this as any;
            const map: Map<string, FileItem> = self._itemsMap;
            // replace 模式下 super 不可用，沿原型链查找父类 defaultEventData getter
            let proto = Object.getPrototypeOf(Object.getPrototypeOf(self));
            let base: Record<string, any> = {};
            while (proto) {
                const desc = Object.getOwnPropertyDescriptor(proto, 'defaultEventData');
                if (desc?.get) {
                    base = desc.get.call(self);
                    break;
                }
                proto = Object.getPrototypeOf(proto);
            }
            return { ...base, files: map ? [...map.values()] : [] };
        },

        getFormValue(): any {
            const self = this as any;
            const map: Map<string, FileItem> = self._itemsMap;
            if (!map) return [];
            return [...map.values()]
                .filter(i => i.status === FileItemStatus.UPLOADED)
                .map(i => i.result);
        },

        setFormValue(v: any): void {
            if (!Array.isArray(v)) return;
            const self = this as any;
            const items: FileItem[] = v.map((item: any) => ({
                id: item.id ?? `formval-${Math.random().toString(36).slice(2)}`,
                file: null,
                name: item.name ?? '',
                size: item.size ?? 0,
                status: FileItemStatus.UPLOADED,
                percent: 100,
                result: item,
            }));
            // 经命令事件回填：中心 SET_ITEMS 后会发 SELECTED 反馈，_itemsMap 据此更新
            self._fileCmd(FILE_ACTIONS.SET_ITEMS, { items });
            // 同步本地镜像（反馈事件可能异步到达，先本地落位保证即时渲染）
            if (self._itemsMap) {
                self._itemsMap.clear();
                for (const it of items) self._itemsMap.set(it.id, it);
            }
            self._renderList();
        },

        formReset(): void {
            const self = this as any;
            // 经命令事件清空：中心 CLEAR 后会发 REMOVED(cleared) 反馈
            self._fileCmd(FILE_ACTIONS.CLEAR, {});
            if (self._itemsMap) self._itemsMap.clear();
            self._renderList();
        },

        update(props?: Partial<UploadButtonProps>): void {
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
            if (props?.eventKey !== undefined) self.eventKey = props.eventKey;

            // 配置变更，幂等更新通道配置
            if (self._fileKey) {
                fileDispatchCenter.createChannel(self._fileKey, {
                    transport: self._transport ?? undefined,
                    accept: self._accept || undefined,
                    multiple: self._multiple,
                    maxSize: self._maxSize || undefined,
                    autoUpload: self._autoUpload,
                });
            }
        },
    },
});

/** 转义 HTML 防注入 */
function escapeHtml(str: string): string {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export type UploadButtonComponent = InstanceType<typeof UploadButtonComponent>;
