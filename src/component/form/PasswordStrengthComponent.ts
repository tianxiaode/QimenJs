/**
 * PasswordStrengthComponent 密码强度指示器组件
 *
 * 显示密码强度（0-4级），包含进度条和文本标签。
 * 通过update({strength, password})更新强度显示。
 */

import { Component } from '@qimenjs/component-core';
import { Definitions } from '@/composable';
import './password-strength.css';

/** 密码强度类型 */
export type PasswordStrength = 0 | 1 | 2 | 3 | 4;

/** 强度标签文本 */
const STRENGTH_LABELS: Record<PasswordStrength, string> = {
    0: '',
    1: '弱',
    2: '中',
    3: '强',
    4: '极强',
};

const PasswordStrengthComponentDefs: Definitions = {
    options: {
        strength: 0,
        password: '',
    },
} as const;

class PasswordStrengthComponent extends Component {
    onAfterInit(): void {
        this._updateUI();
    }

    update(props: Record<string, any>): void {
        if (props.strength !== undefined) {
            this.strength = props.strength;
        }
        if (props.password !== undefined) {
            this.password = props.password;
        }
        this._updateUI();
    }

    _updateUI(): void {
        const barEl = this.el.querySelector('.q-password-strength__fill') as HTMLElement;
        const labelEl = this.el.querySelector('.q-password-strength__label') as HTMLElement;

        if (barEl) {
            barEl.className = `q-password-strength__fill q-password-strength__fill--${this.strength}`;
        }

        if (labelEl) {
            labelEl.textContent = STRENGTH_LABELS[this.strength as PasswordStrength];
            labelEl.className = `q-password-strength__label q-password-strength__label--${this.strength}`;
        }
    }
}

PasswordStrengthComponent.define(PasswordStrengthComponentDefs);

export { PasswordStrengthComponent };
export type PasswordStrengthComponentInstance = InstanceType<typeof PasswordStrengthComponent>;
