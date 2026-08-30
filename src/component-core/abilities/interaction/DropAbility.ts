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

        // drop === false 或 undefined: 禁用所有放置区
        if (dropMode === false || dropMode === undefined) return;

        const dropZone = this.dropZone;
        const el = this.el;
        if (!el) return;

        const effectiveZone = dropZone || 'self';
        const config = typeof dropMode === 'object' ? dropMode : {};
        const dropKey = `${componentId}:${effectiveZone}`;
        dragDispatchCenter.registerDropZone(dropKey, el, this, effectiveZone, config);
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

        const el = this.el;
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
        const componentId = this.id;
        if (!componentId) return;

        if (enabled) {
            const dropZone = this.dropZone;
            const el = this.el;
            if (!el) return;

            const effectiveZone = dropZone || 'self';
            const dropConfig = config || {};
            const dropKey = `${componentId}:${effectiveZone}`;
            dragDispatchCenter.registerDropZone(dropKey, el, this, effectiveZone, dropConfig);
        } else {
            this.detachDropZone('self');
        }
    },
};
