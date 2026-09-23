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
import {
    bindFloatTrigger,
    disposeFloatInstance,
    floatTriggerMatches,
    resolveFloatMask,
} from './float-shared';

const TRIGGER_SPEC = {
    stateKey: 'PopoverAbility:triggerBound',
    handlerPrefix: 'Popover',
    defaultTrigger: 'click',
} as const;

export const PopoverAbility: AbilityDefinition = {
    _onPopoverOptionChange(value: any, old: any): void {
        if (value === old) return;
        if (value) {
            bindFloatTrigger(this, this._getPopoverDecl(), TRIGGER_SPEC);
        } else {
            disposeFloatInstance(this, 'PopoverAbility:instance');
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

        const anchorSource =
            decl.anchor && decl.anchor !== 'self'
                ? (this.getNodeEl?.(decl.anchor) ?? null)
                : this.el!;
        if (!anchorSource) return null;
        const constr: any = {
            ...(decl.options ?? {}),
            anchor: anchorSource,
            placement: decl.placement,
        };
        const mask = resolveFloatMask(decl);
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
            inst.ready.then(() => inst.show());
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
        if (!floatTriggerMatches(this._getPopoverDecl(), 'hover', TRIGGER_SPEC.defaultTrigger))
            return;
        this.showPopover();
    },

    _onPopoverLeave(): void {
        if (!floatTriggerMatches(this._getPopoverDecl(), 'hover', TRIGGER_SPEC.defaultTrigger))
            return;
        this.hidePopover();
    },

    _onPopoverClick(): void {
        if (!floatTriggerMatches(this._getPopoverDecl(), 'click', TRIGGER_SPEC.defaultTrigger))
            return;
        this.togglePopover();
    },
} satisfies AbilityDefinition;
