/**
 * DialogAbility — 对话框浮层能力
 *
 * 由能力自行创建 DialogComponent 实例并管理生命周期：
 * showDialog 时创建并挂载到 overlay root，关闭后自行销毁，不纳入宿主 cleanup。
 *
 * this.dialog 支持两种形式：
 * - 组件类：class MyDialog extends Component { ... }
 * - 配置对象：{ type: 'MyDialog', title: '确认' }
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
import { OverlayRoot } from '../../overlay/OverlayRoot';
import { ZIndexLevel, zIndexManager } from '../../engine';

/** 对话框浮层能力，提供 show/hide/toggle/update 快捷方法 */
export const DialogAbility: AbilityDefinition = {
    _getDialogFloatDecl(): any {
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

        const { type, trigger, placement, mask, closeOnEscape, closeOnClickOutside, emits, ...data } =
            dialog as Record<string, any>;
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
        const inst = this.abilityState('dialog-instance') as any;
        if (inst) {
            inst.el?.parentNode || OverlayRoot.getInstance().getRoot().appendChild(inst.el);
            return;
        }

        const decl = this._getDialogFloatDecl();
        if (!decl) return;

        const OverlayClass = this._resolveFloatType(decl.type);
        if (!OverlayClass) return;

        const data = typeof decl.data === 'function' ? decl.data() : decl.data;
        const overlay = new OverlayClass({ ...data });

        this.abilityState('dialog-instance', () => ({ overlay, decl }));

        overlay.ready.then(() => {
            OverlayRoot.getInstance().getRoot().appendChild(overlay.el);
            overlay.zIndex = String(zIndexManager.acquire(ZIndexLevel.modal));
        });
    },

    hideDialog(): void {
        const inst = this.abilityState('dialog-instance') as any;
        if (inst) {
            inst.overlay.dispose();
            this.setAbilityState('dialog-instance', undefined);
        }
    },

    toggleDialog(): void {
        const inst = this.abilityState('dialog-instance') as any;
        if (inst) {
            this.hideDialog();
        } else {
            this.showDialog();
        }
    },

    updateDialog(data: Record<string, any>): void {
        const inst = this.abilityState('dialog-instance') as any;
        if (inst) {
            inst.overlay.onOverlayChange?.(data);
        }
    },
} satisfies AbilityDefinition;