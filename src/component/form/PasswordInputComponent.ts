/**
 * PasswordInputComponent 密码输入框组件
 *
 * 基于 InputComponent 通过 .replace() 派生，共享统一模板。
 * 通过 nodeOverrides 开启 suffix，addAction 添加 eyeBtn，
 * addInfo 添加密码强度指示器。
 *
 * 特有功能：
 * - 密码可见性切换（眼睛图标，通过 addAction 添加到 actions）
 * - 密码强度指示器（5 级，通过 addInfo 添加到 infoGroup）
 * - 密码强度事件回调
 *
 * @example
 * ```ts
 * new PasswordInputComponent({ label: '密码', labelPosition: 'left' })
 * pwd.on('strengthChange', ({ strength }) => { ... })
 * ```
 */

import { InputComponent, type InputProps } from './InputComponent';
import { getI18nManager } from '@qimenjs/i18n';

export type PasswordStrength = 0 | 1 | 2 | 3 | 4;

export interface PasswordInputProps extends InputProps {
    visible?: boolean;
    onStrengthChange?: (strength: PasswordStrength) => void;
}

function getFieldEl(cmp: any): HTMLInputElement | null {
    return cmp.nodeMap?.field?.el as HTMLInputElement | null;
}

function calculateStrength(password: string): PasswordStrength {
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

const EYE_BTN_ORDER = 10;
const STRENGTH_ORDER = 5;

export let PasswordInputComponent = InputComponent.replace({
    type: 'PasswordInput',
    cls: 'q-input--password',

    nodeOverrides: {
        suffix: { hidden: false },
    },

    body: {
        onInitState() {
            const self = this as any;
            const state = self._super.onInitState();
            return {
                ...state,
                _visible: false,
                _strength: 0 as PasswordStrength,
                _eyeBtnItem: null as any,
                _strengthItem: null as any,
            };
        },

        onAfterInit(props?: PasswordInputProps): void {
            const self = this as any;
            self._visible = props?.visible ?? false;
            self._strength = 0;

            const fieldEl = getFieldEl(self);
            if (fieldEl && !props?.type) {
                fieldEl.setAttribute('type', self._visible ? 'text' : 'password');
            }

            self._mountEyeToggle();
            self._mountStrengthIndicator();
            self._updateStrength();
        },

        onFieldInput(): void {
            const self = this as any;
            self._super.onFieldInput();
            self._updateStrength();
        },

        onFieldBlur(): void {
            const self = this as any;
            self._super.onFieldBlur();
            self._updateStrength();
        },

        _mountEyeToggle(): void {
            const self = this as any;
            self.addAction({
                type: 'Icon',
                content: self._visible ? 'eye-off' : 'eye',
                cls: 'q-password-toggle',
                order: EYE_BTN_ORDER,
            });
            const actionsCmp = self.nodeMap?.actions?.component;
            self._eyeBtnItem = actionsCmp?._items[actionsCmp._items.length - 1] ?? null;
        },

        _initActionEvents(): void {
            const self = this as any;
            const actionsCmp = self.nodeMap?.actions?.component;
            if (!actionsCmp) return;
            actionsCmp.on('actionClick', (data: any) => {
                const index = data?.index;
                if (index === undefined) return;
                if (
                    self._clearBtnItem &&
                    self._itemsIndexOf(actionsCmp, self._clearBtnItem) === index
                ) {
                    self.onClearBtnClick();
                }
                if (
                    self._eyeBtnItem &&
                    self._itemsIndexOf(actionsCmp, self._eyeBtnItem) === index
                ) {
                    self.toggleVisibility();
                }
            });
        },

        _mountStrengthIndicator(): void {
            const self = this as any;
            const infoCmp = self.nodeMap?.infoGroup?.component;
            if (!infoCmp) return;

            const strengthCmp = infoCmp.addInfo({
                type: 'PasswordStrength',
                order: STRENGTH_ORDER,
            });
            if (strengthCmp) {
                self._strengthItem = infoCmp._items[infoCmp._items.length - 1] ?? null;
            }
        },

        _updateStrength(): void {
            const self = this as any;
            const password = self._value || '';
            const strength = calculateStrength(password);
            const changed = strength !== self._strength;
            self._strength = strength;

            const strengthCmp = self._strengthItem?.component;
            if (strengthCmp && typeof strengthCmp.update === 'function') {
                strengthCmp.update({ strength, password });
            }

            if (changed) {
                self.emit('strengthChange', { strength, value: password });
                const props = self._props as PasswordInputProps | undefined;
                props?.onStrengthChange?.(strength);
            }
        },

        toggleVisibility(visible?: boolean): void {
            const self = this as any;
            const newVisible = visible !== undefined ? visible : !self._visible;
            self._visible = newVisible;

            const fieldEl = getFieldEl(self);
            if (fieldEl) {
                fieldEl.setAttribute('type', newVisible ? 'text' : 'password');
            }

            const eyeCmp = self._eyeBtnItem?.component;
            if (eyeCmp && typeof eyeCmp.update === 'function') {
                eyeCmp.update({ content: newVisible ? 'eye-off' : 'eye' });
            }
        },

        getEventData(nodeName: string, eventName: string, eventType: string): Record<string, any> {
            const self = this as any;
            if (eventName === 'strengthChange') {
                return { strength: self._strength, value: self._value };
            }
            return { value: self._value };
        },

        update(props?: Partial<PasswordInputProps>): void {
            const self = this as any;
            self._super.update(props);
            if (props?.visible !== undefined) {
                self.toggleVisibility(props.visible);
            }
        },
    },
});

export type PasswordInputComponent = InstanceType<typeof PasswordInputComponent>;
