/**
 * DropAbility — 放置能力
 *
 * 宿主只负责：
 * - 绑定 dragenter/dragover/dragleave/drop 原生事件
 * - 根据 dropAccept 过滤拖拽源
 * - 拖拽悬停时添加/移除 CSS class
 * - 通过 this.emit 发布 dragenter/dragover/dragleave/drop 事件到 EventBus
 *
 * 注意：HTML5 拖放事件（dragenter/dragover/dragleave/drop）不在框架
 * GestureSemantic/InputSignal 体系中，因此使用原生 addEventListener 绑定，
 * 但事件发布走框架 UI 事件模式（this.emit + EventContext）。
 *
 * Drop 属性通过 getDrop(key) / setDrop(key, value) 方法访问。
 */

import type { AbilityDefinition } from '@/composable';

/**
 * Drop 配置
 */
export interface DropConfig {
    /** 是否可接收放置，默认 false */
    droppable?: boolean;
    /** 接受的拖拽源类型（对应组件 type），空则接受所有 */
    dropAccept?: string | string[];
    /** 拖拽悬停时的 CSS class */
    dropActiveClass?: string;
}

/**
 * 支持的 drop key 类型
 */
export type DropKey = 'droppable' | 'dropAccept' | 'dropActiveClass';

/**
 * drop 默认值
 */
const DROP_DEFAULTS: Record<string, any> = {
    droppable: false,
};

export const DropAbility: AbilityDefinition = {
    // ─── Drop 属性访问方法 ───

    getDrop(key: DropKey): any {
        if (key in DROP_DEFAULTS) {
            return this.props[key] ?? DROP_DEFAULTS[key];
        }
        return this.props[key];
    },

    setDrop(key: DropKey, value: any): void {
        this.setProp(key, value);
    },

    /**
     * 初始化 Drop — 配置驱动
     *
     * 绑定 dragenter/dragover/dragleave/drop 原生事件，
     * 根据 dropAccept 过滤拖拽源。
     * 通过 this.emit 发布事件到 EventBus（UI 事件模式）。
     */
    initDrop(config: DropConfig): void {
        const accept = config.dropAccept;
        const activeClass = config.dropActiveClass;

        // ── 1. 判断是否接受该拖拽源 ──

        const isAccepted = (dataTransfer: DataTransfer | null): boolean => {
            if (!accept) return true;
            if (!dataTransfer) return false;

            const dragType = dataTransfer.getData('application/qimen-drag-type');
            if (!dragType) return true; // 无类型信息时默认接受

            const acceptList = Array.isArray(accept) ? accept : [accept];
            return acceptList.includes(dragType);
        };

        // ── 2. 事件处理 ──

        const onDragEnter = (e: DragEvent) => {
            if (!isAccepted(e.dataTransfer)) return;

            e.preventDefault();
            if (activeClass) {
                this.el.classList.add(activeClass);
            }

            this.emit('dragenter', undefined, { source: this.eventKey, domEvent: e });
        };

        const onDragOver = (e: DragEvent) => {
            if (!isAccepted(e.dataTransfer)) return;

            e.preventDefault();
            e.dataTransfer!.dropEffect = 'move';

            this.emit('dragover', undefined, { source: this.eventKey, domEvent: e });
        };

        const onDragLeave = (e: DragEvent) => {
            if (activeClass) {
                this.el.classList.remove(activeClass);
            }

            this.emit('dragleave', undefined, { source: this.eventKey, domEvent: e });
        };

        const onDrop = (e: DragEvent) => {
            e.preventDefault();

            if (activeClass) {
                this.el.classList.remove(activeClass);
            }

            if (!isAccepted(e.dataTransfer)) return;

            const dragData = e.dataTransfer?.getData('application/qimen-drag-data');
            const dragType = e.dataTransfer?.getData('application/qimen-drag-type');

            this.emit('drop', {
                dragData: dragData ? JSON.parse(dragData) : null,
                dragType: dragType ?? null,
            }, { source: this.eventKey, domEvent: e });
        };

        // ── 3. 绑定原生事件 ──

        this.el.addEventListener('dragenter', onDragEnter as EventListener);
        this.el.addEventListener('dragover', onDragOver as EventListener);
        this.el.addEventListener('dragleave', onDragLeave as EventListener);
        this.el.addEventListener('drop', onDrop as EventListener);

        // ── 4. 在宿主上生成委托方法 ──

        (this as any).setDroppable = (value: boolean) => {
            this.setDrop('droppable', value);
        };

        (this as any).setDropAccept = (value: string | string[]) => {
            this.setDrop('dropAccept', value);
        };

        // ── 5. 注册 onCleanup 清理回调 ──

        this.onCleanup(() => {
            this.el.removeEventListener('dragenter', onDragEnter as EventListener);
            this.el.removeEventListener('dragover', onDragOver as EventListener);
            this.el.removeEventListener('dragleave', onDragLeave as EventListener);
            this.el.removeEventListener('drop', onDrop as EventListener);

            delete (this as any).setDroppable;
            delete (this as any).setDropAccept;
        });
    },
};
