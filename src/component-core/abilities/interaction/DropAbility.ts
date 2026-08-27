/**
 * DropAbility — 放置区能力
 *
 * 提供放置区的完整生命周期管理，通过 DragDispatchCenter 注册/注销放置区。
 * 采用懒注册模式：在 _commitDrops 阶段从组件配置解析放置区并注册。
 *
 * 通信链路：
 *   能力 → dragDispatchCenter.registerDropZone → DragDispatchCenter 管理放置区事件
 *
 * @example
 * // 组件 options 中声明
 * drop: true
 * drop: { accept: ['Card'], activeClass: 'drop-active' }
 * drop: { accept: ['Card'], onDrop: 'handleDrop' }
 */

import type { AbilityDefinition } from '@/composable';
import { dragDispatchCenter } from '@/component-core/drag';
import type { DragOptions } from '../../types';

/** 放置区能力，提供 attach/detach/setDropZone 等 API */
export const DropAbility: AbilityDefinition = {
    // ── 提交 ──

    _commitDrops(): void {
        const componentId = this.id;
        if (!componentId) return;

        const dropMode = this.drop;

        // drop === false: 禁用所有放置区
        if (dropMode === false) return;

        const nodeMap = this.nodeMap ?? {};
        const dropZone = this.dropZone;

        // 检查节点级 dropZone 标记
        let nodeDropZone: string | undefined;
        for (const [nodeName, nodeMeta] of Object.entries(nodeMap)) {
            if (nodeName === 'root') continue;
            if ((nodeMeta as any)?.dropZone === true) {
                nodeDropZone = nodeName;
                break;
            }
        }

        // drop 有值（true 或 DropOptions）
        if (dropMode !== undefined && dropMode !== null) {
            const effectiveZone = dropZone || nodeDropZone;
            if (effectiveZone) {
                const el = (nodeMap as any)?.[effectiveZone]?.el ?? this.el;
                if (el) {
                    const config = typeof dropMode === 'object' ? dropMode : {};
                    const dropKey = `${componentId}:${effectiveZone}`;
                    dragDispatchCenter.registerDropZone(dropKey, el, this, effectiveZone, config);
                }
                return;
            }

            // 使用模板中的 drop:true 节点
            let registered = false;
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

            // 都没有，默认 self
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

        // drop === undefined: 仅使用模板中的 drop 声明 + 节点级 dropZone
        if (nodeDropZone) {
            const el = (nodeMap as any)?.[nodeDropZone]?.el ?? this.el;
            if (el) {
                const dropKey = `${componentId}:${nodeDropZone}`;
                dragDispatchCenter.registerDropZone(dropKey, el, this, nodeDropZone, {});
            }
        }
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
    },

    // ── 结构变更方法 ──

    /**
     * 附加放置区
     *
     * @param key - 节点名
     * @param options - 放置区配置
     *
     * @example
     * this.attachDropZone('content', { accept: ['Card'] });
     */
    attachDropZone(key: string, options: DragOptions = {}): void {
        const componentId = this.id;
        if (!componentId) return;

        const nodeMap = this.nodeMap ?? {};
        const el = (nodeMap as any)?.[key]?.el ?? this.el;
        if (!el) return;

        const dropKey = `${componentId}:${key}`;
        dragDispatchCenter.registerDropZone(dropKey, el, this, key, options);
    },

    /**
     * 分离放置区
     *
     * @param key - 节点名
     *
     * @example
     * this.detachDropZone('content');
     */
    detachDropZone(key: string): void {
        const componentId = this.id;
        if (!componentId) return;

        const dropKey = `${componentId}:${key}`;
        dragDispatchCenter.unregisterDropZone(dropKey);
    },

    // ── 便捷开关 ──

    /**
     * 设置放置区启用状态
     *
     * @param enabled - 是否启用
     * @param config - 放置区配置（可选）
     *
     * @example
     * this.setDropZone(true);
     * this.setDropZone(true, { accept: ['Card'] });
     * this.setDropZone(false);
     */
    setDropZone(enabled: boolean, config?: DragOptions): void {
        if (enabled) {
            const nodeMap = this.nodeMap ?? {};
            const dropZone = this.dropZone;

            if (config) {
                if (dropZone) {
                    this.attachDropZone(dropZone, config);
                } else {
                    let attached = false;
                    for (const [nodeName, nodeMeta] of Object.entries(nodeMap)) {
                        if (nodeName === 'root') continue;
                        if ((nodeMeta as any)?.drop) {
                            this.attachDropZone(nodeName, config);
                            attached = true;
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
                    let attached = false;
                    for (const [nodeName, nodeMeta] of Object.entries(nodeMap)) {
                        if (nodeName === 'root') continue;
                        const nodeDrop = (nodeMeta as any)?.drop;
                        if (nodeDrop) {
                            const dropConfig = typeof nodeDrop === 'object' ? nodeDrop : {};
                            this.attachDropZone(nodeName, dropConfig);
                            attached = true;
                        }
                    }
                    if (!attached) {
                        this.attachDropZone('self');
                    }
                }
            }
        } else {
            const componentId = this.id;
            if (!componentId) return;

            const nodeMap = this.nodeMap ?? {};
            for (const nodeName of Object.keys(nodeMap)) {
                if (nodeName === 'root') continue;
                this.detachDropZone(nodeName);
            }
            this.detachDropZone('self');
        }
    },
};
