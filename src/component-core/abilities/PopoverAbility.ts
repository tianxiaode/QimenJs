/**
 * PopoverAbility — 弹出层能力
 *
 * 提供 popover 浮层的快捷操作方法，底层通过 FloatAbility 的 show/hide/toggle/updateFloat 发送事件。
 * 采用懒加载模式：首次调用 showPopover 时通过 `_getPopoverFloatDecl` 构建 FloatDecl 并注册，
 * 后续操作直接调用 FloatAbility 的通用方法。
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
import type { FloatDecl } from '../types';

/** 弹出层能力，提供 show/hide/toggle/update 快捷方法 */
export const PopoverAbility: AbilityDefinition = {
    /**
     * 获取 popover 浮层声明
     *
     * 支持组件类或配置对象两种形式。
     *
     * @returns FloatDecl 或 undefined（无配置时）
     */
    _getPopoverFloatDecl(): FloatDecl | undefined {
        const popover = this.popover;
        if (!popover) return;

        if (typeof popover === 'function') {
            return {
                type: (popover as any).type || popover.name,
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

    /**
     * 显示弹出层
     *
     * 首次调用时自动注册浮层声明。
     *
     * @example
     * this.showPopover();
     */
    showPopover(): void {
        this._ensureFloat('popover', this._getPopoverFloatDecl());
        this.showFloat('popover');
    },

    /**
     * 隐藏弹出层
     *
     * @example
     * this.hidePopover();
     */
    hidePopover(): void {
        this.hideFloat('popover');
    },

    /**
     * 切换弹出层显示/隐藏
     *
     * @example
     * this.togglePopover();
     */
    togglePopover(): void {
        this._ensureFloat('popover', this._getPopoverFloatDecl());
        this.toggleFloat('popover');
    },

    /**
     * 更新弹出层数据
     *
     * @param data - 更新数据
     *
     * @example
     * this.updatePopover({ title: '新标题' });
     */
    updatePopover(data: Record<string, any>): void {
        this.updateFloat('popover', data);
    },
};
