/**
 * OverlayUpdateAbility — 浮层更新能力
 *
 * 为组件提供 updateBadge / updateTooltip 便捷方法，
 * 内部通过组件已有的 overlayEmit 能力发送 CHANGE 事件。
 *
 * 调用方只需：button.updateBadge({ text: '5' })
 * 无需手动构建 EventContext。
 *
 * 约定：
 * - floats 中 badge 的 key 必须为 'badge'
 * - floats 中 tooltip 的 key 必须为 'tooltip'
 * - overlayKey 格式为 `${componentId}:${nodeName}`（与 _handleInit 一致）
 */

import type { AbilityDefinition } from '@/composable';
import { EventContextBuilder } from '@/context';
import { OVERLAY_ACTIONS } from '@/events/overlay-events';

export const OverlayUpdateAbility: AbilityDefinition = {
    /**
     * 更新 Badge 浮层内容
     *
     * 通过 overlayEmit 发送 CHANGE 事件，
     * 由 BadgeComponent.onOverlayChange 处理实际更新。
     *
     * @param {Record<string, any>} data - 更新数据（如 { text: '5', visible: true }）
     *
     * @example
     * this.updateBadge({ text: '5' });
     * this.updateBadge({ visible: false });
     */
    updateBadge(data: Record<string, any>): void {
        const overlayKey = `${this.id}:badge`;
        this.overlayEmit(
            EventContextBuilder.create()
                .withEvent(`overlay:${overlayKey}:${OVERLAY_ACTIONS.CHANGE}`)
                .withType(OVERLAY_ACTIONS.CHANGE)
                .withSource(overlayKey)
                .withData({ component: { id: this.id }, data })
                .build()
        );
    },

    /**
     * 更新 Tooltip 浮层内容
     *
     * 通过 overlayEmit 发送 CHANGE 事件，
     * 由 TooltipComponent.onOverlayChange 处理实际更新。
     *
     * @param {Record<string, any>} data - 更新数据（如 { tooltip: '提示文本' }）
     *
     * @example
     * this.updateTooltip({ tooltip: '新提示' });
     * this.updateTooltip({ visible: false });
     */
    updateTooltip(data: Record<string, any>): void {
        const overlayKey = `${this.id}:tooltip`;
        this.overlayEmit(
            EventContextBuilder.create()
                .withEvent(`overlay:${overlayKey}:${OVERLAY_ACTIONS.CHANGE}`)
                .withType(OVERLAY_ACTIONS.CHANGE)
                .withSource(overlayKey)
                .withData({ component: { id: this.id }, data })
                .build()
        );
    },
};
