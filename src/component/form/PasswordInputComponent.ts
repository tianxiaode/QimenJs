/**
 * PasswordInputComponent 密码输入框组件
 *
 * 从 InputComponent 派生，共享统一模板（继承父类模板，无需 useTemplate）。
 * 开启 suffix 节点，addAction 添加 eyeBtn，addInfo 添加密码强度指示器。
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
import { IconComponent } from '../icon/IconComponent';
import { PasswordStrengthComponent } from './PasswordStrengthComponent';
import './passwordinput.css.ts';

export type PasswordStrength = 0 | 1 | 2 | 3 | 4;

export interface PasswordInputProps extends InputProps {
    visible?: boolean;
    onStrengthChange?: (strength: PasswordStrength) => void;
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

class PasswordInputComponent extends InputComponent {
    _visible: boolean = false;
    _strength: PasswordStrength = 0;
    _eyeBtnItem: any = null;
    _strengthItem: any = null;

    onAfterInit(props?: PasswordInputProps): void {
        super.onAfterInit(props);
        this.addCls('q-input--password');

        this._visible = props?.visible ?? false;
        this._strength = 0;

        this.setNodeHidden(false, 'suffix');

        const fieldEl = this.field;
        if (fieldEl && !props?.type) {
            fieldEl.setAttribute('type', this._visible ? 'text' : 'password');
        }

        this._mountEyeToggle();
        this._mountStrengthIndicator();
        this._updateStrength();
    }

    onFieldInput(): void {
        super.onFieldInput();
        this._updateStrength();
    }

    onFieldBlur(): void {
        super.onFieldBlur();
        this._updateStrength();
    }

    _mountEyeToggle(): void {
        this.addAction({
            type: IconComponent,
            content: this._visible ? 'eye-off' : 'eye',
            cls: 'q-password-toggle',
            order: EYE_BTN_ORDER,
        });
        const actionsCmp = this.nodeMap?.actions?.component;
        this._eyeBtnItem = actionsCmp?._items[actionsCmp._items.length - 1] ?? null;
    }

    onFieldBodyActionClick(data: any): void {
        const index = data?.index;
        if (index === undefined) return;
        const actionsCmp = this.nodeMap?.actions?.component;
        if (!actionsCmp) return;
        if (this._clearBtnItem && this._itemsIndexOf(actionsCmp, this._clearBtnItem) === index) {
            this.onClearBtnClick();
        }
        if (this._eyeBtnItem && this._itemsIndexOf(actionsCmp, this._eyeBtnItem) === index) {
            this.toggleVisibility();
        }
    }

    _mountStrengthIndicator(): void {
        const infoCmp = this.nodeMap?.infoGroup?.component;
        if (!infoCmp) return;

        const strengthCmp = infoCmp.addInfo({
            type: PasswordStrengthComponent,
            order: STRENGTH_ORDER,
        });
        if (strengthCmp) {
            this._strengthItem = infoCmp._items[infoCmp._items.length - 1] ?? null;
        }
    }

    _updateStrength(): void {
        const password = this._value || '';
        const strength = calculateStrength(password);
        const changed = strength !== this._strength;
        this._strength = strength;

        const strengthCmp = this._strengthItem?.component;
        if (strengthCmp && typeof strengthCmp.update === 'function') {
            strengthCmp.update({ strength, password });
        }

        if (changed) {
            this.emit('strengthChange', { strength, value: password });
            const props = (this as any)._props as PasswordInputProps | undefined;
            props?.onStrengthChange?.(strength);
        }
    }

    toggleVisibility(visible?: boolean): void {
        const newVisible = visible !== undefined ? visible : !this._visible;
        this._visible = newVisible;

        const fieldEl = this.field;
        if (fieldEl) {
            fieldEl.setAttribute('type', newVisible ? 'text' : 'password');
        }

        const eyeCmp = this._eyeBtnItem?.component;
        if (eyeCmp && typeof eyeCmp.update === 'function') {
            eyeCmp.update({ content: newVisible ? 'eye-off' : 'eye' });
        }
    }

    getEventData(_nodeName: string, eventName: string, _eventType: string): Record<string, any> {
        if (eventName === 'strengthChange') {
            return { strength: this._strength, value: this._value };
        }
        return { value: this._value };
    }

    update(props?: Partial<PasswordInputProps>): void {
        super.update(props);
        if (props?.visible !== undefined) {
            this.toggleVisibility(props.visible);
        }
    }
}

export { PasswordInputComponent };
export type PasswordInputComponentInstance = InstanceType<typeof PasswordInputComponent>;
