/**
 * TooltipAbility — Tooltip 专属能力
 *
 * 从 OverlayAbility 中拆分出来的 tooltip 专属逻辑。
 * 提供 tooltip 属性访问和 tooltip 浮层初始化。
 *
 * 依赖 OverlayAbility 的 createOverlay 方法。
 * 需要同时注入 OverlayAbility 和 TooltipAbility 才能使用 tooltip 功能。
 */

import type { AbilityDefinition } from '@/composable';
import type { Placement } from './positionOverlay';

/**
 * 支持的 tooltip key 类型
 */
export type TooltipKey = 'tooltip' | 'tooltipPlacement' | 'tooltipOffset' | 'tooltipShowDelay' | 'tooltipHideDelay' | 'tooltipMaxWidth' | 'tooltipType' | 'tooltipArrow';

/**
 * Tooltip 初始化配置
 */
export interface TooltipOverlayConfig {
    /** Tooltip 文本内容 */
    tooltip?: string;
    /** 弹出方向，默认 'top' */
    tooltipPlacement?: Placement;
    /** 间距，默认 4 */
    tooltipOffset?: number;
    /** 显示延迟，默认 0 */
    tooltipShowDelay?: number;
    /** 隐藏延迟，默认 0 */
    tooltipHideDelay?: number;
    /** 浮层组件类型名，默认 'Tips' */
    tooltipType?: string;
    /** 是否显示箭头，默认 true */
    tooltipArrow?: boolean;
}

/**
 * tooltip 默认值
 */
const TOOLTIP_DEFAULTS: Record<string, any> = {
    tooltipPlacement: 'top',
    tooltipOffset: 4,
    tooltipShowDelay: 0,
    tooltipHideDelay: 0,
    tooltipType: 'Tips',
};

export const TooltipAbility: AbilityDefinition = {
    // ─── Tooltip 属性访问方法 ───

    getTooltip(key: TooltipKey): any {
        if (key in TOOLTIP_DEFAULTS) {
            return this.props[key] ?? TOOLTIP_DEFAULTS[key];
        }
        return this.props[key];
    },

    setTooltip(key: TooltipKey, value: any): void {
        this.setProp(key, value);
    },

    /**
     * 初始化 Tooltip 浮层 — 配置驱动
     *
     * 从 ComponentRegistrar 查找 Tips 组件类（或 tooltipType 指定的类），
     * 创建实例并传入 anchor 和全部配置。
     * 浮层组件自身负责 hover 事件、delay、i18n 内容等。
     */
    initTooltipOverlay(config: TooltipOverlayConfig): void {
        const tooltipType = config.tooltipType ?? 'Tips';

        this.createOverlay({
            prefix: 'tips',
            typeOverride: tooltipType !== 'Tips' ? tooltipType : undefined,
            overlayProps: config,
        });
    },
};
