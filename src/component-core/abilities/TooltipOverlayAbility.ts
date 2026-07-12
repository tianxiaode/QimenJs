/**
 * TooltipOverlayAbility — Tooltip 浮层能力
 *
 * 组合 OverlayHostAbility，提供 tooltip 特有逻辑：
 * - hover 事件绑定（通过 DomEventsAbility.bind）
 * - show/hide delay
 * - i18n 内容管理
 * - open/close 生命周期
 *
 * 使用方式：
 * 1. 浮层组件声明 abilities 包含 [OverlayHostAbility, TooltipOverlayAbility]
 * 2. constructor 中调用 initOverlayHost() + initTooltipOverlay()
 * 3. 其余自动处理
 */

import type { AbilityDefinition } from '@/composable';
import { ZIndexLevel } from '@/component/z-index';
import { getI18nManager, I18N_PREFIX } from '@qimenjs/i18n';
import type { Placement } from './positionOverlay';

/**
 * Tooltip 浮层配置
 */
export interface TooltipOverlayConfig {
    /** 锚点元素 */
    anchor?: HTMLElement;
    /** Tooltip 文本内容 */
    tooltip?: string;
    /** 弹出方向，默认 'top' */
    tooltipPlacement?: Placement;
    /** 间距，默认 4 */
    tooltipOffset?: number;
    /** 显示延迟（毫秒），默认 0 */
    tooltipShowDelay?: number;
    /** 隐藏延迟（毫秒），默认 0 */
    tooltipHideDelay?: number;
}

export const TooltipOverlayAbility: AbilityDefinition = {
    // ─── Tooltip 属性 ───

    _tooltipText: {
        get(): string {
            return this.abilityState('TooltipOverlayAbility:text', '');
        },
        set(value: string) {
            this.setAbilityState('TooltipOverlayAbility:text', value);
        },
    },

    _showDelay: {
        get(): number {
            return this.abilityState('TooltipOverlayAbility:showDelay', 0);
        },
        set(value: number) {
            this.setAbilityState('TooltipOverlayAbility:showDelay', value);
        },
    },

    _hideDelay: {
        get(): number {
            return this.abilityState('TooltipOverlayAbility:hideDelay', 0);
        },
        set(value: number) {
            this.setAbilityState('TooltipOverlayAbility:hideDelay', value);
        },
    },

    /**
     * 初始化 Tooltip 浮层
     *
     * 从配置中读取参数，绑定 hover 事件，注册 i18n 监听。
     * 必须在 initOverlayHost() 之后调用。
     */
    initTooltipOverlay(config?: TooltipOverlayConfig): void {
        // 设置锚点
        if (config?.anchor) {
            this._anchor = config.anchor;
        }

        // 设置 tooltip 属性
        this._tooltipText = config?.tooltip ?? '';
        this._showDelay = config?.tooltipShowDelay ?? 0;
        this._hideDelay = config?.tooltipHideDelay ?? 0;

        // 解析 i18n 内容
        const tooltipText = this._tooltipText;
        const resolved = tooltipText.startsWith(I18N_PREFIX)
            ? (getI18nManager()?.t(tooltipText.slice(I18N_PREFIX.length)) ?? tooltipText)
            : tooltipText;

        // 设置内容（如果浮层组件有 text 属性）
        if (typeof this.text !== 'undefined') {
            this.text = resolved;
        }

        // 绑定 hover 事件
        const anchor = this._anchor;
        if (anchor) {
            this.bind(anchor, 'hover');
            this.on('hover', (gesture: any) => {
                const domEvent = gesture?.originalEvent;
                if (!domEvent) return;
                const eventType = domEvent.type;
                if (eventType === 'mouseenter' || eventType === 'pointerenter') {
                    this._scheduleShow();
                } else {
                    this._scheduleHide();
                }
            });
        }

        // i18n 内容 → 注册 localeChange 刷新
        if (tooltipText.startsWith(I18N_PREFIX)) {
            const i18nKey = tooltipText.slice(I18N_PREFIX.length);
            const off = this.on?.('localeChange', () => {
                const translated = getI18nManager()?.t(i18nKey) ?? tooltipText;
                if (typeof this.text !== 'undefined') {
                    this.text = translated;
                }
            });
            if (typeof off === 'function') {
                this.onCleanup(off);
            }
        }
    },

    // ─── open/close 生命周期 ───

    _showTimer: {
        get(): ReturnType<typeof setTimeout> | null {
            return this.abilityState('TooltipOverlayAbility:showTimer', null);
        },
        set(value: ReturnType<typeof setTimeout> | null) {
            this.setAbilityState('TooltipOverlayAbility:showTimer', value);
        },
    },

    _hideTimer: {
        get(): ReturnType<typeof setTimeout> | null {
            return this.abilityState('TooltipOverlayAbility:hideTimer', null);
        },
        set(value: ReturnType<typeof setTimeout> | null) {
            this.setAbilityState('TooltipOverlayAbility:hideTimer', value);
        },
    },

    _scheduleShow(): void {
        if (this._hideTimer !== null) { clearTimeout(this._hideTimer); this._hideTimer = null; }
        if (this._showDelay > 0) {
            this._showTimer = setTimeout(() => this.open(), this._showDelay);
        } else {
            this.open();
        }
    },

    _scheduleHide(): void {
        if (this._showTimer !== null) { clearTimeout(this._showTimer); this._showTimer = null; }
        if (this._hideDelay > 0) {
            this._hideTimer = setTimeout(() => this.close(), this._hideDelay);
        } else {
            this.close();
        }
    },

    /**
     * 打开 tooltip
     */
    open(): void {
        this.acquireZIndex(ZIndexLevel.tooltip);
        this.positionOverlay();
        this.openOverlay();
        this.el.style.display = '';
    },

    /**
     * 关闭 tooltip
     */
    close(): void {
        this.el.style.display = 'none';
        this.closeOverlay();
        this.releaseZIndex();
    },
};
