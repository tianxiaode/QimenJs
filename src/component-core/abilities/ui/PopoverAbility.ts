/**
 * PopoverAbility — 弹出层能力
 *
 * 提供 popover 浮层的快捷操作方法，底层通过 FloatAbility 的 show/hide/toggle/updateFloat 发送事件。
 * 通过 `_initPopover` 在初始化阶段根据配置自动注册浮层，
 * 运行时通过 `showPopover` 懒加载（未配置时也可手动调用）。
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
import type { FloatDecl } from '../../types';

/** 弹出层能力，提供 show/hide/toggle/update 快捷方法 */
export const PopoverAbility: AbilityDefinition = {
    _initPopover(): void {
        const decl = this._getPopoverFloatDecl();
        if (!decl) return;
        this.attachFloat('popover', decl);
        this._emitInit('popover', decl);
    },

    _getPopoverFloatDecl(): FloatDecl | undefined {
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

        const {
            type,
            trigger,
            placement,
            mask,
            closeOnEscape,
            closeOnClickOutside,
            emits,
            ...data
        } = popover as Record<string, any>;
        return {
            type,
            trigger: trigger ?? 'click',
            placement: placement ?? 'bottom',
            mask: mask ?? false,
            closeOnEscape: closeOnEscape ?? true,
            closeOnClickOutside: closeOnClickOutside ?? true,
            emits,
            data: Object.keys(data).length > 0 ? data : undefined,
        };
    },

    showPopover(): void {
        this._ensureFloat('popover', this._getPopoverFloatDecl());
        this.showFloat('popover');
    },

    hidePopover(): void {
        this.hideFloat('popover');
    },

    togglePopover(): void {
        this._ensureFloat('popover', this._getPopoverFloatDecl());
        this.toggleFloat('popover');
    },

    updatePopover(data: Record<string, any>): void {
        this.updateFloat('popover', data);
    },
};
