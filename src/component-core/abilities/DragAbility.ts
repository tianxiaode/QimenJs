/**
 * DragAbility — 拖拽动态管理能力
 *
 * 为组件提供拖拽的声明式配置和运行时控制。
 *
 * 两种使用场景：
 *
 * 1. **Self-Drag（自身拖动）** — 如 Dialog 窗口拖动
 *    - 组件级：drag = true, dragHandle = 'header'
 *    - 或模板声明：{ name: 'header', tag: 'div', drag: true }
 *    - 关闭：drag = false
 *    - 不需要 drop zone
 *
 * 2. **Drag & Drop（拖放交互）** — 如卡片拖入容器
 *    - 拖拽源：drag = true（dragType 自动使用 component.type）
 *    - 放置区：drop = { accept: ['Card'] } // 接收 Card 类型
 *    - 关闭：drag = false / drop = false
 *    - 回调：onXxxDragDrop / onXxxDragEnter / onXxxDragLeave
 *
 * 解析优先级（从高到低）：
 *   drag: false → 禁用所有
 *   drag: true/DragDecl + dragHandle → 启用指定节点
 *   drag: true/DragDecl → 启用模板中 drag:true 的节点
 *   drag: undefined → 仅使用模板声明
 *
 * 手动控制：
 *   setDraggable(bool) — 便捷开关（推荐）
 *   setDropZone(bool) — 便捷开关
 *   attachDrag/detachDrag — 精细控制
 *
 * @example
 * // Self-Drag：Dialog 窗口拖动
 * class DialogComponent extends Component {
 *   drag = true;              // 启用拖拽
 *   dragHandle = 'header';    // header 节点为手柄
 *   // new DialogComponent({ drag: false }) → 禁用
 * }
 *
 * // Drag & Drop：卡片拖入容器
 * class CardComponent extends Component {
 *   drag = true;              // dragType 自动为 'Card'
 *   onCardDragEnd(e) { ... }
 * }
 *
 * class ContainerComponent extends Component {
 *   drop = { accept: ['Card'] };  // 接收 Card 类型
 *   dropZone = 'content';          // content 节点为放置区
 *   onContentDragDrop(e) { ... }
 *   // new ContainerComponent({ drop: false }) → 禁用
 * }
 *
 * // 手动控制
 * card.setDraggable(true);      // 启用拖拽
 * card.setDraggable(false);     // 禁用拖拽
 * container.setDropZone(true);  // 启用放置区
 */

import type { AbilityDefinition } from '@/composable';
import type { DragDecl, DropDecl } from '@/component-core/types/tpl-node-types';
import { EventContextBuilder } from '@/context';
import { DRAG_ACTIONS } from '@/events/drag-events';
import { dragDispatchCenter } from '@/drag/DragDispatchCenter';

const DRAGS_CACHE_KEY = 'DragAbility:cache';

function getDragsCache(self: any): Record<string, DragDecl> {
    return self.abilityState(DRAGS_CACHE_KEY, () => ({})) ?? {};
}

function setDragsCache(self: any, val: Record<string, DragDecl>): void {
    self.setAbilityState(DRAGS_CACHE_KEY, val);
}

export const DragAbility: AbilityDefinition = {
    /**
     * 拖拽声明 — getter 返回缓存，setter 统一调度
     *
     * 与 floats setter 模式对称：
     * - 初始化阶段：合并缓存
     * - 运行时：替换缓存 + diff + 驱动
     */
    get drags(): Record<string, DragDecl> | undefined {
        const cache = getDragsCache(this);
        return Object.keys(cache).length > 0 ? cache : undefined;
    },

    set drags(val: Record<string, DragDecl> | undefined) {
        const prev = getDragsCache(this);

        if (this._initializing) {
            const merged = val ? { ...prev, ...val } : prev;
            setDragsCache(this, merged);
            return;
        }

        setDragsCache(this, val ?? {});
        this._syncDrags(prev, val ?? {});
    },

    /**
     * 提交初始化阶段缓存的拖拽配置
     *
     * 解析优先级（从高到低）：
     * 1. drag === false → 禁用所有拖拽
     * 2. drag === true/DragDecl + dragHandle → 启用指定节点
     * 3. drag === true/DragDecl → 启用模板中 drag:true 的节点
     * 4. drag === undefined → 仅使用模板声明
     *
     * 手动 attachDrag 的配置与自动配置共存，不会被覆盖。
     */
    _commitDrags(): void {
        const cache = getDragsCache(this);
        const dragMode = (this as any).drag;

        // 1. drag === false: 禁用所有拖拽
        if (dragMode === false) {
            if (Object.keys(cache).length > 0) {
                setDragsCache(this, cache);
                this._syncDrags({}, cache);
            }
            return;
        }

        const nodeMap = (this as any).nodeMap;
        const dragHandle = (this as any).dragHandle;

        // 2. drag 有值（true 或 DragDecl）
        if (dragMode !== undefined && dragMode !== null) {
            const handleConfig = typeof dragMode === 'object' ? dragMode : {};

            // 2a. 如果设置了 dragHandle，使用指定节点
            if (dragHandle) {
                if (!cache[dragHandle]) {
                    cache[dragHandle] = handleConfig as DragDecl;
                }
            }
            // 2b. 否则使用模板中的 drag:true 节点
            else if (nodeMap) {
                for (const [nodeName, nodeMeta] of Object.entries(nodeMap)) {
                    if (nodeName === 'root') continue;
                    const nodeDrag = (nodeMeta as any)?.drag;
                    if (nodeDrag && !cache[nodeName]) {
                        const nodeDragConfig = typeof nodeDrag === 'object' ? nodeDrag : {};
                        cache[nodeName] = nodeDragConfig as DragDecl;
                    }
                }
                // 如果模板中有 drag 节点，就不再默认加 self
            }
            // 2c. 没有模板 drag 节点，默认 self
            if (!dragHandle) {
                const hasTemplateDrag = nodeMap && Object.keys(nodeMap).some(
                    n => n !== 'root' && nodeMap[n]?.drag
                );
                if (!hasTemplateDrag) {
                    if (!cache['self']) {
                        cache['self'] = handleConfig as DragDecl;
                    }
                }
            }
        }

        // 3. drag === undefined: 仅使用模板中的 drag 声明
        if (dragMode === undefined && nodeMap) {
            for (const [nodeName, nodeMeta] of Object.entries(nodeMap)) {
                if (nodeName === 'root') continue;
                const nodeDrag = (nodeMeta as any)?.drag;
                if (nodeDrag && !cache[nodeName]) {
                    const nodeDragConfig = typeof nodeDrag === 'object' ? nodeDrag : {};
                    cache[nodeName] = nodeDragConfig as DragDecl;
                }
            }
        }

        if (Object.keys(cache).length === 0) return;

        setDragsCache(this, cache);
        this._syncDrags({}, cache);
    },

    /**
     * 同步拖拽配置 — diff prev/next，对变更部分发送 INIT/DISPOSE
     */
    _syncDrags(
        prev: Record<string, DragDecl>,
        next: Record<string, DragDecl>
    ): void {
        if (!this.id) {
            this.id = this.props?.id ?? '';
        }

        const prevKeys = Object.keys(prev);
        const nextKeys = Object.keys(next);

        const removed = prevKeys.filter(k => !nextKeys.includes(k));
        const added = nextKeys.filter(k => !prevKeys.includes(k));
        const maybeChanged = nextKeys.filter(k => prevKeys.includes(k));

        for (const key of removed) {
            this._emitDragAction(key, DRAG_ACTIONS.DISPOSE);
        }

        for (const key of added) {
            this._emitDragInit(key, next[key]);
        }

        for (const key of maybeChanged) {
            if (JSON.stringify(prev[key]) !== JSON.stringify(next[key])) {
                this._emitDragAction(key, DRAG_ACTIONS.DISPOSE);
                this._emitDragInit(key, next[key]);
            }
        }
    },

    _emitDragInit(key: string, decl: DragDecl): void {
        const componentId = this.id;
        this.dragEmit(
            EventContextBuilder.create()
                .withEvent(`drag:${componentId}:${DRAG_ACTIONS.INIT}`)
                .withType(DRAG_ACTIONS.INIT)
                .withSource(componentId)
                .withData({ component: this, drags: { [key]: decl } })
                .build()
        );
    },

    _emitDragAction(key: string, action: string): void {
        const dragKey = `${this.id}:${key}`;
        this.dragEmit(
            EventContextBuilder.create()
                .withEvent(`drag:${dragKey}:${action}`)
                .withType(action)
                .withSource(dragKey)
                .withData({ component: this })
                .build()
        );
    },

    /**
     * 动态挂载拖拽配置
     *
     * 通过 drags setter 追加配置，不立即绑定手势。
     * 需调用 startDrag 才开始监听拖拽手势。
     *
     * @param key - 拖拽 key（通常为节点 name）
     * @param decl - 拖拽配置
     *
     * @example
     * this.attachDrag('handle', { axis: 'y', bounds: 'parent' });
     */
    attachDrag(key: string, decl: DragDecl): void {
        const current = getDragsCache(this);
        this.drags = { ...current, [key]: decl };
    },

    /**
     * 动态卸载拖拽配置
     *
     * 从 drags 中移除指定 key，触发 setter 驱动。
     * 如果拖拽会话正在进行，先 stop 再移除。
     *
     * @param key - 要卸载的拖拽 key
     *
     * @example
     * this.detachDrag('handle');
     */
    detachDrag(key: string): void {
        const current = getDragsCache(this);
        if (!current[key]) return;
        const next = { ...current };
        delete next[key];
        this.drags = Object.keys(next).length > 0 ? next : undefined;
    },

    /**
     * 开始拖拽会话
     *
     * 绑定拖拽手势监听，组件进入可拖拽状态。
     * 典型场景：点击按钮后进入拖拽模式。
     *
     * @param key - 拖拽 key
     *
     * @example
     * onButtonClick() { this.startDrag('handle'); }
     */
    startDrag(key: string): void {
        const dragKey = `${this.id}:${key}`;
        this.dragEmit(
            EventContextBuilder.create()
                .withEvent(`drag:${dragKey}:${DRAG_ACTIONS.START}`)
                .withType(DRAG_ACTIONS.START)
                .withSource(dragKey)
                .withData({ component: this, key })
                .build()
        );
    },

    /**
     * 停止拖拽会话
     *
     * 解绑拖拽手势监听，组件退出可拖拽状态。
     * 典型场景：拖拽完成后退出模式。
     *
     * @param key - 拖拽 key
     *
     * @example
     * onHandleDragEnd() { this.stopDrag('handle'); }
     */
    stopDrag(key: string): void {
        const dragKey = `${this.id}:${key}`;
        this.dragEmit(
            EventContextBuilder.create()
                .withEvent(`drag:${dragKey}:${DRAG_ACTIONS.STOP}`)
                .withType(DRAG_ACTIONS.STOP)
                .withSource(dragKey)
                .withData({ component: this, key })
                .build()
        );
    },

    // ══════════════════════════════════════════════════════════════
    // 放置区管理
    // ══════════════════════════════════════════════════════════════

    /**
     * 提交初始化阶段的放置区配置
     *
     * 解析优先级（从高到低）：
     * 1. drop === false → 禁用所有放置区
     * 2. drop === true/DropDecl + dropZone → 启用指定节点
     * 3. drop === true/DropDecl → 启用模板中 drop:true 的节点
     * 4. drop === undefined → 仅使用模板声明
     */
    _commitDrops(): void {
        const componentId = this.id;
        if (!componentId) return;

        const dropMode = (this as any).drop;

        // 1. drop === false: 禁用所有放置区
        if (dropMode === false) return;

        const nodeMap = (this as any).nodeMap;
        const dropZone = (this as any).dropZone;

        // 2. drop 有值（true 或 DropDecl）
        if (dropMode !== undefined && dropMode !== null) {
            // 2a. 如果设置了 dropZone，使用指定节点
            if (dropZone) {
                const el = nodeMap?.[dropZone]?.el ?? this.el;
                if (el) {
                    const config = typeof dropMode === 'object' ? dropMode : {};
                    const dropKey = `${componentId}:${dropZone}`;
                    dragDispatchCenter.registerDropZone(dropKey, el, this, dropZone, config);
                }
                return;
            }

            // 2b. 否则使用模板中的 drop:true 节点
            let registered = false;
            if (nodeMap) {
                for (const [nodeName, nodeMetaRaw] of Object.entries(nodeMap)) {
                    if (nodeName === 'root') continue;
                    const nodeMeta = nodeMetaRaw as Record<string, any>;
                    const nodeDrop = nodeMeta?.drop;
                    if (!nodeDrop) continue;

                    const el = nodeMeta.el;
                    if (!el) continue;

                    const config = typeof nodeDrop === 'object' ? nodeDrop : {};
                    const dropKey = `${componentId}:${nodeName}`;
                    dragDispatchCenter.registerDropZone(dropKey, el, this, nodeName, config);
                    registered = true;
                }
            }

            // 2c. 都没有，默认 self
            if (!registered) {
                const el = this.el;
                if (el) {
                    const config = typeof dropMode === 'object' ? dropMode : {};
                    const dropKey = `${componentId}:self`;
                    dragDispatchCenter.registerDropZone(dropKey, el, this, 'self', config);
                }
            }
            return;
        }

        // 3. drop === undefined: 仅使用模板中的 drop 声明
        if (nodeMap) {
            for (const [nodeName, nodeMetaRaw] of Object.entries(nodeMap)) {
                if (nodeName === 'root') continue;
                const nodeMeta = nodeMetaRaw as Record<string, any>;
                const nodeDrop = nodeMeta?.drop;
                if (!nodeDrop) continue;

                const el = nodeMeta.el;
                if (!el) continue;

                const config = typeof nodeDrop === 'object' ? nodeDrop : {};
                const dropKey = `${componentId}:${nodeName}`;
                dragDispatchCenter.registerDropZone(dropKey, el, this, nodeName, config);
            }
        }
    },

    /**
     * 动态挂载放置区
     *
     * @param key - 放置区 key（通常为节点 name）
     * @param decl - 放置区配置
     *
     * @example
     * this.attachDropZone('dropZone', { accept: ['card'], activeClass: 'drag-over' });
     */
    attachDropZone(key: string, decl: DropDecl = {}): void {
        const componentId = this.id;
        if (!componentId) return;

        const nodeMap = (this as any).nodeMap;
        const el = nodeMap?.[key]?.el ?? this.el;
        if (!el) return;

        const dropKey = `${componentId}:${key}`;
        dragDispatchCenter.registerDropZone(dropKey, el, this, key, decl);
    },

    /**
     * 动态卸载放置区
     *
     * @param key - 要卸载的放置区 key
     *
     * @example
     * this.detachDropZone('dropZone');
     */
    detachDropZone(key: string): void {
        const componentId = this.id;
        if (!componentId) return;

        const dropKey = `${componentId}:${key}`;
        dragDispatchCenter.unregisterDropZone(dropKey);
    },

    // ══════════════════════════════════════════════════════════════
    // 便捷开关方法（推荐）
    // ══════════════════════════════════════════════════════════════

    /**
     * 便捷开关：启用/禁用拖拽
     *
     * 根据 dragHandle 和模板中的 drag 声明自动查找手柄节点。
     *
     * @param enabled - true 启用，false 禁用
     * @param config - 可选配置（覆盖默认）
     *
     * @example
     * // 开关拖拽
     * card.setDraggable(true);   // 启用
     * card.setDraggable(false);  // 禁用
     *
     * // 带配置启用
     * card.setDraggable(true, { axis: 'both' });
     */
    setDraggable(enabled: boolean, config?: DragDecl): void {
        if (enabled) {
            const nodeMap = (this as any).nodeMap;
            const dragHandle = (this as any).dragHandle;

            if (config) {
                // 如果指定了 dragHandle，使用它
                if (dragHandle) {
                    this.attachDrag(dragHandle, config);
                } else {
                    // 使用模板中的 drag 节点
                    let attached = false;
                    if (nodeMap) {
                        for (const [nodeName, nodeMeta] of Object.entries(nodeMap)) {
                            if (nodeName === 'root') continue;
                            const nodeDrag = (nodeMeta as any)?.drag;
                            if (nodeDrag) {
                                this.attachDrag(nodeName, config);
                                attached = true;
                            }
                        }
                    }
                    // 默认 self
                    if (!attached) {
                        this.attachDrag('self', config);
                    }
                }
            } else {
                // 使用默认配置
                if (dragHandle) {
                    this.attachDrag(dragHandle, {});
                } else {
                    // 使用模板中的 drag 节点
                    let attached = false;
                    if (nodeMap) {
                        for (const [nodeName, nodeMeta] of Object.entries(nodeMap)) {
                            if (nodeName === 'root') continue;
                            const nodeDrag = (nodeMeta as any)?.drag;
                            if (nodeDrag) {
                                const dragConfig = typeof nodeDrag === 'object' ? nodeDrag : {};
                                this.attachDrag(nodeName, dragConfig);
                                attached = true;
                            }
                        }
                    }
                    // 默认 self
                    if (!attached) {
                        this.attachDrag('self', {});
                    }
                }
            }
        } else {
            // 禁用所有拖拽
            const cache = getDragsCache(this);
            for (const key of Object.keys(cache)) {
                this.detachDrag(key);
            }
        }
    },

    /**
     * 便捷开关：启用/禁用放置区
     *
     * 根据 dropZone 和模板中的 drop 声明自动查找放置节点。
     *
     * @param enabled - true 启用，false 禁用
     * @param config - 可选配置（覆盖默认）
     *
     * @example
     * // 开关放置区
     * container.setDropZone(true);   // 启用
     * container.setDropZone(false);  // 禁用
     *
     * // 带配置启用
     * container.setDropZone(true, { accept: ['Card'], activeClass: 'drag-over' });
     */
    setDropZone(enabled: boolean, config?: DropDecl): void {
        if (enabled) {
            const nodeMap = (this as any).nodeMap;
            const dropZone = (this as any).dropZone;

            if (config) {
                if (dropZone) {
                    this.attachDropZone(dropZone, config);
                } else {
                    // 使用模板中的 drop 节点
                    let attached = false;
                    if (nodeMap) {
                        for (const [nodeName, nodeMeta] of Object.entries(nodeMap)) {
                            if (nodeName === 'root') continue;
                            const nodeDrop = (nodeMeta as any)?.drop;
                            if (nodeDrop) {
                                this.attachDropZone(nodeName, config);
                                attached = true;
                            }
                        }
                    }
                    if (!attached) {
                        this.attachDropZone('self', config);
                    }
                }
            } else {
                if (dropZone) {
                    this.attachDropZone(dropZone);
                } else {
                    // 使用模板中的 drop 节点
                    let attached = false;
                    if (nodeMap) {
                        for (const [nodeName, nodeMeta] of Object.entries(nodeMap)) {
                            if (nodeName === 'root') continue;
                            const nodeDrop = (nodeMeta as any)?.drop;
                            if (nodeDrop) {
                                const dropConfig = typeof nodeDrop === 'object' ? nodeDrop : {};
                                this.attachDropZone(nodeName, dropConfig);
                                attached = true;
                            }
                        }
                    }
                    if (!attached) {
                        this.attachDropZone('self');
                    }
                }
            }
        } else {
            // 禁用所有放置区
            const componentId = this.id;
            if (!componentId) return;

            const nodeMap = (this as any).nodeMap;
            if (nodeMap) {
                for (const nodeName of Object.keys(nodeMap)) {
                    if (nodeName === 'root') continue;
                    this.detachDropZone(nodeName);
                }
            }
            this.detachDropZone('self');
        }
    },
};