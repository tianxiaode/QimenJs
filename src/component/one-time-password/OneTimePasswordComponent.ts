/**
 * OneTimePasswordComponent 一次性密码/验证码输入组件
 *
 * N 位验证码输入框，自动跳转、粘贴支持。
 * 从 FormFieldComponent 派生，复用标签/验证/信息区域等通用逻辑。
 *
 * 模板节点：
 * - fieldBody — 输入框容器，内含 N 个独立 input
 *
 * 事件：
 * - complete — 所有位填满时触发，数据 { value }
 * - input — 单位输入时触发，数据 { value, index }
 *
 * @example
 * new OneTimePasswordComponent({ length: 6, label: '验证码' })
 * new OneTimePasswordComponent({ length: 4, type: 'number' })
 * otp.on('complete', ({ value }) => { ... })
 */

import { FormFieldComponent } from '../form/FormFieldComponent';
import type { FormFieldProps } from '../form/FormFieldComponent';

export interface OneTimePasswordProps extends FormFieldProps {
    value?: string;
    length?: number;
    type?: 'text' | 'number';
    disabled?: boolean;
    readonly?: boolean;
    autoFocus?: boolean;
}

function getInputs(self: any): HTMLInputElement[] {
    const container = self.nodeMap?.fieldBody?.el as HTMLElement | null;
    if (!container) return [];
    return Array.from(container.querySelectorAll<HTMLInputElement>('.q-otp__input'));
}

export let OneTimePasswordComponent = FormFieldComponent.replace({
    body: {
        _length: 6 as number,
        _otpType: 'number' as 'text' | 'number',
        _otpDisabled: false as boolean,
        _otpReadonly: false as boolean,

        nodes: {
            root: { addCls: 'q-otp' },
        },

        onAfterInit(props?: OneTimePasswordProps): void {
            const self = this as any;
            self._initOTP(props);
        },

        _initOTP(props?: OneTimePasswordProps): void {
            const self = this as any;

            if (props?.length) self._length = props.length;
            if (props?.type) self._otpType = props.type;
            if (props?.disabled) self._otpDisabled = true;
            if (props?.readonly) self._otpReadonly = true;

            self._renderInputs();
            self._bindOTPEvents();
            self._applyOTPState();

            if (props?.autoFocus) {
                const inputs = getInputs(self);
                inputs[0]?.focus();
            }
        },

        _renderInputs(): void {
            const self = this as any;
            const container = self.nodeMap?.fieldBody?.el as HTMLElement | null;
            if (!container) return;

            container.classList.add('q-otp__container');
            container.innerHTML = '';

            for (let i = 0; i < self._length; i++) {
                const input = document.createElement('input');
                input.type = self._otpType === 'number' ? 'tel' : 'text';
                input.className = 'q-otp__input';
                input.maxLength = 1;
                input.dataset.index = String(i);
                input.setAttribute('aria-label', `Digit ${i + 1}`);

                if (self._otpDisabled) input.setAttribute('disabled', 'true');
                if (self._otpReadonly) input.setAttribute('readonly', 'true');

                if (self._otpType === 'number') {
                    input.inputMode = 'numeric';
                    input.pattern = '[0-9]';
                }

                container.appendChild(input);
            }
        },

        _bindOTPEvents(): void {
            const self = this as any;
            const container = self.nodeMap?.fieldBody?.el as HTMLElement | null;
            if (!container) return;

            container.addEventListener('input', (e: Event) => {
                const target = e.target as HTMLInputElement;
                if (!target.classList.contains('q-otp__input')) return;

                const value = target.value;
                if (self._otpType === 'number' && value && !/^\d$/.test(value)) {
                    target.value = '';
                    return;
                }

                if (value.length === 1) {
                    const index = Number(target.dataset.index);
                    const inputs = getInputs(self);
                    if (index < inputs.length - 1) {
                        inputs[index + 1].focus();
                    }
                    self._checkComplete();
                }
            });

            container.addEventListener('keydown', (e: KeyboardEvent) => {
                const target = e.target as HTMLInputElement;
                if (!target.classList.contains('q-otp__input')) return;

                const index = Number(target.dataset.index);
                const inputs = getInputs(self);

                if (e.key === 'Backspace' && !target.value && index > 0) {
                    inputs[index - 1].focus();
                    inputs[index - 1].value = '';
                }

                if (e.key === 'ArrowLeft' && index > 0) {
                    inputs[index - 1].focus();
                }
                if (e.key === 'ArrowRight' && index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }
            });

            container.addEventListener('paste', (e: ClipboardEvent) => {
                e.preventDefault();
                const text = e.clipboardData?.getData('text') ?? '';
                const inputs = getInputs(self);
                const chars = text.replace(/\s/g, '').slice(0, self._length);

                for (let i = 0; i < chars.length && i < inputs.length; i++) {
                    if (self._otpType === 'number' && !/^\d$/.test(chars[i])) continue;
                    inputs[i].value = chars[i];
                }

                const focusIndex = Math.min(chars.length, inputs.length - 1);
                inputs[focusIndex].focus();
                self._checkComplete();
            });

            container.addEventListener('focus', (e: FocusEvent) => {
                const target = e.target as HTMLInputElement;
                if (target.classList.contains('q-otp__input')) {
                    target.select();
                }
            });
        },

        _checkComplete(): void {
            const self = this as any;
            const inputs = getInputs(self);
            const value = inputs.map(i => i.value).join('');

            if (value.length === self._length) {
                self.emit('complete', { value });
            } else {
                self.emit('input', { value, index: -1 });
            }
        },

        _applyOTPState(): void {
            const self = this as any;
            self.toggleCls('q-otp--disabled', self._otpDisabled);
            self.toggleCls('q-otp--readonly', self._otpReadonly);
        },

        get value(): string {
            const inputs = getInputs(this);
            return inputs.map(i => i.value).join('');
        },
        set value(v: string) {
            const inputs = getInputs(this);
            const chars = v.split('');
            for (let i = 0; i < inputs.length; i++) {
                inputs[i].value = chars[i] ?? '';
            }
        },

        get otpLength(): number {
            return (this as any)._length;
        },

        getFormValue(): any {
            return this.value;
        },

        setFormValue(v: any): void {
            if (typeof v === 'string') this.value = v;
        },

        formReset(defaultValue?: any): void {
            (this as any).value = defaultValue ?? '';
            (this as any).error = '';
        },

        getEventData(nodeName: string, eventName: string, eventType: string): Record<string, any> {
            return { value: this.value };
        },

        update(props?: Partial<OneTimePasswordProps>): void {
            const self = this as any;
            self._super.update(props);

            if (props?.length !== undefined) {
                self._length = props.length;
                self._renderInputs();
                self._bindOTPEvents();
            }
            if (props?.type !== undefined) {
                self._otpType = props.type;
                self._renderInputs();
                self._bindOTPEvents();
            }
            if (props?.disabled !== undefined) {
                self._otpDisabled = props.disabled;
                self._applyOTPState();
                const inputs = getInputs(self);
                inputs.forEach(i => {
                    if (props.disabled) i.setAttribute('disabled', 'true');
                    else i.removeAttribute('disabled');
                });
            }
            if (props?.readonly !== undefined) {
                self._otpReadonly = props.readonly;
                self._applyOTPState();
                const inputs = getInputs(self);
                inputs.forEach(i => {
                    if (props.readonly) i.setAttribute('readonly', 'true');
                    else i.removeAttribute('readonly');
                });
            }
            if (props?.value !== undefined) (self as any).value = props.value;
        },
    },
});

export type OneTimePasswordComponent = InstanceType<typeof OneTimePasswordComponent>;
