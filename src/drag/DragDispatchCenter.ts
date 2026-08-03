/**
 * DragDispatchCenter — 拖拽调度中心
 *
 * 配置驱动的拖拽管理，与 OverlayDispatchCenter 架构对称：
 * - body.drags 声明配置 → initDrags 发 INIT 事件 → 调度中心全权管理
 * - 用 component.bind(el, 'drag') 绑定（跨平台，走 DragProcessor）
 * - move 回调直接调 component 的 onXxxDragMove 方法（高频，不走总线）
 * - start/end/cancel 通过 DragEventBus 广播（低频，跨组件通信）
 * - drop zones 通过 registerDropZone 绑定放置事件
 *
 * 组件完全不关心拖拽的事：不需要 DragAbility、不需要 addEventListener、
 * 不需要手动管理 _dragProcessors。
 */

import { RegistrarBase } from '@/registry';
import { DragEventBus, DRAG_ACTIONS } from '@/events';

import type { DragDecl, DropDecl } from '@/component-core/types/tpl-node-types';

export interface DragDefinition extends DragDecl {}
export interface DropDefinition extends DropDecl {}

/** 拖拽实例内部结构 */
interface DragInstance {
    el: HTMLElement;
    component: any;
    nodeName: string;
    config: DragDecl;
}

/** 放置区实例内部结构 */
interface DropZoneInstance {
    el: HTMLElement;
    component: any;
    nodeName: string;
    config: DropDecl;
    dragEnterHandler: (e: DragEvent) => void;
    dragOverHandler: (e: DragEvent) => void;
    dragLeaveHandler: (e: DragEvent) => void;
    dropHandler: (e: DragEvent) => void;
}

/**
 * 编码实例键
 *
 * @param componentId 组件 ID
 * @param nodeName 节点名
 * @returns 编码后的键（格式：componentId:nodeName）
 */
function encodeInstanceKey(componentId: string, nodeName: string): string {
    return `${componentId}:${nodeName}`;
}

/**
 * 首字母大写
 *
 * @param s 输入字符串
 * @returns 首字母大写后的字符串
 */
function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

export class DragDispatchCenter extends RegistrarBase<Map<string, DragDefinition>> {
    public readonly name = 'DragDispatchCenter';
    protected storage = new Map<string, DragDefinition>();

    private readonly instances = new Map<string, DragInstance>();
    private readonly dropZones = new Map<string, DropZoneInstance>();
    private readonly bus: DragEventBus;

    constructor() {
        super();
        this.bus = DragEventBus.getInstance();
        this.logger.debug?.('[DragDispatchCenter] initialized');
    }

    /**
     * 注册拖拽定义
     *
     * @param dragKey 拖拽键
     * @param definition 拖拽定义
     */
    register(dragKey: string, definition: DragDefinition): void {
        this.checkLock();
        this.storage.set(dragKey, definition);
        this.logger.debug?.(`[DragDispatchCenter] registered dragKey="${dragKey}"`);
    }

    /**
     * 注销拖拽定义
     *
     * @param dragKey 拖拽键
     */
    unregister(dragKey: string): void {
        this.checkLock();
        this._disposeInstance(dragKey);
        this.storage.delete(dragKey);
        this.logger.debug?.(`[DragDispatchCenter] unregistered dragKey="${dragKey}"`);
    }

    /**
     * 获取拖拽定义
     *
     * @param dragKey 拖拽键
     * @returns 拖拽定义，若不存在则返回 undefined
     */
    get(dragKey: string): DragDefinition | undefined {
        return this.storage.get(dragKey);
    }

    /**
     * 按组件 ID 销毁所有拖拽实例
     *
     * @param componentId 组件 ID
     */
    disposeByComponent(componentId: string): void {
        const prefix = `${componentId}:`;
        for (const [key, inst] of this.instances) {
            if (key.startsWith(prefix)) {
                this._cleanupInstance(inst);
                this.instances.delete(key);
            }
        }
        for (const [key, inst] of this.dropZones) {
            if (key.startsWith(prefix)) {
                this._unbindDropZoneEvents(inst);
                this.dropZones.delete(key);
            }
        }
        this.logger.debug?.(
            `[DragDispatchCenter] disposed all drags for componentId="${componentId}"`
        );
    }

    /**
     * 处理初始化事件
     *
     * @param componentId 组件 ID
     * @param data 初始化数据（包含 component 和 drags）
     */
    handleInit(componentId: string, data: any): void {
        const component = data?.component;
        const drags = data?.drags;
        if (!component || !drags) return;

        component.onCleanup(() => this.disposeByComponent(componentId));

        for (const [nodeName, dragDef] of Object.entries(drags)) {
            const def = dragDef as Record<string, any>;
            const el = component.nodeMap?.[nodeName]?.el ?? component.el;
            const dragKey = encodeInstanceKey(componentId, nodeName);

            const config: DragDecl = {
                type: def.type,
                axis: def.axis,
                bounds: def.bounds,
                activeClass: def.activeClass,
                grid: def.grid,
                ghost: def.ghost,
            };

            this.register(dragKey, config);

            const inst: DragInstance = {
                el,
                component,
                nodeName,
                config,
            };
            this.instances.set(dragKey, inst);

            this._bindDragEvents(dragKey, inst);
        }
    }

    private _bindDragEvents(dragKey: string, inst: DragInstance): void {
        const { el, component, nodeName, config } = inst;
        const handlerName = capitalize(nodeName);

        // 计算拖拽类型：默认使用 component.type，config.type 可覆盖
        const dragType = config.type ?? component.type;

        component.bind(el, 'drag');

        const off = component.on('dom:drag', (gesture: any) => {
            if (
                gesture.originalEvent?.target !== el &&
                !el.contains(gesture.originalEvent?.target)
            ) {
                return;
            }

            const phase = gesture.phase;

            if (phase === 'start') {
                const dragData = config;
                this.bus.dragStart(dragKey, {
                    dragType,
                    dragData,
                    dragEl: el,
                    dragSource: component,
                });

                if (config.activeClass) el.classList.add(config.activeClass);

                const startHandler = component[`on${handlerName}DragStart`];
                if (typeof startHandler === 'function') {
                    startHandler.call(component, {
                        dx: gesture.dx ?? 0,
                        dy: gesture.dy ?? 0,
                        el,
                        originalEvent: gesture.originalEvent,
                    });
                }
            } else if (phase === 'move') {
                const moveHandler = component[`on${handlerName}DragMove`];
                if (typeof moveHandler === 'function') {
                    moveHandler.call(component, {
                        dx: gesture.dx ?? 0,
                        dy: gesture.dy ?? 0,
                        el,
                        originalEvent: gesture.originalEvent,
                    });
                }
            } else if (phase === 'end') {
                this.bus.dragEnd(dragKey);

                if (config.activeClass) el.classList.remove(config.activeClass);

                const endHandler = component[`on${handlerName}DragEnd`];
                if (typeof endHandler === 'function') {
                    endHandler.call(component, {
                        el,
                        originalEvent: gesture.originalEvent,
                    });
                }
            } else if (phase === 'cancel') {
                this.bus.dragCancel(dragKey);

                if (config.activeClass) el.classList.remove(config.activeClass);

                const cancelHandler = component[`on${handlerName}DragCancel`];
                if (typeof cancelHandler === 'function') {
                    cancelHandler.call(component, { el });
                }
            }
        });
    }

    private _disposeInstance(dragKey: string): void {
        const inst = this.instances.get(dragKey);
        if (!inst) return;

        this._cleanupInstance(inst);
        this.instances.delete(dragKey);
    }

    private _cleanupInstance(inst: DragInstance): void {
        if (inst.config.activeClass) {
            inst.el.classList.remove(inst.config.activeClass);
        }
    }

    protected doInspect(): void {
        const definitions = [...this.storage.keys()];
        const instances = [...this.instances.entries()].map(([key, inst]) => ({
            instanceKey: key,
            nodeName: inst.nodeName,
        }));
        const dropZoneCount = this.dropZones.size;

        console.log('Definitions:', definitions);
        console.log('Instances:', instances);
        console.log('DropZones:', dropZoneCount);
    }

    /** 销毁所有拖拽实例并清理资源 */
    dispose(): void {
        for (const [key, inst] of this.instances) {
            this._cleanupInstance(inst);
        }
        this.instances.clear();

        for (const [key, inst] of this.dropZones) {
            this._unbindDropZoneEvents(inst);
        }
        this.dropZones.clear();

        this.logger.debug?.('[DragDispatchCenter] all disposed');
    }

    // ══════════════════════════════════════════════════════════════
    // 放置区管理
    // ══════════════════════════════════════════════════════════════

    /**
     * 注册放置区
     *
     * @param dropKey 放置区键（通常为 componentId:nodeName）
     * @param el 放置区 DOM 元素
     * @param component 组件实例
     * @param nodeName 节点名称
     * @param config 放置区配置
     */
    registerDropZone(
        dropKey: string,
        el: HTMLElement,
        component: any,
        nodeName: string,
        config: DropDecl = {}
    ): void {
        this.checkLock();

        if (this.dropZones.has(dropKey)) {
            this.unregisterDropZone(dropKey);
        }

        const inst: DropZoneInstance = {
            el,
            component,
            nodeName,
            config,
            dragEnterHandler: () => {},
            dragOverHandler: () => {},
            dragLeaveHandler: () => {},
            dropHandler: () => {},
        };

        this._bindDropZoneEvents(dropKey, inst);
        this.dropZones.set(dropKey, inst);

        this.logger.debug?.(`[DragDispatchCenter] registered drop zone "${dropKey}"`);
    }

    /**
     * 注销放置区
     *
     * @param dropKey 放置区键
     */
    unregisterDropZone(dropKey: string): void {
        const inst = this.dropZones.get(dropKey);
        if (!inst) return;

        this._unbindDropZoneEvents(inst);
        this.dropZones.delete(dropKey);

        this.logger.debug?.(`[DragDispatchCenter] unregistered drop zone "${dropKey}"`);
    }

    private _bindDropZoneEvents(dropKey: string, inst: DropZoneInstance): void {
        const { el, component, nodeName, config } = inst;
        const handlerName = capitalize(nodeName);

        const dragEnterHandler = (e: DragEvent) => {
            e.preventDefault();

            const activeDrag = this.bus.getActiveDrag();
            if (!activeDrag) return;

            // 检查是否接受此拖拽类型
            if (config.accept && config.accept.length > 0) {
                if (!activeDrag.dragType || !config.accept.includes(activeDrag.dragType)) {
                    return;
                }
            }

            if (config.activeClass) el.classList.add(config.activeClass);

            this.bus.dragEnter(activeDrag.dragKey, component, el);

            const enterHandler = component[`on${handlerName}DragEnter`];
            if (typeof enterHandler === 'function') {
                enterHandler.call(component, {
                    dragKey: activeDrag.dragKey,
                    dragType: activeDrag.dragType,
                    dragData: activeDrag.dragData,
                    el,
                    originalEvent: e,
                });
            }
        };

        const dragOverHandler = (e: DragEvent) => {
            e.preventDefault();

            const activeDrag = this.bus.getActiveDrag();
            if (!activeDrag) return;

            // 检查是否接受此拖拽类型
            if (config.accept && config.accept.length > 0) {
                if (!activeDrag.dragType || !config.accept.includes(activeDrag.dragType)) {
                    return;
                }
            }
        };

        const dragLeaveHandler = (e: DragEvent) => {
            const activeDrag = this.bus.getActiveDrag();
            if (!activeDrag) return;

            if (config.activeClass) el.classList.remove(config.activeClass);

            this.bus.dragLeave(activeDrag.dragKey, component, el);

            const leaveHandler = component[`on${handlerName}DragLeave`];
            if (typeof leaveHandler === 'function') {
                leaveHandler.call(component, {
                    dragKey: activeDrag.dragKey,
                    dragType: activeDrag.dragType,
                    el,
                    originalEvent: e,
                });
            }
        };

        const dropHandler = (e: DragEvent) => {
            e.preventDefault();

            const activeDrag = this.bus.getActiveDrag();
            if (!activeDrag) return;

            // 检查是否接受此拖拽类型
            if (config.accept && config.accept.length > 0) {
                if (!activeDrag.dragType || !config.accept.includes(activeDrag.dragType)) {
                    return;
                }
            }

            if (config.activeClass) el.classList.remove(config.activeClass);

            this.bus.dragDrop(activeDrag.dragKey, component, el);

            const onDropMethod = config.onDrop
                ? component[config.onDrop]
                : component[`on${handlerName}DragDrop`];

            if (typeof onDropMethod === 'function') {
                onDropMethod.call(component, {
                    dragKey: activeDrag.dragKey,
                    dragType: activeDrag.dragType,
                    dragData: activeDrag.dragData,
                    el,
                    originalEvent: e,
                });
            }
        };

        inst.dragEnterHandler = dragEnterHandler;
        inst.dragOverHandler = dragOverHandler;
        inst.dragLeaveHandler = dragLeaveHandler;
        inst.dropHandler = dropHandler;

        el.addEventListener('dragenter', dragEnterHandler);
        el.addEventListener('dragover', dragOverHandler);
        el.addEventListener('dragleave', dragLeaveHandler);
        el.addEventListener('drop', dropHandler);
    }

    private _unbindDropZoneEvents(inst: DropZoneInstance): void {
        const { el, config } = inst;

        if (config.activeClass) {
            el.classList.remove(config.activeClass);
        }

        el.removeEventListener('dragenter', inst.dragEnterHandler);
        el.removeEventListener('dragover', inst.dragOverHandler);
        el.removeEventListener('dragleave', inst.dragLeaveHandler);
        el.removeEventListener('drop', inst.dropHandler);
    }
}

export const dragDispatchCenter = DragDispatchCenter.getInstance();
