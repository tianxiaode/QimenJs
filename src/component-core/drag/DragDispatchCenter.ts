/**
 * DragDispatchCenter — 拖拽调度中心
 *
 * 配置驱动的拖拽管理，与 OverlayDispatchCenter 架构对称：
 * - 组件通过 DragEventBus 的 init/dispose/dropInit/dropDispose 通道声明拖拽与放置区
 * - 调度中心在构造时订阅上述通道，全权管理拖拽实例
 * - 用 component.bind(el, 'drag') 绑定（跨平台，走 DragProcessor）
 * - move 回调直接调 component 的 onDragMove 方法（高频，不走总线）
 * - start/end/cancel 通过 DragEventBus 广播（低频，跨组件通信）
 *
 * 单源模型：一个组件就是一个拖动源，拖拽实例按 componentId 一对一管理；
 * 放置区按 componentId:zone 管理。
 *
 * 组件完全不关心拖拽的事：不需要 addEventListener、不需要手动管理实例。
 */

import { RegistrarBase } from '@/registry';
import { ComponentRegistrar } from '../ComponentRegistrar';
import { DragEventBus } from '@/events';
import { DragOptions, DropOptions } from '../types';
import type { DragInstance, DropZoneInstance } from '../types';

export class DragDispatchCenter extends RegistrarBase<Map<string, DragOptions>> {
    public readonly name = 'DragDispatchCenter';
    protected storage = new Map<string, DragOptions>();

    /** 拖拽实例，key = componentId（单源：一个组件一个拖动源） */
    private readonly instances = new Map<string, DragInstance>();
    /** 放置区实例，key = componentId:zone */
    private readonly dropZones = new Map<string, DropZoneInstance>();
    /** 当前悬停的放置区 key（drop 状态机，enter/leave 推导依据） */
    private _currentDropKey: string | null = null;
    private readonly bus: DragEventBus;

    constructor() {
        super();
        this.bus = DragEventBus.getInstance();
        this.bus.onInit((component, config, handleEl) =>
            this.handleInit(component.id, component, config, handleEl)
        );
        this.bus.onDispose(componentId => this.disposeByComponent(componentId));
        this.bus.onDropInit((component, zone, config) =>
            this.registerDropZone(`${component.id}:${zone}`, component.el, component, zone, config)
        );
        this.bus.onDropDispose((componentId, zone) =>
            this.unregisterDropZone(`${componentId}:${zone}`)
        );
        this.logger.debug?.('[DragDispatchCenter] initialized');
    }

    /**
     * 注册拖拽定义
     *
     * @param dragKey 拖拽键
     * @param definition 拖拽定义
     */
    register(dragKey: string, definition: DragOptions): void {
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
    get(dragKey: string): DragOptions | undefined {
        return this.storage.get(dragKey);
    }

    /**
     * 销毁指定组件的所有拖拽与放置区实例
     *
     * @param componentId 组件 ID
     */
    disposeByComponent(componentId: string): void {
        const inst = this.instances.get(componentId);
        if (inst) {
            this._cleanupInstance(inst);
            this.instances.delete(componentId);
            this.storage.delete(componentId);
        }

        const prefix = `${componentId}:`;
        for (const [key, zone] of this.dropZones) {
            if (key.startsWith(prefix)) {
                if (this._currentDropKey === key) {
                    this._currentDropKey = null;
                }
                if (zone.config.activeClass) {
                    zone.el.classList.remove(zone.config.activeClass);
                }
                this.dropZones.delete(key);
            }
        }
        this.logger.debug?.(
            `[DragDispatchCenter] disposed all drags for componentId="${componentId}"`
        );
    }

    /**
     * 处理初始化事件（单源：一个组件一个拖动源）
     *
     * @param componentId 组件 ID
     * @param component 组件实例
     * @param config 拖拽配置
     * @param handleEl 手柄元素（未指定手柄时为 undefined，绑组件 root）
     */
    handleInit(
        componentId: string,
        component: any,
        config: DragOptions,
        handleEl?: HTMLElement
    ): void {
        if (!component || !component.el) return;

        // 重复注册时先清理旧实例
        if (this.instances.has(componentId)) {
            this._disposeInstance(componentId);
        }

        component.onCleanup(() => this.disposeByComponent(componentId));

        this.register(componentId, config);

        const inst: DragInstance = {
            el: handleEl ?? component.el,
            component,
            config,
        };
        this.instances.set(componentId, inst);

        this._bindDragEvents(componentId, inst);
    }

    private _bindDragEvents(dragKey: string, inst: DragInstance): void {
        const { el, component, config } = inst;

        // 计算拖拽类型：默认使用 component.type，config.type 可覆盖
        const dragType = config.type ?? component.type;

        component.bind(el, 'drag');

        component.on('dom:drag', (gesture: any) => {
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

                this._createGhost(inst);
                this._moveGhost(inst, gesture);

                const startHandler = component.onDragStart;
                if (typeof startHandler === 'function') {
                    startHandler.call(component, {
                        dx: gesture.dx ?? 0,
                        dy: gesture.dy ?? 0,
                        el,
                        originalEvent: gesture.originalEvent,
                    });
                }
            } else if (phase === 'move') {
                this._moveGhost(inst, gesture);
                this._updateDropHover(gesture, dragKey);

                const moveHandler = component.onDragMove;
                if (typeof moveHandler === 'function') {
                    moveHandler.call(component, {
                        dx: gesture.dx ?? 0,
                        dy: gesture.dy ?? 0,
                        el,
                        originalEvent: gesture.originalEvent,
                    });
                }
            } else if (phase === 'end') {
                this._resolveDrop(gesture, dragKey);
                this.bus.dragEnd(dragKey);

                if (config.activeClass) el.classList.remove(config.activeClass);

                this._destroyGhost(inst);

                const endHandler = component.onDragEnd;
                if (typeof endHandler === 'function') {
                    endHandler.call(component, {
                        el,
                        originalEvent: gesture.originalEvent,
                    });
                }
            } else if (phase === 'cancel') {
                this._clearDropHover(dragKey);
                this.bus.dragCancel(dragKey);

                if (config.activeClass) el.classList.remove(config.activeClass);

                this._destroyGhost(inst);

                const cancelHandler = component.onDragCancel;
                if (typeof cancelHandler === 'function') {
                    cancelHandler.call(component, { el });
                }
            }
        });
    }

    /** 创建拖拽影子组件（config.ghost 按类型名从注册表解析） */
    private _createGhost(inst: DragInstance): void {
        const ghostType = inst.config.ghost;
        if (!ghostType || inst.ghostComponent) return;

        const ctor = ComponentRegistrar.getInstance().getByType(ghostType);
        if (!ctor) {
            this.logger.warn?.(`[DragDispatchCenter] ghost type="${ghostType}" not registered`);
            return;
        }

        const ghost = new (ctor as any)();
        if (!ghost?.el) {
            this.logger.warn?.(`[DragDispatchCenter] ghost type="${ghostType}" has no el`);
            return;
        }

        ghost.el.style.position = 'fixed';
        ghost.el.style.pointerEvents = 'none';
        ghost.el.style.zIndex = '9999';
        document.body.appendChild(ghost.el);

        inst.ghostComponent = ghost;
    }

    /** 影子跟随指针：优先调用影子组件的 update(x, y)，否则直接改 style */
    private _moveGhost(inst: DragInstance, gesture: any): void {
        const ghost = inst.ghostComponent;
        if (!ghost) return;

        const x = gesture.originalEvent?.clientX ?? 0;
        const y = gesture.originalEvent?.clientY ?? 0;

        if (typeof ghost.update === 'function') {
            ghost.update(x, y);
        } else if (ghost.el) {
            ghost.el.style.left = `${x}px`;
            ghost.el.style.top = `${y}px`;
        }
    }

    /** 销毁拖拽影子组件 */
    private _destroyGhost(inst: DragInstance): void {
        const ghost = inst.ghostComponent;
        if (!ghost) return;

        inst.ghostComponent = undefined;
        ghost.el?.remove?.();
        ghost.dispose?.();
    }

    private _disposeInstance(dragKey: string): void {
        const inst = this.instances.get(dragKey);
        if (!inst) return;

        this._cleanupInstance(inst);
        this.instances.delete(dragKey);
        this.storage.delete(dragKey);
    }

    private _cleanupInstance(inst: DragInstance): void {
        if (inst.config.activeClass) {
            inst.el.classList.remove(inst.config.activeClass);
        }
        this._destroyGhost(inst);
    }

    protected doInspect(): void {
        const definitions = [...this.storage.keys()];
        const instances = [...this.instances.keys()];
        const dropZoneCount = this.dropZones.size;

        console.log('Definitions:', definitions);
        console.log('Instances:', instances);
        console.log('DropZones:', dropZoneCount);
    }

    /** 销毁所有拖拽实例并清理资源 */
    dispose(): void {
        for (const inst of this.instances.values()) {
            this._cleanupInstance(inst);
        }
        this.instances.clear();
        this.storage.clear();

        for (const zone of this.dropZones.values()) {
            if (zone.config.activeClass) {
                zone.el.classList.remove(zone.config.activeClass);
            }
        }
        this.dropZones.clear();
        this._currentDropKey = null;

        this.logger.debug?.('[DragDispatchCenter] all disposed');
    }

    // ══════════════════════════════════════════════════════════════
    // 放置区管理（纯登记，跨端：enter/leave/drop 由调度中心 hit-testing 合成）
    // ══════════════════════════════════════════════════════════════

    /**
     * 注册放置区（只登记，不绑定任何 DOM 事件）
     *
     * @param dropKey 放置区键（格式：componentId:zone）
     * @param el 放置区 DOM 元素
     * @param component 组件实例
     * @param zone 放置区名
     * @param config 放置区配置
     */
    registerDropZone(
        dropKey: string,
        el: HTMLElement,
        component: any,
        zone: string,
        config: DropOptions = {}
    ): void {
        this.checkLock();

        if (this.dropZones.has(dropKey)) {
            this.unregisterDropZone(dropKey);
        }

        const inst: DropZoneInstance = {
            el,
            component,
            zone,
            config,
        };
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

        if (this._currentDropKey === dropKey) {
            this._currentDropKey = null;
        }
        if (inst.config.activeClass) {
            inst.el.classList.remove(inst.config.activeClass);
        }
        this.dropZones.delete(dropKey);

        this.logger.debug?.(`[DragDispatchCenter] unregistered drop zone "${dropKey}"`);
    }

    // ══════════════════════════════════════════════════════════════
    // drop 状态机（drag 会话 + hit-testing 合成，移动端兼容）
    // ══════════════════════════════════════════════════════════════

    /** 从手势数据提取指针坐标（pointer 事件顶层，touch 事件在 touches[0]） */
    private _pointFromGesture(gesture: any): { x: number; y: number } {
        const e = gesture?.originalEvent;
        return {
            x: e?.clientX ?? e?.touches?.[0]?.clientX ?? 0,
            y: e?.clientY ?? e?.touches?.[0]?.clientY ?? 0,
        };
    }

    /** hit-test：指针是否落在某个放置区内（accept 匹配的优先） */
    private _hitTestDropZone(x: number, y: number): { key: string; inst: DropZoneInstance } | null {
        const target = document.elementFromPoint(x, y);
        if (!target) return null;

        const activeDrag = this.bus.getActiveDrag();
        const dragType = activeDrag?.dragType;
        const fallback: { key: string; inst: DropZoneInstance } | null = null;

        for (const [key, inst] of this.dropZones) {
            if (!inst.el.contains(target)) continue;

            const accept = inst.config.accept;
            if (accept && accept.length > 0) {
                if (!dragType || !accept.includes(dragType)) continue;
                return { key, inst };
            }
            return { key, inst };
        }
        return fallback;
    }

    /** move 时更新悬停状态：推导 enter / leave */
    private _updateDropHover(gesture: any, dragKey: string): void {
        const { x, y } = this._pointFromGesture(gesture);
        const hit = this._hitTestDropZone(x, y);
        const hitKey = hit?.key ?? null;

        if (hitKey === this._currentDropKey) return;

        // 离开旧区
        if (this._currentDropKey) {
            const prev = this.dropZones.get(this._currentDropKey);
            if (prev) {
                if (prev.config.activeClass) prev.el.classList.remove(prev.config.activeClass);
                this.bus.dragLeave(dragKey, prev.component, prev.el);
                const handlerName = prev.zone.charAt(0).toUpperCase() + prev.zone.slice(1);
                const leaveHandler = prev.component[`on${handlerName}DragLeave`];
                if (typeof leaveHandler === 'function') {
                    leaveHandler.call(prev.component, {
                        dragKey,
                        el: prev.el,
                        originalEvent: gesture?.originalEvent,
                    });
                }
            }
        }

        // 进入新区
        if (hit) {
            const { inst } = hit;
            if (inst.config.activeClass) inst.el.classList.add(inst.config.activeClass);
            const activeDrag = this.bus.getActiveDrag();
            this.bus.dragEnter(activeDrag?.dragKey ?? dragKey, inst.component, inst.el);
            const handlerName = inst.zone.charAt(0).toUpperCase() + inst.zone.slice(1);
            const enterHandler = inst.component[`on${handlerName}DragEnter`];
            if (typeof enterHandler === 'function') {
                enterHandler.call(inst.component, {
                    dragKey,
                    dragType: activeDrag?.dragType,
                    dragData: activeDrag?.dragData,
                    el: inst.el,
                    originalEvent: gesture?.originalEvent,
                });
            }
        }

        this._currentDropKey = hitKey;
    }

    /** 结束拖拽：命中悬停区 → 广播 drop + 回调 */
    private _resolveDrop(gesture: any, dragKey: string): void {
        const key = this._currentDropKey;
        this._clearDropHover(dragKey);
        if (!key) return;

        const inst = this.dropZones.get(key);
        if (!inst) return;

        const activeDrag = this.bus.getActiveDrag();
        this.bus.dragDrop(activeDrag?.dragKey ?? dragKey, inst.component, inst.el);

        const handlerName = inst.zone.charAt(0).toUpperCase() + inst.zone.slice(1);
        const onDropMethod = inst.config.onDrop
            ? inst.component[inst.config.onDrop]
            : inst.component[`on${handlerName}DragDrop`];
        if (typeof onDropMethod === 'function') {
            onDropMethod.call(inst.component, {
                dragKey,
                dragType: activeDrag?.dragType,
                dragData: activeDrag?.dragData,
                el: inst.el,
                originalEvent: gesture?.originalEvent,
            });
        }
    }

    /** 清除悬停状态（leave 当前区，不做 enter），用于 end/cancel 收尾 */
    private _clearDropHover(dragKey: string): void {
        const key = this._currentDropKey;
        this._currentDropKey = null;
        if (!key) return;

        const inst = this.dropZones.get(key);
        if (!inst) return;

        if (inst.config.activeClass) inst.el.classList.remove(inst.config.activeClass);
        this.bus.dragLeave(dragKey, inst.component, inst.el);
    }
}

export const dragDispatchCenter = DragDispatchCenter.getInstance();
