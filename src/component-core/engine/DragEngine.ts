/**
 * DragEngine — 拖拽引擎（单例）
 *
 * 为组件提供拖拽的完整生命周期管理，与 FloatEngine 对称。
 *
 * 架构分层：
 *   1. 缓存层 — abilityState 读写，屏蔽存储细节
 *   2. 引擎层 — diff/sync + 事件发射，驱动拖拽生命周期
 *   3. 解析层 — 解析 drag/drop 配置，支持声明式 + 命令式
 *   4. API 层 — attach/detach/start/stop，对外暴露
 *
 * 使用场景：
 *   - Self-Drag：Dialog 窗口拖动
 *   - Drag & Drop：卡片拖入容器
 *
 * @see DragAbility for facade
 */

import type { DragDecl, DropDecl } from '../types/tpl-node-types';
import { EventContextBuilder } from '@/context';
import { DRAG_ACTIONS } from '@/events';
import { dragDispatchCenter } from '@/drag/DragDispatchCenter';
import { getId } from '@/utils/string';

// ══════════════════════════════════════════════════════════════
// DragEngine 单例类
// ══════════════════════════════════════════════════════════════

export class DragEngine {
    private static instance: DragEngine;

    private constructor() {}

    static getInstance(): DragEngine {
        if (!DragEngine.instance) {
            DragEngine.instance = new DragEngine();
        }
        return DragEngine.instance;
    }

    // ── 缓存管理 ──

    private readonly DRAGS_CACHE_KEY = 'DragAbility:cache';

    getCache(self: any): Record<string, DragDecl> {
        return self.abilityState(this.DRAGS_CACHE_KEY, () => ({})) ?? {};
    }

    setCache(self: any, val: Record<string, DragDecl>): void {
        self.setAbilityState(this.DRAGS_CACHE_KEY, val);
    }

    // ── 工具方法 ──

    private ensureComponentId(self: any): string {
        if (!self.id) {
            self.id = self.props?.id || getId('cmp');
        }
        return self.id;
    }

    private getNodeMap(self: any): Record<string, any> {
        return self.nodeMap ?? {};
    }

    // ── 事件发射 ──

    emitDragInit(self: any, key: string, decl: DragDecl): void {
        const componentId = this.ensureComponentId(self);
        self.dragEmit(
            EventContextBuilder.create()
                .withEvent(`drag:${componentId}:${DRAG_ACTIONS.INIT}`)
                .withType(DRAG_ACTIONS.INIT)
                .withSource(componentId)
                .withData({ component: self, drags: { [key]: decl } })
                .build()
        );
    }

    emitDragAction(self: any, key: string, action: string): void {
        const dragKey = `${self.id}:${key}`;
        self.dragEmit(
            EventContextBuilder.create()
                .withEvent(`drag:${dragKey}:${action}`)
                .withType(action)
                .withSource(dragKey)
                .withData({ component: self })
                .build()
        );
    }

    // ── Diff & Sync ──

    syncDrags(self: any, prev: Record<string, DragDecl>, next: Record<string, DragDecl>): void {
        this.ensureComponentId(self);

        const prevKeys = Object.keys(prev);
        const nextKeys = Object.keys(next);

        const removed = prevKeys.filter(k => !nextKeys.includes(k));
        const added = nextKeys.filter(k => !prevKeys.includes(k));
        const maybeChanged = nextKeys.filter(k => prevKeys.includes(k));

        for (const key of removed) {
            this.emitDragAction(self, key, DRAG_ACTIONS.DISPOSE);
        }

        for (const key of added) {
            this.emitDragInit(self, key, next[key]);
        }

        for (const key of maybeChanged) {
            if (JSON.stringify(prev[key]) !== JSON.stringify(next[key])) {
                this.emitDragAction(self, key, DRAG_ACTIONS.DISPOSE);
                this.emitDragInit(self, key, next[key]);
            }
        }
    }

    // ── getter/setter 逻辑 ──

    getDrags(self: any): Record<string, DragDecl> | undefined {
        const cache = this.getCache(self);
        return Object.keys(cache).length > 0 ? cache : undefined;
    }

    setDrags(self: any, val: Record<string, DragDecl> | undefined): void {
        const prev = this.getCache(self);

        if (self._initializing) {
            const merged = val ? { ...prev, ...val } : prev;
            this.setCache(self, merged);
            return;
        }

        this.setCache(self, val ?? {});
        this.syncDrags(self, prev, val ?? {});
    }

    // ── 拖拽提交 ──

    commitDrags(self: any): void {
        const cache = this.getCache(self);
        const dragMode = self.drag;

        // 1. drag === false: 禁用所有拖拽
        if (dragMode === false) {
            if (Object.keys(cache).length > 0) {
                this.setCache(self, cache);
                this.syncDrags(self, {}, cache);
            }
            return;
        }

        const nodeMap = this.getNodeMap(self);
        const dragHandle = self.dragHandle;

        // 0. 检查节点级 dragHandle 标记
        let nodeDragHandle: string | undefined;
        if (nodeMap) {
            for (const [nodeName, nodeMeta] of Object.entries(nodeMap)) {
                if (nodeName === 'root') continue;
                if ((nodeMeta as any)?.dragHandle === true) {
                    nodeDragHandle = nodeName;
                    break;
                }
            }
        }

        // 2. drag 有值（true 或 DragDecl）
        if (dragMode !== undefined && dragMode !== null) {
            const handleConfig = typeof dragMode === 'object' ? dragMode : {};

            // 2a. 组件级 dragHandle > 节点级 dragHandle > 无
            const effectiveHandle = dragHandle || nodeDragHandle;
            if (effectiveHandle) {
                if (!cache[effectiveHandle]) {
                    cache[effectiveHandle] = handleConfig as DragDecl;
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
            }
            // 2c. 没有模板 drag 节点，默认 self
            if (!effectiveHandle) {
                const hasTemplateDrag =
                    nodeMap &&
                    Object.keys(nodeMap).some((n: string) => n !== 'root' && nodeMap[n]?.drag);
                if (!hasTemplateDrag) {
                    if (!cache['self']) {
                        cache['self'] = handleConfig as DragDecl;
                    }
                }
            }
        }

        // 3. drag === undefined: 仅使用模板中的 drag 声明 + 节点级 dragHandle
        if (dragMode === undefined && nodeMap) {
            if (nodeDragHandle && !cache[nodeDragHandle]) {
                cache[nodeDragHandle] = {} as DragDecl;
            }
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

        this.setCache(self, cache);
        this.syncDrags(self, {}, cache);
    }

    // ── 放置区提交 ──

    commitDrops(self: any): void {
        const componentId = self.id;
        if (!componentId) return;

        const dropMode = self.drop;

        // 1. drop === false: 禁用所有放置区
        if (dropMode === false) return;

        const nodeMap = this.getNodeMap(self);
        const dropZone = self.dropZone;

        // 0. 检查节点级 dropZone 标记
        let nodeDropZone: string | undefined;
        if (nodeMap) {
            for (const [nodeName, nodeMeta] of Object.entries(nodeMap)) {
                if (nodeName === 'root') continue;
                if ((nodeMeta as any)?.dropZone === true) {
                    nodeDropZone = nodeName;
                    break;
                }
            }
        }

        // 2. drop 有值（true 或 DropDecl）
        if (dropMode !== undefined && dropMode !== null) {
            // 2a. 组件级 dropZone > 节点级 dropZone > 无
            const effectiveZone = dropZone || nodeDropZone;
            if (effectiveZone) {
                const el = nodeMap?.[effectiveZone]?.el ?? self.el;
                if (el) {
                    const config = typeof dropMode === 'object' ? dropMode : {};
                    const dropKey = `${componentId}:${effectiveZone}`;
                    dragDispatchCenter.registerDropZone(dropKey, el, self, effectiveZone, config);
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
                    dragDispatchCenter.registerDropZone(dropKey, el, self, nodeName, config);
                    registered = true;
                }
            }

            // 2c. 都没有，默认 self
            if (!registered) {
                const el = self.el;
                if (el) {
                    const config = typeof dropMode === 'object' ? dropMode : {};
                    const dropKey = `${componentId}:self`;
                    dragDispatchCenter.registerDropZone(dropKey, el, self, 'self', config);
                }
            }
            return;
        }

        // 3. drop === undefined: 仅使用模板中的 drop 声明 + 节点级 dropZone
        if (nodeDropZone) {
            const el = nodeMap?.[nodeDropZone]?.el ?? self.el;
            if (el) {
                const dropKey = `${componentId}:${nodeDropZone}`;
                dragDispatchCenter.registerDropZone(dropKey, el, self, nodeDropZone, {});
            }
        }
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
                dragDispatchCenter.registerDropZone(dropKey, el, self, nodeName, config);
            }
        }
    }

    // ── 拖拽 API ──

    attachDrag(self: any, key: string, decl: DragDecl): void {
        const current = this.getCache(self);
        this.setDrags(self, { ...current, [key]: decl });
    }

    detachDrag(self: any, key: string): void {
        const current = this.getCache(self);
        if (!current[key]) return;
        const next = { ...current };
        delete next[key];
        this.setDrags(self, Object.keys(next).length > 0 ? next : undefined);
    }

    startDrag(self: any, key: string): void {
        const dragKey = `${self.id}:${key}`;
        self.dragEmit(
            EventContextBuilder.create()
                .withEvent(`drag:${dragKey}:${DRAG_ACTIONS.START}`)
                .withType(DRAG_ACTIONS.START)
                .withSource(dragKey)
                .withData({ component: self, key })
                .build()
        );
    }

    stopDrag(self: any, key: string): void {
        const dragKey = `${self.id}:${key}`;
        self.dragEmit(
            EventContextBuilder.create()
                .withEvent(`drag:${dragKey}:${DRAG_ACTIONS.STOP}`)
                .withType(DRAG_ACTIONS.STOP)
                .withSource(dragKey)
                .withData({ component: self, key })
                .build()
        );
    }

    // ── 放置区 API ──

    attachDropZone(self: any, key: string, decl: DropDecl = {}): void {
        const componentId = self.id;
        if (!componentId) return;

        const nodeMap = this.getNodeMap(self);
        const el = nodeMap?.[key]?.el ?? self.el;
        if (!el) return;

        const dropKey = `${componentId}:${key}`;
        dragDispatchCenter.registerDropZone(dropKey, el, self, key, decl);
    }

    detachDropZone(self: any, key: string): void {
        const componentId = self.id;
        if (!componentId) return;

        const dropKey = `${componentId}:${key}`;
        dragDispatchCenter.unregisterDropZone(dropKey);
    }

    // ── 便捷开关 ──

    setDraggable(self: any, enabled: boolean, config?: DragDecl): void {
        if (enabled) {
            const nodeMap = this.getNodeMap(self);
            const dragHandle = self.dragHandle;

            if (config) {
                if (dragHandle) {
                    this.attachDrag(self, dragHandle, config);
                } else {
                    let attached = false;
                    if (nodeMap) {
                        for (const [nodeName, nodeMeta] of Object.entries(nodeMap)) {
                            if (nodeName === 'root') continue;
                            const nodeDrag = (nodeMeta as any)?.drag;
                            if (nodeDrag) {
                                this.attachDrag(self, nodeName, config);
                                attached = true;
                            }
                        }
                    }
                    if (!attached) {
                        this.attachDrag(self, 'self', config);
                    }
                }
            } else {
                if (dragHandle) {
                    this.attachDrag(self, dragHandle, {});
                } else {
                    let attached = false;
                    if (nodeMap) {
                        for (const [nodeName, nodeMeta] of Object.entries(nodeMap)) {
                            if (nodeName === 'root') continue;
                            const nodeDrag = (nodeMeta as any)?.drag;
                            if (nodeDrag) {
                                const dragConfig = typeof nodeDrag === 'object' ? nodeDrag : {};
                                this.attachDrag(self, nodeName, dragConfig);
                                attached = true;
                            }
                        }
                    }
                    if (!attached) {
                        this.attachDrag(self, 'self', {});
                    }
                }
            }
        } else {
            const cache = this.getCache(self);
            for (const key of Object.keys(cache)) {
                this.detachDrag(self, key);
            }
        }
    }

    setDropZone(self: any, enabled: boolean, config?: DropDecl): void {
        if (enabled) {
            const nodeMap = this.getNodeMap(self);
            const dropZone = self.dropZone;

            if (config) {
                if (dropZone) {
                    this.attachDropZone(self, dropZone, config);
                } else {
                    let attached = false;
                    if (nodeMap) {
                        for (const [nodeName, nodeMeta] of Object.entries(nodeMap)) {
                            if (nodeName === 'root') continue;
                            const nodeDrop = (nodeMeta as any)?.drop;
                            if (nodeDrop) {
                                this.attachDropZone(self, nodeName, config);
                                attached = true;
                            }
                        }
                    }
                    if (!attached) {
                        this.attachDropZone(self, 'self', config);
                    }
                }
            } else {
                if (dropZone) {
                    this.attachDropZone(self, dropZone);
                } else {
                    let attached = false;
                    if (nodeMap) {
                        for (const [nodeName, nodeMeta] of Object.entries(nodeMap)) {
                            if (nodeName === 'root') continue;
                            const nodeDrop = (nodeMeta as any)?.drop;
                            if (nodeDrop) {
                                const dropConfig = typeof nodeDrop === 'object' ? nodeDrop : {};
                                this.attachDropZone(self, nodeName, dropConfig);
                                attached = true;
                            }
                        }
                    }
                    if (!attached) {
                        this.attachDropZone(self, 'self');
                    }
                }
            }
        } else {
            const componentId = self.id;
            if (!componentId) return;

            const nodeMap = this.getNodeMap(self);
            if (nodeMap) {
                for (const nodeName of Object.keys(nodeMap)) {
                    if (nodeName === 'root') continue;
                    this.detachDropZone(self, nodeName);
                }
            }
            this.detachDropZone(self, 'self');
        }
    }
}
