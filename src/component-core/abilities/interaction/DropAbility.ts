/**
 * DropAbility — 放置区能力
 *
 * 通过 DragEventBus 的 dropInit/dropDispose 通道通知 DragDispatchCenter，
 * 组件不感知调度中心。
 *
 * 通信链路：
 *   能力 → dropInit/dropDispose → DragEventBus → DragDispatchCenter
 *
 * 放置回调约定（由调度中心在组件上查找）：
 *   on${capitalize(zone)}DragEnter / DragLeave / DragDrop，
 *   或通过配置的 onDrop 指定方法名。
 *
 * @example
 * // 组件 options 中声明
 * drop: true
 * drop: { accept: ['Card'], activeClass: 'drop-active' }
 * drop: { accept: ['Card'], onDrop: 'handleDrop' }
 */

import type { AbilityDefinition } from '@/composable';
import type { DropOptions } from '../../types';

/** 放置区能力，提供 attach/detach/setDropZone 等 API */
export const DropAbility: AbilityDefinition = {
    // ── 提交 ──

    /**
     * 提交放置区状态：drop 有值（true 或 DropOptions）→ 注册，
     * drop 为 false/null/undefined → 注销
     */
    _commitDrops(): void {
        const componentId = this.id;
        if (!componentId) return;

        const dropMode = this.drop;
        const zone = this.dropZone || 'self';

        if (dropMode === false || dropMode === null || dropMode === undefined) {
            this.dropDispose(componentId, zone);
            return;
        }

        const el = this.el;
        if (!el) return;

        this.dropInit(this, zone, typeof dropMode === 'object' ? dropMode : {});
    },

    // ── 结构变更方法 ──

    /**
     * 附加放置区
     *
     * @param zone - 放置区名
     * @param options - 放置区配置
     *
     * @example
     * this.attachDropZone('content', { accept: ['Card'] });
     */
    attachDropZone(zone: string, options: DropOptions = {}): void {
        this.dropInit(this, zone, options);
    },

    /**
     * 分离放置区
     *
     * @param zone - 放置区名
     *
     * @example
     * this.detachDropZone('content');
     */
    detachDropZone(zone: string): void {
        const componentId = this.id;
        if (!componentId) return;
        this.dropDispose(componentId, zone);
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
    setDropZone(enabled: boolean, config?: DropOptions): void {
        const zone = this.dropZone || 'self';

        if (enabled) {
            this.dropInit(this, zone, config || {});
        } else {
            this.detachDropZone(zone);
        }
    },
} satisfies AbilityDefinition;
