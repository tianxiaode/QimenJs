/**
 * PopoverAbility — 弹出层能力
 *
 * 由能力自行创建 popover 浮层实例并管理生命周期，
 * 创建时不自动显示，click 时由 _bindFloatTrigger 触发 show，
 * 实例纳入宿主 onCleanup 自动清理。
 *
 * this.popover 支持两种形式：
 * - 组件类：class MyPopover extends Component { ... }
 * - 配置对象：{ type: 'MyPopover', title: '详情', placement: 'bottom' }
 *
 * @example
 * // 组件类
 * popover: MyPopoverComponent
 *
 * // 配置对象
 * popover: { type: 'MyPopover', title: '详情' }
 *
 * // 运行时操作
 * this.showPopover();
 * this.hidePopover();
 * this.updatePopover({ title: '新标题' });
 */

import type { AbilityDefinition } from '@/composable';

/** 弹出层能力，提供 show/hide/toggle/update 快捷方法 */
export const PopoverAbility: AbilityDefinition = {
    _onPopoverOptionChange(value: any, old: any): void {
        if (value === old) return;
        if (!this._templateInitialized) return;

        const inst = this.abilityState('popover-instance') as any;
        if (inst) {
            const decl = this._getPopoverFloatDecl();
            if (decl) {
                const { type, trigger, anchor, mask, maskMode, closeOnEscape, closeOnClickOutside, emits, showDelay, hideDelay, data, placement, offset, ...rest } = decl;
                for (const [key, val] of Object.entries(rest)) {
                    if (val !== undefined) {
                        inst.overlay[key] = val;
                    }
                }
            }
            return;
        }

        if (value) {
            this._initPopover();
        }
    },

    _initPopover(): void {
        const decl = this._getPopoverFloatDecl();
        if (!decl) return;
        this._ensurePopoverFloat(decl);
    },

    _getPopoverFloatDecl(): any {
        const popover = this.popover;
        if (!popover) return;

        if (typeof popover === 'function') {
            return {
                type: popover,
                trigger: 'click',
                placement: 'bottom',
                mask: false,
                closeOnEscape: true,
                closeOnClickOutside: true,
            };
        }

        return {
            isFloating: true,
            trigger: 'click',
            placement: 'bottom',
            mask: false,
            closeOnEscape: true,
            closeOnClickOutside: true,
            ...popover, // 透传其他配置
        };
    },

    showPopover(): void {
        const decl = this._getPopoverFloatDecl();
        if (!decl) return;
        const inst = this._ensurePopoverFloat(decl);
        if (inst) {
            inst.overlay.show();
        }
    },

    hidePopover(): void {
        const inst = this.abilityState('popover-instance') as { overlay: any } | undefined;
        if (inst) {
            inst.overlay.hide();
        }
    },

    togglePopover(): void {
        const decl = this._getPopoverFloatDecl();
        if (!decl) return;
        const inst = this._ensurePopoverFloat(decl);
        if (!inst) return;
        if (inst.overlay.isOpen) {
            inst.overlay.hide();
        } else {
            inst.overlay.show();
        }
    },

    updatePopover(data: Record<string, any>): void {
        const inst = this.abilityState('popover-instance') as { overlay: any } | undefined;
        if (inst) {
            inst.overlay.update(data);
        }
    },

    _ensurePopoverFloat(decl: any) {
        const existing = this.abilityState('popover-instance') as any;
        if (existing) return existing;

        const OverlayClass = this._resolveFloatType(decl.type);
        if (!OverlayClass) {
            this.logger?.warn?.(`[PopoverAbility] overlay type not found: ${decl.type}`);
            return null;
        }

        const anchorEl = this._getFloatAnchor('popover', decl);
        const { type, trigger, anchor, mask, maskMode, closeOnEscape, closeOnClickOutside, emits, showDelay, hideDelay, data, placement, offset, ...rest } = decl;
        const overlay = new OverlayClass({
            ...rest,
            anchor: anchorEl,
            placement: decl.placement,
            offset: decl.offset,
        });
        const inst = { overlay, anchorEl, decl };

        if (decl.mask) {
            overlay.initOverlayMask?.({
                color: typeof decl.mask === 'string' ? decl.mask : undefined,
                scoped: decl.maskMode === 'scoped',
            });
        }

        this.abilityState('popover-instance', () => inst);
        this.onCleanup(() => this._disposeFloat(inst));

        this._bindFloatTrigger('popover', inst.decl, {
            onShow: () => inst.overlay.show(),
            onHide: () => inst.overlay.hide(),
            onToggle: () => {
                if (inst.overlay.isOpen) {
                    inst.overlay.hide();
                } else {
                    inst.overlay.show();
                }
            },
        });

        return inst;
    },
} satisfies AbilityDefinition;
