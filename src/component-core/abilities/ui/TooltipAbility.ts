/**
 * TooltipAbility — 提示浮层能力
 *
 * tooltip option 初始化前是配置对象，初始化后变成浮动组件实例。
 * this.tooltip 直接返回实例，外部代码可 this.tooltip.show() / this.tooltip.hide()。
 * trigger 事件（hover）绑定一次，由父组件 onCleanup 自动清理。
 *
 * @example
 * // 组件 options 中声明
 * tooltip: { content: '保存', placement: 'top' }
 *
 * // 运行时更新
 * this.updateTooltip({ content: '新提示' });
 */

import type { AbilityDefinition } from '@/composable';
import { ZIndexLevel } from '../../engine';

export const TooltipAbility: AbilityDefinition = {
    _onTooltipOptionChange(value: any, old: any): void {
        if (value === old) return;
        if (!this._templateInitialized) return;

        if (old && typeof old.show === 'function') {
            if (!value) {
                old.dispose();
                return;
            }
            let cfg: any = this.tooltip;
            if (!cfg) return;
            if (typeof cfg === 'string') {
                cfg = { text: cfg };
            }
            const decl: any = {
                type: 'tooltip',
                trigger: cfg.trigger ?? 'hover',
                placement: cfg.placement ?? 'top',
                offset: cfg.offset,
                showDelay: cfg.delay,
                zIndexLevel: ZIndexLevel.tooltip,
                text: cfg.text,
            };
            const {
                type,
                trigger,
                anchor,
                mask,
                maskMode,
                closeOnEscape,
                closeOnClickOutside,
                emits,
                showDelay,
                hideDelay,
                data,
                placement,
                offset,
                ...rest
            } = decl;
            for (const [key, val] of Object.entries(rest)) {
                if (val !== undefined) {
                    old[key] = val;
                }
            }
            this._setRawData('tooltip', old);
            return;
        }

        if (value) {
            this._ensureTooltip();
        }
    },

    updateTooltip(data: Record<string, any>): void {
        if (this.tooltip && typeof this.tooltip.show === 'function') {
            for (const [key, val] of Object.entries(data)) {
                this.tooltip[key] = val;
            }
        }
    },

    _ensureTooltip(): any {
        if (this.tooltip && typeof this.tooltip.show === 'function') {
            return this.tooltip;
        }

        let cfg: any = this.tooltip;
        if (!cfg) return null;
        if (typeof cfg === 'string') {
            cfg = { text: cfg };
        }

        const decl: any = {
            type: 'tooltip',
            trigger: cfg.trigger ?? 'hover',
            placement: cfg.placement ?? 'top',
            offset: cfg.offset,
            showDelay: cfg.delay,
            zIndexLevel: ZIndexLevel.tooltip,
            text: cfg.text,
        };

        const OverlayClass = this._resolveFloatType(decl.type);
        if (!OverlayClass) {
            this.logger?.warn?.(`[TooltipAbility] overlay type not found: ${decl.type}`);
            return null;
        }

        const anchorEl = this._getFloatAnchor('tooltip', decl);
        const overlay = new OverlayClass({ ...decl, anchor: anchorEl });

        this.onCleanup(() => overlay.dispose());

        this._bindFloatTrigger('tooltip', decl, {
            onShow: () => {
                overlay.show();
                overlay.open?.();
            },
            onHide: () => {
                overlay.hide();
                overlay.close?.();
            },
            onToggle: () => {},
        });

        this._setRawData('tooltip', overlay);

        return overlay;
    },

    _initTooltip(): void {
        if (this.tooltip) {
            this._onTooltipOptionChange(this.tooltip);
        }
    },
} satisfies AbilityDefinition;
