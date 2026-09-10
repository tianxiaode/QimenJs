/**
 * UploadButtonComponent 上传按钮组件
 *
 * 点击按钮触发文件选择。薄组件，仅负责：
 * - 隐藏 input 与点击交互
 * - 文件列表渲染（setNodeHtml + 事件委托，符合 CommonPropsAbility 约定）
 * - 订阅 FileEventBus 反馈并转发到组件/桥接通道
 *
 * 上传/下载/校验/哈希/状态管理全部委托给 FileDispatchCenter（单例，按 fileKey 持有队列）。
 * 多个组件共享同一 fileKey 可观察同一队列（如拖拽上传区 + 文件列表）。
 *
 * 事件（订阅 FileEventBus 后转发）：
 * - select / uploadProgress / uploaded / uploadError / uploadComplete / remove
 * 通过 on(name, cb) 监听；若设置 eventKey，同时经 componentEmit 转发到 ComponentEventBus。
 *
 * @example
 * new UploadButtonComponent({ fileKey: 'avatars', transport: { url: '/api/upload', hashEnabled: true }, accept: 'image/*', multiple: true })
 * new UploadButtonComponent({ fileKey: 'docs', transport: { url: '/api/upload' }, eventKey: 'docUpload' })
 * uploadBtn.on('uploaded', ({ file, result }) => { ... })
 * bus.componentOn('docUpload', 'uploaded', (data) => { ... })
 */

import { Component } from '@qimenjs/component-core';
import type { TplNode } from '@qimenjs/component-core';
import {
    fileDispatchCenter,
    formatFileSize,
    formatFileStatus,
    FileItemStatus,
    type FileTransportConfig,
    type FileItem,
} from '@/file';
import { Definitions } from '@/composable';

import { FILE_ACTIONS, FILE_FEEDBACK_EVENTS } from '@/events';
import { UPLOAD_BUTTON_TPL } from './upload-button-tpl';

/** 反馈事件 → 组件 emit 事件名 映射 */
const FEEDBACK_TO_EMIT: Record<string, string> = {
    [FILE_FEEDBACK_EVENTS.SELECTED]: 'select',
    [FILE_FEEDBACK_EVENTS.UPLOAD_PROGRESS]: 'uploadProgress',
    [FILE_FEEDBACK_EVENTS.UPLOADED]: 'uploaded',
    [FILE_FEEDBACK_EVENTS.UPLOAD_ERROR]: 'uploadError',
    [FILE_FEEDBACK_EVENTS.UPLOAD_COMPLETE]: 'uploadComplete',
    [FILE_FEEDBACK_EVENTS.REMOVED]: 'remove',
};

const UploadButtonComponentDefs: Definitions = {
    options: {
        fileKey: '',
        transport: null,
        accept: '',
        multiple: false,
        maxSize: 0,
        disabled: false,
        autoUpload: true,
    },
} as const;

class UploadButtonComponent extends Component {
    get tpl(): TplNode {
        return UPLOAD_BUTTON_TPL;
    }

    _inputEl: HTMLInputElement | null = null;
    _itemsMap: Map<string, FileItem> | null = null;
    _listClickBound: boolean = false;
    _boundListClick: ((e: Event) => void) | null = null;

    onAfterInit(): void {
        this._initUploadButton();
    }

    onBeforeDispose(): void {
        if (this._listClickBound) {
            const listEl = this._resolveNodeEl('list');
            if (listEl && this._boundListClick)
                listEl.removeEventListener('click', this._boundListClick);
            this._listClickBound = false;
        }

        if (this.fileKey) {
            fileDispatchCenter.disconnect(this.fileKey);
        }
    }

    _initUploadButton(): void {
        this._createFileInput();

        this._itemsMap = new Map();

        fileDispatchCenter.createChannel(this.fileKey, {
            transport: this.transport ?? undefined,
            accept: this.accept || undefined,
            multiple: this.multiple,
            maxSize: this.maxSize || undefined,
            autoUpload: this.autoUpload,
        });
        fileDispatchCenter.connect(this.fileKey);

        this._subscribeFeedback();

        this._boundListClick = this._handleListClick.bind(this);
        const listEl = this._resolveNodeEl('list');
        if (listEl) {
            listEl.addEventListener('click', this._boundListClick);
            this._listClickBound = true;
        }

        this._applyFileState();
        this._renderList();
    }

    _createFileInput(): void {
        const input = document.createElement('input');
        input.type = 'file';
        input.style.display = 'none';
        if (this.accept) input.accept = this.accept;
        if (this.multiple) input.multiple = true;
        if (this.disabled) input.disabled = true;
        this._inputEl = input;
        this.el.appendChild(input);

        input.addEventListener('change', () => {
            const files = input.files;
            if (!files || files.length === 0) return;
            this._fileCmd(FILE_ACTIONS.SELECT, { files: Array.from(files) });
            input.value = '';
        });
    }

    onBtnClick(): void {
        if (this.disabled) return;
        this._inputEl?.click();
    }

    /** 构建并发送文件命令事件（经 EventsAbility） */
    _fileCmd(action: string, data: any): void {
        this.fileEmit(`file:${this.fileKey}:${action}`, data, {
            type: action,
            source: this.fileKey,
            sourceType: 'UploadButton',
        });
    }

    /** 订阅 FileEventBus 反馈事件（经 EventsAbility，onCleanup 自动清理） */
    _subscribeFeedback(): void {
        const key = this.fileKey;
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
            this.fileOn(key, action, (data: any) => {
                this._applyFeedback(action, data);
                this._renderList();
                this._forward(action, data);
            });
        }
    }

    /** 根据反馈事件更新本地状态镜像 _itemsMap */
    _applyFeedback(action: string, data: any): void {
        const map = this._itemsMap;
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
            map.set(data.item.id, data.item);
        }
    }

    /** 转发反馈到组件 emit + 桥接通道 */
    _forward(action: string, data: any): void {
        const emitName = FEEDBACK_TO_EMIT[action];
        if (!emitName) return;

        this.emit(emitName, data);

        if (this.eventKey && typeof this.componentEmit === 'function') {
            this.componentEmit(emitName, data, {
                source: this.eventKey as string,
                sourceType: 'UploadButton',
            });
        }
    }

    /** list 上的点击委托：移除按钮 → 发送 REMOVE 命令事件 */
    _handleListClick(e: Event): void {
        const target = e.target as HTMLElement | null;
        const removeEl = target?.closest('.q-upload-btn__remove') as HTMLElement | null;
        if (!removeEl) return;
        e.stopPropagation();
        const itemId = removeEl.dataset.itemId;
        if (itemId) {
            this._fileCmd(FILE_ACTIONS.REMOVE, { itemId });
        }
    }

    /** 渲染文件列表（setNodeHtml，符合 CommonPropsAbility 约定；数据来自本地镜像） */
    _renderList(): void {
        const map = this._itemsMap;
        if (!map) return;
        const items = [...map.values()];
        const html = items.map(item => this._renderItem(item)).join('');
        this.setNodeHtml(html, 'list');
    }

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
    }

    _applyFileState(): void {
        this.toggleCls('q-upload-btn--disabled', this.disabled);
    }

    _onDisabledOptionChange(_value: boolean): void {
        this._applyFileState();
        if (this._inputEl) this._inputEl.disabled = this.disabled;
    }

    _onAcceptOptionChange(value: string): void {
        if (this._inputEl) this._inputEl.accept = value;
    }

    _onMultipleOptionChange(value: boolean): void {
        if (this._inputEl) this._inputEl.multiple = value;
    }

    get files(): FileItem[] {
        const map = this._itemsMap;
        return map ? [...map.values()] : [];
    }

    get uploadedFiles(): FileItem[] {
        const map = this._itemsMap;
        return map ? [...map.values()].filter(i => i.status === FileItemStatus.UPLOADED) : [];
    }

    get defaultEventData(): Record<string, any> {
        return { files: this._itemsMap ? [...this._itemsMap.values()] : [] };
    }

    getFormValue(): any {
        const map = this._itemsMap;
        if (!map) return [];
        return [...map.values()]
            .filter(i => i.status === FileItemStatus.UPLOADED)
            .map(i => i.result);
    }

    setFormValue(v: any): void {
        if (!Array.isArray(v)) return;
        const items: FileItem[] = v.map((item: any) => ({
            id: item.id ?? `formval-${Math.random().toString(36).slice(2)}`,
            file: null,
            name: item.name ?? '',
            size: item.size ?? 0,
            status: FileItemStatus.UPLOADED,
            percent: 100,
            result: item,
        }));
        this._fileCmd(FILE_ACTIONS.SET_ITEMS, { items });
        if (this._itemsMap) {
            this._itemsMap.clear();
            for (const it of items) this._itemsMap.set(it.id, it);
        }
        this._renderList();
    }

    formReset(): void {
        this._fileCmd(FILE_ACTIONS.CLEAR, {});
        if (this._itemsMap) this._itemsMap.clear();
        this._renderList();
    }

    update(props?: Record<string, any>): void {
        super.update(props);

        if (props?.transport !== undefined) this.transport = props.transport;

        if (this.fileKey) {
            fileDispatchCenter.createChannel(this.fileKey, {
                transport: this.transport ?? undefined,
                accept: this.accept || undefined,
                multiple: this.multiple,
                maxSize: this.maxSize || undefined,
                autoUpload: this.autoUpload,
            });
        }
    }
}

UploadButtonComponent.define(UploadButtonComponentDefs);

export { UploadButtonComponent };
/** 上传按钮实例类型 */
export type UploadButtonComponentInstance = InstanceType<typeof UploadButtonComponent>;

/** 转义 HTML 防注入 */
function escapeHtml(str: string): string {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
