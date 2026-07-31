/**
 * OneTimePasswordComponent 一次性密码/验证码输入组件
 *
 * N 位验证码输入框，默认模板提供 8 个 input 节点，根据 length (4/6/8) 动态切换显示。
 * 借助 CommonPropsAbility 进行节点显隐与属性驱动，使用两层结构 domEvents 统一委托 DOM 事件。
 *
 * 事件：
 * - complete — 所有位填满时触发，数据 { value }
 * - input — 单位输入时触发，数据 { value, index }
 *
 * @example
 * new OneTimePasswordComponent({ length: 6 })
 * new OneTimePasswordComponent({ length: 4, type: 'number' })
 * otp.on('complete', ({ value }) => { ... })
 */

import { Component } from '@qimenjs/component-core';
import type { DomEventsMap } from '@qimenjs/component-core';
import { ONE_TIME_PASSWORD_TPL } from './one-time-password-tpl';
import './one-time-password.css';

export interface OneTimePasswordProps {
    value?: string;
    length?: number;
    type?: 'text' | 'number';
    disabled?: boolean;
    readonly?: boolean;
    autoFocus?: boolean;
}

const MAX_INPUTS = 8;

class OneTimePasswordComponent extends Component {
    _length: number = 6;
    _otpType: 'text' | 'number' = 'number';
    _otpDisabled: boolean = false;
    _otpReadonly: boolean = false;

    domEvents?: DomEventsMap = {
        input: { handler: '_onInput' },
        keydown: { handler: '_onKeydown' },
        paste: { handler: '_onPaste' },
        focusin: { handler: '_onFocus' },
    };

    onAfterInit(props?: OneTimePasswordProps): void {
        if (props?.length !== undefined) this._length = props.length;
        if (props?.type !== undefined) this._otpType = props.type;
        if (props?.disabled) this._otpDisabled = true;
        if (props?.readonly) this._otpReadonly = true;

        this._applyOTPState();

        if (props?.value !== undefined) {
            this.value = props.value;
        }

        if (props?.autoFocus) {
            const inputs = this._getInputs();
            inputs[0]?.focus();
        }
    }

    private _getInputs(): HTMLInputElement[] {
        const inputs: HTMLInputElement[] = [];
        for (let i = 0; i < this._length; i++) {
            const el = this.nodeMap?.[`input${i}`]?.el as HTMLInputElement | undefined;
            if (el) {
                inputs.push(el);
            }
        }
        return inputs;
    }

    _onInput(domEvt: Event): void {
        const target = domEvt.target as HTMLInputElement;
        if (!target?.classList.contains('q-otp__input')) return;

        const value = target.value;
        if (this._otpType === 'number' && value && !/^\d$/.test(value)) {
            target.value = '';
            return;
        }

        if (value.length === 1) {
            const inputs = this._getInputs();
            const index = inputs.indexOf(target);
            if (index >= 0 && index < inputs.length - 1 && inputs[index + 1]) {
                inputs[index + 1].focus();
            }
            this._checkComplete();
        }
    }

    _onKeydown(domEvt: KeyboardEvent): void {
        const target = domEvt.target as HTMLInputElement;
        if (!target?.classList.contains('q-otp__input')) return;

        const inputs = this._getInputs();
        const index = inputs.indexOf(target);
        if (index < 0) return;

        if (domEvt.key === 'Backspace' && !target.value && index > 0 && inputs[index - 1]) {
            inputs[index - 1].focus();
            inputs[index - 1].value = '';
        }

        if (domEvt.key === 'ArrowLeft' && index > 0 && inputs[index - 1]) {
            inputs[index - 1].focus();
        }
        if (domEvt.key === 'ArrowRight' && index < inputs.length - 1 && inputs[index + 1]) {
            inputs[index + 1].focus();
        }
    }

    _onPaste(domEvt: ClipboardEvent): void {
        domEvt.preventDefault();
        const text = domEvt.clipboardData?.getData('text') ?? '';
        const inputs = this._getInputs();
        const chars = text.replace(/\s/g, '').slice(0, this._length);

        for (let i = 0; i < chars.length && i < inputs.length; i++) {
            if (this._otpType === 'number' && !/^\d$/.test(chars[i])) continue;
            inputs[i].value = chars[i];
        }

        const focusIndex = Math.min(chars.length, inputs.length - 1);
        inputs[focusIndex]?.focus();
        this._checkComplete();
    }

    _onFocus(domEvt: FocusEvent): void {
        const target = domEvt.target as HTMLInputElement;
        if (target?.classList.contains('q-otp__input')) {
            target.select();
        }
    }

    private _checkComplete(): void {
        const inputs = this._getInputs();
        const value = inputs.map(i => i.value).join('');

        if (value.length === this._length) {
            this.emit('complete', { value });
        } else {
            this.emit('input', { value, index: -1 });
        }
    }

    private _applyOTPState(): void {
        this.toggleCls('q-otp--disabled', this._otpDisabled);
        this.toggleCls('q-otp--readonly', this._otpReadonly);

        for (let i = 0; i < MAX_INPUTS; i++) {
            const nodeName = `input${i}`;
            const isVisible = i < this._length;
            this.setNodeHidden(!isVisible, nodeName);

            if (isVisible) {
                const inputType = this._otpType === 'number' ? 'tel' : 'text';
                this.setAttr('type', inputType, nodeName);

                if (this._otpDisabled) {
                    this.setNodeDisabled(true, nodeName);
                } else {
                    this.setNodeDisabled(false, nodeName);
                }

                if (this._otpReadonly) {
                    this.setAttr('readonly', 'true', nodeName);
                } else {
                    this.removeAttr('readonly', nodeName);
                }
            }
        }
    }

    get value(): string {
        const inputs = this._getInputs();
        return inputs.map(i => i.value).join('');
    }

    set value(v: string) {
        const inputs = this._getInputs();
        const chars = (v ?? '').split('');
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].value = chars[i] ?? '';
        }
    }

    get otpLength(): number {
        return this._length;
    }

    getFormValue(): any {
        return this.value;
    }

    setFormValue(v: any): void {
        if (typeof v === 'string') this.value = v;
    }

    formReset(defaultValue?: any): void {
        this.value = defaultValue ?? '';
    }

    update(props?: Partial<OneTimePasswordProps>): void {
        super.update(props);

        if (props?.length !== undefined) {
            this._length = props.length;
        }
        if (props?.type !== undefined) {
            this._otpType = props.type;
        }
        if (props?.disabled !== undefined) {
            this._otpDisabled = props.disabled;
        }
        if (props?.readonly !== undefined) {
            this._otpReadonly = props.readonly;
        }

        this._applyOTPState();

        if (props?.value !== undefined) {
            this.value = props.value;
        }
    }
}

OneTimePasswordComponent.useTemplate(ONE_TIME_PASSWORD_TPL);

export { OneTimePasswordComponent };
export type OneTimePasswordComponentInstance = InstanceType<typeof OneTimePasswordComponent>;
