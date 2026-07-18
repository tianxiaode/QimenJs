/**
 * TooltipOverlayAbility — Tooltip 浮层能力
 *
 * 通过 OverlayEventBus 通知调度中心管理浮层生命周期。
 * 提供 tooltip 特有逻辑：
 * - hover 事件绑定（通过 DomEventsAbility.bind）
 * - show/hide delay
 * - i18n 内容管理
 *
 * 使用方式：
 * 1. 浮层组件声明 abilities 包含 [TooltipOverlayAbility]
 * 2. constructor 中调用 initTooltipOverlay()
 * 3. hover 事件自动通过 OverlayEventBus 触发调度中心
 */

import type { AbilityDefinition } from '@/composable';
import { OverlayEventBus } from '@/events/OverlayEventBus';
import { getI18nManager, I18N_PREFIX } from '@qimenjs/i18n';
import type { Placement } from '@qimenjs/component-core';

export interface TooltipOverlayConfig {
    anchor?: HTMLElement;
    tooltip?: string;
    tooltipPlacement?: Placement;
    tooltipOffset?: number;
    tooltipShowDelay?: number;
    tooltipHideDelay?: number;
    overlayKey?: string;
}

export const TooltipOverlayAbility: AbilityDefinition = {
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

    _overlayKey: {
        get(): string {
            return this.abilityState('TooltipOverlayAbility:overlayKey', 'tooltip');
        },
        set(value: string) {
            this.setAbilityState('TooltipOverlayAbility:overlayKey', value);
        },
    },

    initTooltipOverlay(config?: TooltipOverlayConfig): void {
        if (config?.anchor) {
            this._anchor = config.anchor;
        }

        this._tooltipText = config?.tooltip ?? '';
        this._showDelay = config?.tooltipShowDelay ?? 0;
        this._hideDelay = config?.tooltipHideDelay ?? 0;
        this._overlayKey = config?.overlayKey ?? 'tooltip';

        const tooltipText = this._tooltipText;
        const resolved = tooltipText.startsWith(I18N_PREFIX)
            ? (getI18nManager()?.t(tooltipText.slice(I18N_PREFIX.length)) ?? tooltipText)
            : tooltipText;

        if (typeof this.text !== 'undefined') {
            this.text = resolved;
        }

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
        if (this._hideTimer !== null) {
            clearTimeout(this._hideTimer);
            this._hideTimer = null;
        }
        if (this._showDelay > 0) {
            this._showTimer = setTimeout(() => this._showTooltip(), this._showDelay);
        } else {
            this._showTooltip();
        }
    },

    _scheduleHide(): void {
        if (this._showTimer !== null) {
            clearTimeout(this._showTimer);
            this._showTimer = null;
        }
        if (this._hideDelay > 0) {
            this._hideTimer = setTimeout(() => this._hideTooltip(), this._hideDelay);
        } else {
            this._hideTooltip();
        }
    },

    _showTooltip(): void {
        const bus = OverlayEventBus.getInstance();
        const anchor = this._anchor ?? this.el;
        bus.overlayEmit(this._overlayKey, 'show', { component: this, anchor });
    },

    _hideTooltip(): void {
        const bus = OverlayEventBus.getInstance();
        bus.overlayEmit(this._overlayKey, 'hide', { component: this });
    },
};
