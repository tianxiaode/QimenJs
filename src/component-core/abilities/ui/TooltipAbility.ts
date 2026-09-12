/**
 * TooltipAbility — 提示浮层能力
 *
 * tooltip option 初始化前是配置对象，初始化后变成浮动组件实例。
 * this.tooltip 直接返回实例，外部代码可 this.tooltip.show() / this.tooltip.hide()。
 * trigger 事件通过 DomEventsEngine.addEventRule 注册，
 * overlay dispose 时自动清理事件规则。
 *
 * 更新方式：
 *   updateTooltip({ text: '新提示' })   — 更新已有实例属性
 *   replaceTooltip({ text: '全新配置' }) — 销毁旧实例，用新配置重建
 *
 * @example
 * // 组件 options 中声明
 * tooltip: { text: '保存', placement: 'top' }
 *
 * // 运行时更新文本
 * this.updateTooltip({ text: '新提示' });
 *
 * // 运行时替换整个 tooltip
 * this.replaceTooltip({ text: '全新配置', trigger: 'click' });
 */

import type { AbilityDefinition } from '@/composable';
import { ZIndexLevel } from '../../engine';
import { DomEventsEngine } from '../../engine';
import type { DelegatedEventRule } from '../../types/events';

export const TooltipAbility: AbilityDefinition = {
    _onTooltipOptionChange(value: any, old: any): void {
        if (value === old) return;
        if (old?.isInstance) {
            if (!value) old.dispose();
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

    replaceTooltip(config: any): void {
        const old = this.tooltip;
        if (old?.isInstance) {
            old.dispose();
        }
        this.setData('tooltip', config, true);
        this._ensureTooltip();
    },

    _ensureTooltip(): any {
        if (this.tooltip && typeof this.tooltip.show === 'function') {
            return this.tooltip;
        }

        const value = this.tooltip;
        if (!value) return null;

        const anchor = value.anchor ?? 'self';
        const anchorEl = anchor === 'self' ? this.el! : (this.getNodeEl?.(anchor) ?? this.el!);
        const type = typeof value === 'string' ? 'tooltip' : (value?.type ?? 'tooltip');
        const OverlayClass = typeof type === 'function' ? type : this.resolveComponent(type);
        if (!OverlayClass) return null;

        const { type: _type, ...rest } = typeof value === 'string' ? { text: value } : value;
        const decl: any = {
            placement: 'top',
            zIndexLevel: ZIndexLevel.tooltip,
            anchor: anchorEl,
            ...rest,
        };

        const overlay = new OverlayClass(decl);

        this.onCleanup(() => overlay.dispose());
        this.setData('tooltip', overlay, true);

        const trigger = decl.trigger ?? 'hover';
        if (trigger !== 'manual') {
            const rules: DelegatedEventRule[] = [];
            if (trigger === 'hover') {
                rules.push(
                    { event: 'mouseenter', path: anchorEl, handler: '_onTooltipEnter', needsBinding: true },
                    { event: 'mouseleave', path: anchorEl, handler: '_onTooltipLeave', needsBinding: true },
                );
            } else if (trigger === 'click') {
                rules.push(
                    { event: 'click', path: anchorEl, handler: '_onTooltipClick', needsBinding: true },
                );
            }
            for (const rule of rules) {
                DomEventsEngine.addEventRule(this, rule);
            }
            overlay.onCleanup(() => {
                for (const rule of rules) {
                    DomEventsEngine.removeEventRule(this, rule);
                }
            });
        }

        return overlay;
    },

    _onTooltipEnter(): void {
        const overlay = this.tooltip;
        if (overlay && typeof overlay.show === 'function') {
            overlay.show();
            overlay.open?.();
        }
    },

    _onTooltipLeave(): void {
        const overlay = this.tooltip;
        if (overlay && typeof overlay.hide === 'function') {
            overlay.hide();
            overlay.close?.();
        }
    },

    _onTooltipClick(): void {
        const overlay = this.tooltip;
        if (!overlay || typeof overlay.show !== 'function') return;
        if (overlay.isOpen) overlay.hide();
        else overlay.show();
    },
} satisfies AbilityDefinition;
