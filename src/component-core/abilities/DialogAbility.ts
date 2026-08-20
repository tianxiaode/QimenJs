/**
 * DialogAbility — 对话框浮层能力
 *
 * 提供 dialog 浮层的快捷操作方法，底层通过 FloatAbility 的 show/hide/toggle/updateFloat 发送事件。
 * 采用懒加载模式：首次调用 showDialog 时通过 `_getDialogFloatDecl` 构建 FloatDecl 并注册，
 * 后续操作直接调用 FloatAbility 的通用方法。
 *
 * this.dialog 支持两种形式：
 * - 组件类：class MyDialog extends Component { ... }
 * - 配置对象：{ type: 'MyDialog', title: '确认', content: '确定要删除吗？' }
 *
 * @example
 * // 组件类
 * dialog: MyDialogComponent
 *
 * // 配置对象
 * dialog: { type: 'MyDialog', title: '确认' }
 *
 * // 运行时操作
 * this.showDialog();
 * this.hideDialog();
 * this.updateDialog({ title: '新标题' });
 */

import type { AbilityDefinition } from '@/composable';
import type { FloatDecl } from '../types';

/** 对话框浮层能力，提供 show/hide/toggle/update 快捷方法 */
export const DialogAbility: AbilityDefinition = {
    /**
     * 获取 dialog 浮层声明
     *
     * 支持组件类或配置对象两种形式。
     *
     * @returns FloatDecl 或 undefined（无配置时）
     */
    _getDialogFloatDecl(): FloatDecl | undefined {
        const dialog = this.dialog;
        if (!dialog) return;

        if (typeof dialog === 'function') {
            return {
                type: (dialog as any).type || dialog.name,
                trigger: 'manual',
                placement: 'center',
                mask: true,
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
        } = dialog as Record<string, any>;
        return {
            type,
            trigger: trigger ?? 'manual',
            placement: placement ?? 'center',
            mask: mask ?? true,
            closeOnEscape: closeOnEscape ?? true,
            closeOnClickOutside: closeOnClickOutside ?? false,
            emits,
            data: Object.keys(data).length > 0 ? data : undefined,
        };
    },

    /**
     * 显示对话框
     *
     * 首次调用时自动注册浮层声明。
     *
     * @example
     * this.showDialog();
     */
    showDialog(): void {
        this._ensureFloat('dialog', this._getDialogFloatDecl());
        this.showFloat('dialog');
    },

    /**
     * 隐藏对话框
     *
     * @example
     * this.hideDialog();
     */
    hideDialog(): void {
        this.hideFloat('dialog');
    },

    /**
     * 切换对话框显示/隐藏
     *
     * @example
     * this.toggleDialog();
     */
    toggleDialog(): void {
        this._ensureFloat('dialog', this._getDialogFloatDecl());
        this.toggleFloat('dialog');
    },

    /**
     * 更新对话框数据
     *
     * @param data - 更新数据
     *
     * @example
     * this.updateDialog({ title: '新标题' });
     */
    updateDialog(data: Record<string, any>): void {
        this.updateFloat('dialog', data);
    },
};
