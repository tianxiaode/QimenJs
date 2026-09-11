/**
 * TooltipAbility — 提示浮层能力
 *
 * 由能力自行创建 tooltip 浮层实例并管理生命周期：
 * init 时创建实例但不显示，hover 时由 _bindFloatTrigger 触发 show，
 * 实例纳入宿主 onCleanup 自动清理。
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

/** 提示浮层能力，提供创建、更新快捷方法 */
export const TooltipAbility: AbilityDefinition = {
    _onTooltipOptionChange(value: any, old: any): void {
        if (value === old) return;
        if (!this._templateInitialized) return;

        const inst = this.abilityState('tooltip-instance') as any;
        if (inst) {
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
            const { type, trigger, anchor, mask, maskMode, closeOnEscape, closeOnClickOutside, emits, showDelay, hideDelay, data, placement, offset, ...rest } = decl;
            for (const [key, val] of Object.entries(rest)) {
                if (val !== undefined) {
                    inst.overlay[key] = val;
                }
            }
            return;
        }

        if (value) {
            this._initTooltip();
        }
    },

    _initTooltip(): void {
        let cfg: any = this.tooltip;
        if (!cfg) return;
        if (typeof cfg === 'string') {
            cfg = { text: cfg }; // 兼容旧配置
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
            return;
        }

        const anchorEl = this._getFloatAnchor('tooltip', decl);
        const overlay = new OverlayClass({ ...decl, anchor: anchorEl });
        const inst = { overlay, anchorEl, decl };

        this.abilityState('tooltip-instance', () => inst);
        this.onCleanup(() => this._disposeFloat(inst));

        this._bindFloatTrigger('tooltip', inst.decl, {
            onShow: () => {
                inst.overlay.show();
                inst.overlay.open?.();
            },
            onHide: () => {
                inst.overlay.hide();
                inst.overlay.close?.();
            },
            onToggle: () => {},
        });
    },

    updateTooltip(data: Record<string, any>): void {
        const inst = this.abilityState('tooltip-instance') as { overlay: any } | undefined;
        if (inst) {
            inst.overlay.update(data);
        }
    },
} satisfies AbilityDefinition;
