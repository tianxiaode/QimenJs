/**
 * PopoverAbility — 弹出层能力
 *
 * popover option 初始化前是配置对象，初始化后变成浮动组件实例。
 * this.popover 直接返回实例，外部代码可 this.popover.show() / this.popover.items = newItems。
 * trigger 事件绑定一次，由父组件 onCleanup 自动清理。
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

export const PopoverAbility: AbilityDefinition = {
    _onPopoverOptionChange(value: any, old: any): void {
        if (value === old) return;
        if (!this._templateInitialized) return;

        if (old && typeof old.show === 'function') {
            if (!value) {
                old.dispose();
                return;
            }
            const decl = this._getPopoverFloatDecl();
            if (decl) {
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
            }
            this.setData('popover', old, true);
            return;
        }

        if (value) {
            this._ensurePopover();
        }
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
            ...popover,
        };
    },

    showPopover(): void {
        const inst = this._ensurePopover();
        if (inst) {
            inst.show();
        }
    },

    hidePopover(): void {
        if (this.popover && typeof this.popover.show === 'function') {
            this.popover.hide();
        }
    },

    togglePopover(): void {
        const inst = this._ensurePopover();
        if (!inst) return;
        if (inst.isOpen) {
            inst.hide();
        } else {
            inst.show();
        }
    },

    updatePopover(data: Record<string, any>): void {
        if (this.popover && typeof this.popover.show === 'function') {
            for (const [key, val] of Object.entries(data)) {
                this.popover[key] = val;
            }
        }
    },

    _ensurePopover(): any {
        if (this.popover && typeof this.popover.show === 'function') {
            return this.popover;
        }

        const decl = this._getPopoverFloatDecl();
        if (!decl) return null;

        const OverlayClass = this._resolveFloatType(decl.type);
        if (!OverlayClass) {
            this.logger?.warn?.(`[PopoverAbility] overlay type not found: ${decl.type}`);
            return null;
        }

        const anchorEl = this._getFloatAnchor('popover', decl);
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
        const overlay = new OverlayClass({
            ...rest,
            anchor: anchorEl,
            placement: decl.placement,
            offset: decl.offset,
        });

        if (decl.mask) {
            overlay.mask = {
                scoped: decl.maskMode === 'scoped',
                color: typeof decl.mask === 'string' ? decl.mask : undefined,
            };
        }

        this.onCleanup(() => overlay.dispose());

        this._bindFloatTrigger('popover', decl, {
            onShow: () => overlay.show(),
            onHide: () => overlay.hide(),
            onToggle: () => {
                if (overlay.isOpen) {
                    overlay.hide();
                } else {
                    overlay.show();
                }
            },
        });

        this.setData('popover', overlay, true);

        return overlay;
    },
} satisfies AbilityDefinition;
