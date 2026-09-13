/**
 * DialogAbility — 对话框浮层能力
 *
 * 惰性实例化：showDialog 时才创建 DialogComponent 并挂载到 overlay root，
 * 关闭后自行销毁，不纳入宿主 cleanup。
 *
 * dialog option 是配置对象（FloatDecl 声明形态）：
 * 控制字段（type/trigger/placement/mask/closeOnEscape/closeOnClickOutside）留顶层，
 * 传给子组件的构造参数（title 等）放 options 子对象。
 *
 * 组件类简写 dialog: MyDialog 等价于 { type: MyDialog, trigger: 'manual', placement: 'center', mask: true }。
 *
 * @example
 * // 组件 options 中声明
 * dialog: { type: 'MyDialog', options: { title: '确认', width: '400px' } }
 *
 * // 运行时操作
 * this.showDialog();
 * this.hideDialog();
 * this.updateDialog({ title: '新标题' });
 */

import type { AbilityDefinition } from '@/composable';
import { OverlayRoot } from '../../overlay/OverlayRoot';
import { ZIndexLevel, zIndexManager } from '../../engine';
import { resolveFloatMask } from './float-shared';

/** 对话框浮层能力，提供 show/hide/toggle/update 快捷方法 */
export const DialogAbility: AbilityDefinition = {
    _getDialogDecl(): any {
        const dialog = this.dialog;
        if (!dialog) return null;

        if (typeof dialog === 'function') {
            return {
                type: dialog,
                trigger: 'manual',
                placement: 'center',
                mask: true,
                closeOnEscape: true,
                closeOnClickOutside: false,
            };
        }

        return {
            type: undefined,
            trigger: 'manual',
            placement: 'center',
            mask: true,
            closeOnEscape: true,
            closeOnClickOutside: false,
            options: undefined,
            ...dialog,
        };
    },

    showDialog(): void {
        const inst = this.abilityState('dialog-instance') as any;
        if (inst) {
            const el = inst.overlay.el;
            if (el && !el.parentNode) {
                OverlayRoot.getInstance().getRoot().appendChild(el);
            }
            return;
        }

        const decl = this._getDialogDecl();
        if (!decl) return;

        const OverlayClass =
            typeof decl.type === 'function' ? decl.type : this.resolveComponent(decl.type);
        if (!OverlayClass) return;

        const constr: any = {
            ...(decl.options ?? {}),
            placement: decl.placement,
            closeOnEscape: decl.closeOnEscape,
            closeOnClickOutside: decl.closeOnClickOutside,
        };
        const mask = resolveFloatMask(decl);
        if (mask) constr.mask = mask;

        const overlay = new OverlayClass(constr);

        this.setAbilityState('dialog-instance', { overlay, decl });

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

    updateDialog(patch: Record<string, any>): void {
        const cfg = this.dialog;
        if (!cfg) return;
        if (typeof cfg === 'object') {
            this.setData('dialog', {
                ...cfg,
                options: { ...(cfg.options ?? {}), ...patch },
            });
        }
        const inst = this.abilityState('dialog-instance') as any;
        if (inst?.overlay && typeof inst.overlay.update === 'function') {
            inst.overlay.update(patch);
        }
    },
} satisfies AbilityDefinition;
