/**
 * DialogAbility — 对话框浮层能力
 *
 * 提供 dialog 浮层的快捷操作方法，底层通过 FloatAbility 的 show/hide/toggle/updateFloat 发送事件。
 * 通过 `_initDialog` 在初始化阶段根据配置自动注册浮层，
 * 运行时通过 `showDialog` 懒加载（未配置时也可手动调用）。
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
import type { FloatDecl } from '../../types';

/** 对话框浮层能力，提供 show/hide/toggle/update 快捷方法 */
export const DialogAbility: AbilityDefinition = {
    _initDialog(): void {
        const decl = this._getDialogFloatDecl();
        if (!decl) return;
        this.attachFloat('dialog', decl);
        this._emitInit('dialog', decl);
    },

    _getDialogFloatDecl(): FloatDecl | undefined {
        const dialog = this.dialog;
        if (!dialog) return;

        if (typeof dialog === 'function') {
            return {
                type: dialog,
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

    showDialog(): void {
        this._ensureFloat('dialog', this._getDialogFloatDecl());
        this.showFloat('dialog');
    },

    hideDialog(): void {
        this.hideFloat('dialog');
    },

    toggleDialog(): void {
        this._ensureFloat('dialog', this._getDialogFloatDecl());
        this.toggleFloat('dialog');
    },

    updateDialog(data: Record<string, any>): void {
        this.updateFloat('dialog', data);
    },
} satisfies AbilityDefinition;
