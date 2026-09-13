/**
 * PopoverAbility — 弹出层能力
 *
 * popover option 始终是配置对象（FloatDecl 声明形态），惰性实例化：实例在 show 时才创建。
 * 操作全部通过 showPopover() / hidePopover() / togglePopover() / updatePopover() 进行。
 *
 * trigger 事件在 OptionChange 阶段绑定一次、从不取消（不做规则 diff）：
 * - 规则 owner 为父组件，父组件销毁时统一清理
 * - handler 内检查当前配置 trigger 与触达方式一致才执行（配置变更兜底）
 *
 * 配置结构（控制字段留顶层，子组件 options 放 options 子对象）：
 *   popover: { trigger: 'click', anchor: 'self', placement: 'bottom', options: { title: '详情' } }
 * 组件类简写 popover: MyPopover 等价于 { type: MyPopover, trigger: 'click' }。
 *
 * @example
 * // 组件 options 中声明
 * popover: { type: 'MyPopover', options: { title: '详情' } }
 *
 * // 运行时操作
 * this.showPopover();
 * this.hidePopover();
 * this.updatePopover({ title: '新标题' });
 */

import type { AbilityDefinition } from '@/composable';
import { DomEventsEngine } from '../../engine';
import type { DelegatedEventRule } from '../../types/events';

export const PopoverAbility: AbilityDefinition = {
    _onPopoverOptionChange(value: any, old: any): void {
        if (value === old) return;
        if (value) {
            this._bindPopoverTrigger();
        }
    },

    _getPopoverDecl(): any {
        const popover = this.popover;
        if (!popover) return null;
        if (typeof popover === 'function') {
            return {
                type: popover,
                trigger: 'click',
                anchor: 'self',
                placement: 'bottom',
            };
        }
        return {
            type: undefined,
            trigger: 'click',
            anchor: 'self',
            placement: 'bottom',
            options: undefined,
            ...popover,
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

    _bindPopoverTrigger(): void {
        if (this.abilityState('PopoverAbility:triggerBound')) return;
        const decl = this._getPopoverDecl();
        if (!decl) return;

        const trigger = decl.trigger ?? 'click';
        if (trigger === 'manual' || trigger === 'always') return;

        const anchorEl = this._resolveAnchor(decl.anchor);
        const triggers = Array.isArray(trigger) ? trigger : [trigger];
        const rules: DelegatedEventRule[] = [];
        for (const t of triggers) {
            if (t === 'hover') {
                rules.push({
                    event: 'mouseenter',
                    path: anchorEl,
                    handler: '_onPopoverEnter',
                    needsBinding: true,
                });
                rules.push({
                    event: 'mouseleave',
                    path: anchorEl,
                    handler: '_onPopoverLeave',
                    needsBinding: true,
                });
            } else if (t === 'click') {
                rules.push({
                    event: 'click',
                    path: anchorEl,
                    handler: '_onPopoverClick',
                    needsBinding: true,
                });
            }
        }
        if (rules.length === 0) return;
        for (const rule of rules) {
            DomEventsEngine.addEventRule(this, rule);
        }
        this.setAbilityState('PopoverAbility:triggerBound', true);
        this.onCleanup(() => {
            for (const rule of rules) {
                DomEventsEngine.removeEventRule(this, rule);
            }
            this.setAbilityState('PopoverAbility:triggerBound', undefined);
        });
    },

    _getPopoverInstance(): any {
        return this.abilityState('PopoverAbility:instance');
    },

    _ensurePopover(): any {
        const existing = this._getPopoverInstance();
        if (existing) return existing;

        const decl = this._getPopoverDecl();
        if (!decl) return null;
        const OverlayClass =
            typeof decl.type === 'function' ? decl.type : this.resolveComponent(decl.type);
        if (!OverlayClass) return null;

        const anchorEl = this._resolveAnchor(decl.anchor);
        const constr: any = {
            ...(decl.options ?? {}),
            anchor: anchorEl,
            placement: decl.placement,
        };
        const mask = this._resolveMask(decl);
        if (mask) constr.mask = mask;

        const overlay = new OverlayClass(constr);
        this.setAbilityState('PopoverAbility:instance', overlay);
        this.onCleanup(() => {
            overlay.dispose();
            this.setAbilityState('PopoverAbility:instance', undefined);
        });
        return overlay;
    },

    showPopover(): void {
        const inst = this._ensurePopover();
        if (inst) {
            inst.show();
        }
    },

    hidePopover(): void {
        const inst = this._getPopoverInstance();
        if (inst) {
            inst.hide();
        }
    },

    togglePopover(): void {
        const inst = this._getPopoverInstance();
        if (inst?.isOpen) {
            this.hidePopover();
        } else {
            this.showPopover();
        }
    },

    updatePopover(patch: Record<string, any>): void {
        const cfg = this.popover;
        if (!cfg) return;
        if (typeof cfg === 'object') {
            this.setData('popover', {
                ...cfg,
                options: { ...(cfg.options ?? {}), ...patch },
            });
        }
        const inst = this._getPopoverInstance();
        if (inst) {
            inst.update(patch);
        }
    },

    _onPopoverEnter(): void {
        if (!this._popoverTriggerMatches('hover')) return;
        this.showPopover();
    },

    _onPopoverLeave(): void {
        if (!this._popoverTriggerMatches('hover')) return;
        this.hidePopover();
    },

    _onPopoverClick(): void {
        if (!this._popoverTriggerMatches('click')) return;
        this.togglePopover();
    },

    _popoverTriggerMatches(mode: string): boolean {
        const decl = this._getPopoverDecl();
        if (!decl) return false;
        const triggers = Array.isArray(decl.trigger) ? decl.trigger : [decl.trigger ?? 'click'];
        return triggers.includes(mode);
    },
} satisfies AbilityDefinition;
