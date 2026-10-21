/**
 * PasswordStrengthAbility 密码强度能力
 *
 * 计算密码强度（0-4 级）并在 infoGroup 中渲染强度条 + 标签。
 * 纯 DOM 模板 item（不走组件链），避免组件注册/option 同步问题。
 */

import type { AbilityDefinition } from '@/composable';
import { PASSWORD_STRENGTH_LABELS, STRENGTH_ORDER } from '../constants';

export type PasswordStrength = 0 | 1 | 2 | 3 | 4;

export function calculateStrength(password: string): PasswordStrength {
    if (!password) return 0;
    let score = 0;
    const len = password.length;

    if (len >= 6) score++;
    if (len >= 8) score++;
    if (len >= 10) score++;
    if (len >= 12) score++;

    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);

    const typeCount = [hasLower, hasUpper, hasDigit, hasSpecial].filter(Boolean).length;
    if (typeCount >= 2 && score < 2) score = 2;
    if (typeCount >= 3 && score < 3) score = 3;
    if (typeCount >= 4 && score < 4) score = 4;

    return Math.min(score, 4) as PasswordStrength;
}

export const PasswordStrengthAbility = {
    _strength: 0 as PasswordStrength,
    _strengthItem: null as any,
    _strengthFillEl: null as HTMLElement | null,
    _strengthLabelEl: null as HTMLElement | null,

    _mountStrengthBar(): void {
        const infoCmp = this.getComponent('infoGroup') as any;
        if (!infoCmp || this._strengthItem) return;

        this._strengthItem = infoCmp.add({
            tag: 'div',
            classes: 'q-password-strength',
            options: { text: '' },
            children: [
                {
                    tag: 'div',
                    classes: 'q-password-strength__bar',
                    children: [
                        { tag: 'div', classes: 'q-password-strength__fill q-password-strength__fill--0' },
                    ],
                },
                { tag: 'div', classes: 'q-password-strength__label' },
            ],
        });

        const el = this._strengthItem?.el as HTMLElement | undefined;
        if (el) {
            this._strengthFillEl = el.querySelector('.q-password-strength__fill');
            this._strengthLabelEl = el.querySelector('.q-password-strength__label');
        }
    },

    _updateStrength(): void {
        const password = this.value || '';
        const strength = calculateStrength(password);
        const changed = strength !== this._strength;
        this._strength = strength;

        if (this._strengthFillEl) {
            this._strengthFillEl.className =
                `q-password-strength__fill q-password-strength__fill--${strength}`;
        }
        if (this._strengthLabelEl) {
            this._strengthLabelEl.textContent = PASSWORD_STRENGTH_LABELS[strength] ?? '';
            this._strengthLabelEl.className =
                `q-password-strength__label q-password-strength__label--${strength}`;
        }

        if (changed) {
            this.emit('strengthChange', { strength, value: password });
        }
    },
} satisfies AbilityDefinition;
