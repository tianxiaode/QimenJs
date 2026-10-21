/**
 * PasswordStrengthAbility 密码强度能力
 *
 * 计算密码强度（0-4 级）并在 infoGroup 中渲染强度条 + 标签。
 * 直接手工创建 DOM 并 appendChild 到 infoGroup.el（infoGroup.add 只支持组件 item，
 * 不支持纯 DOM 模板；手工 DOM 不走组件链，避免注册/option 同步问题）。
 */

import type { AbilityDefinition } from '@/composable';
import { PASSWORD_STRENGTH_LABELS } from '../constants';

export type PasswordStrength = 0 | 1 | 2 | 3 | 4;

export function calculateStrength(password: string): PasswordStrength {
    if (!password) return 0;
    const len = password.length;

    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);

    const typeCount = [hasLower, hasUpper, hasDigit, hasSpecial].filter(Boolean).length;

    let strength: PasswordStrength;
    if (typeCount >= 4 && len >= 8) strength = 4;
    else if (typeCount >= 3 && len >= 12) strength = 4;
    else if (typeCount >= 3 && len >= 8) strength = 3;
    else if (typeCount >= 2 && len >= 6) strength = 2;
    else strength = 1;

    if (len < 6) strength = Math.min(strength, 2) as PasswordStrength;
    if (len < 4) strength = Math.min(strength, 1) as PasswordStrength;

    return strength;
}

export const PasswordStrengthAbility = {
    _strength: 0 as PasswordStrength,
    _strengthContainerEl: null as HTMLElement | null,
    _strengthBarEl: null as HTMLElement | null,
    _strengthSegEls: [] as HTMLElement[],
    _strengthLabelEl: null as HTMLElement | null,

    _mountStrengthBar(): void {
        const infoCmp = this.getComponent('infoGroup') as any;
        if (!infoCmp || this._strengthBarEl) return;

        const container = document.createElement('div');
        container.className = 'q-password-strength';
        container.style.display = 'none';

        const bar = document.createElement('div');
        bar.className = 'q-password-strength__bar q-password-strength__bar--0';

        const segs: HTMLElement[] = [];
        for (let i = 0; i < 5; i++) {
            const seg = document.createElement('div');
            seg.className = 'q-password-strength__seg';
            bar.appendChild(seg);
            segs.push(seg);
        }

        const label = document.createElement('div');
        label.className = 'q-password-strength__label';

        container.appendChild(bar);
        container.appendChild(label);

        infoCmp.el.appendChild(container);

        this._strengthContainerEl = container;
        this._strengthBarEl = bar;
        this._strengthSegEls = segs;
        this._strengthLabelEl = label;
    },

    _updateStrength(): void {
        const password = this.value || '';
        const strength = calculateStrength(password);
        const changed = strength !== this._strength;
        this._strength = strength;

        if (this._strengthContainerEl) {
            this._strengthContainerEl.style.display = strength === 0 ? 'none' : '';
        }
        if (this._strengthBarEl) {
            this._strengthBarEl.className =
                `q-password-strength__bar q-password-strength__bar--${strength}`;
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
