/**
 * TooltipAbility — 提示浮层能力
 *
 * tooltip option 始终是配置对象（FloatDecl 声明形态），惰性实例化：实例在 show 时才创建。
 * 操作全部通过 showTooltip() / hideTooltip() / toggleTooltip() / updateTooltip() 进行。
 *
 * trigger 事件在 OptionChange 阶段绑定一次、从不取消（不做规则 diff）：
 * - 规则 owner 为父组件，父组件销毁时统一清理
 * - handler 内检查当前配置 trigger 与触达方式一致才执行（配置变更兜底）
 *
 * 配置结构（控制字段留顶层，子组件 options 放 options 子对象）：
 *   tooltip: { trigger: 'hover', anchor: 'self', placement: 'top', mask: false, options: { text: '提示' } }
 * 字符串简写 tooltip: '提示' 归一为 { trigger: 'hover', anchor: 'self', options: { text } }。
 *
 * @example
 * // 组件 options 中声明
 * tooltip: { text: '保存', placement: 'top' }
 *
 * // 运行时操作
 * this.showTooltip();
 * this.hideTooltip();
 * this.updateTooltip({ text: '新提示' });
 */

import type { AbilityDefinition } from '@/composable';
import { ZIndexLevel } from '../../engine';
import { DomEventsEngine } from '../../engine';
import type { DelegatedEventRule } from '../../types/events';

export const TooltipAbility: AbilityDefinition = {
    _onTooltipOptionChange(value: any, old: any): void {
        if (value === old) return;
        if (value) {
            this._bindTooltipTrigger();
        } else {
            this._disposeTooltip();
        }
    },

    _disposeTooltip(): void {
        const inst = this._getTooltipInstance();
        if (inst) {
            inst.dispose();
            this.setAbilityState('TooltipAbility:instance', undefined);
        }
    },

    _getTooltipDecl(): any {
        const value = this.tooltip;
        if (!value) return null;
        if (typeof value === 'string') {
            return {
                type: 'tooltip',
                trigger: 'hover',
                anchor: 'self',
                placement: 'top',
                zIndexLevel: ZIndexLevel.tooltip,
                options: { text: value },
            };
        }
        return {
            type: 'tooltip',
            trigger: 'hover',
            anchor: 'self',
            placement: 'top',
            zIndexLevel: ZIndexLevel.tooltip,
            options: undefined,
            ...value,
        };
    },

    _resolveAnchor(anchor: string | undefined): HTMLElement {
        if (anchor === 'self' || !anchor) return this.el!;
        return this.getNodeEl?.(anchor) ?? this.el!;
    },

    _resolveMask(decl: any): any {
        if (decl.maskMode === 'scoped') return 'scoped';
        if (decl.maskMode === 'global') return true;
        if (decl.maskMode === 'none') return false;
        return decl.mask;
    },

    _bindTooltipTrigger(): void {
        if (this.abilityState('TooltipAbility:triggerBound')) return;
        const decl = this._getTooltipDecl();
        if (!decl) return;

        const trigger = decl.trigger ?? 'hover';
        if (trigger === 'manual' || trigger === 'always') return;

        const anchorEl = this._resolveAnchor(decl.anchor);
        const triggers = Array.isArray(trigger) ? trigger : [trigger];
        const rules: DelegatedEventRule[] = [];
        for (const t of triggers) {
            if (t === 'hover') {
                rules.push({
                    event: 'mouseenter',
                    path: anchorEl,
                    handler: '_onTooltipEnter',
                    needsBinding: true,
                });
                rules.push({
                    event: 'mouseleave',
                    path: anchorEl,
                    handler: '_onTooltipLeave',
                    needsBinding: true,
                });
            } else if (t === 'click') {
                rules.push({
                    event: 'click',
                    path: anchorEl,
                    handler: '_onTooltipClick',
                    needsBinding: true,
                });
            }
        }
        if (rules.length === 0) return;
        for (const rule of rules) {
            DomEventsEngine.addEventRule(this, rule);
        }
        this.setAbilityState('TooltipAbility:triggerBound', true);
        this.onCleanup(() => {
            for (const rule of rules) {
                DomEventsEngine.removeEventRule(this, rule);
            }
            this.setAbilityState('TooltipAbility:triggerBound', undefined);
        });
    },

    _getTooltipInstance(): any {
        return this.abilityState('TooltipAbility:instance');
    },

    _ensureTooltip(): any {
        const existing = this._getTooltipInstance();
        if (existing) return existing;

        const decl = this._getTooltipDecl();
        if (!decl) return null;
        const OverlayClass =
            typeof decl.type === 'function' ? decl.type : this.resolveComponent(decl.type);
        if (!OverlayClass) return null;

        const anchorEl = this._resolveAnchor(decl.anchor);
        const constr: any = {
            ...(decl.options ?? {}),
            anchor: anchorEl,
            placement: decl.placement,
            zIndexLevel: decl.zIndexLevel,
        };
        const mask = this._resolveMask(decl);
        if (mask) constr.mask = mask;

        const overlay = new OverlayClass(constr);
        this.setAbilityState('TooltipAbility:instance', overlay);
        this.onCleanup(() => {
            overlay.dispose();
            this.setAbilityState('TooltipAbility:instance', undefined);
        });
        return overlay;
    },

    showTooltip(): void {
        const inst = this._ensureTooltip();
        if (inst) {
            inst.show();
            inst.open?.();
        }
    },

    hideTooltip(): void {
        const inst = this._getTooltipInstance();
        if (inst) {
            inst.hide();
            inst.close?.();
        }
    },

    toggleTooltip(): void {
        const inst = this._getTooltipInstance();
        if (inst?.isOpen) {
            this.hideTooltip();
        } else {
            this.showTooltip();
        }
    },

    updateTooltip(patch: Record<string, any>): void {
        const cfg = this.tooltip;
        if (!cfg) return;
        if (typeof cfg === 'object') {
            this.setData('tooltip', {
                ...cfg,
                options: { ...(cfg.options ?? {}), ...patch },
            });
        }
        const inst = this._getTooltipInstance();
        if (inst) {
            inst.update(patch);
        }
    },

    _onTooltipEnter(): void {
        if (!this._triggerMatches('hover')) return;
        this.showTooltip();
    },

    _onTooltipLeave(): void {
        if (!this._triggerMatches('hover')) return;
        this.hideTooltip();
    },

    _onTooltipClick(): void {
        if (!this._triggerMatches('click')) return;
        this.toggleTooltip();
    },

    _triggerMatches(mode: string): boolean {
        const decl = this._getTooltipDecl();
        if (!decl) return false;
        const triggers = Array.isArray(decl.trigger) ? decl.trigger : [decl.trigger ?? 'hover'];
        return triggers.includes(mode);
    },
} satisfies AbilityDefinition;
