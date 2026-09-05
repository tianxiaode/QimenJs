import { InputComponent, type InputProps } from './InputComponent';
import { Definitions } from '@/composable';
import { IconComponent } from '../icon/IconComponent';
import { PasswordStrengthComponent } from './PasswordStrengthComponent';
import './passwordinput.css';

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

const PasswordInputComponentDefs: Definitions = {
    options: {
        visible: false,
    },
} as const;

class PasswordInputComponent extends InputComponent {
    static type = 'password-input';

    _strength: PasswordStrength = 0;
    _eyeBtnItem: any = null;
    _strengthItem: any = null;

    _onVisibleOptionChange(value: boolean): void {
        const fieldEl = this.getNodeEl('field');
        if (fieldEl) {
            fieldEl.setAttribute('type', value ? 'text' : 'password');
        }
        const eyeCmp = this._eyeBtnItem?.component;
        if (eyeCmp && typeof eyeCmp.update === 'function') {
            eyeCmp.update({ iconCls: value ? 'eye-off' : 'eye' });
        }
    }

    onAfterInit(): void {
        super.onAfterInit();
        this.addCls('q-input--password');
        this._setNodeHidden(false, 'suffix');

        const fieldEl = this.getNodeEl('field');
        if (fieldEl && this.type === 'text') {
            fieldEl.setAttribute('type', this.visible ? 'text' : 'password');
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
            iconCls: this.visible ? 'eye-off' : 'eye',
            cls: 'q-password-toggle',
            order: EYE_BTN_ORDER,
        });
        const actionsCmp = this.getComponent('actions') as any;
        this._eyeBtnItem = actionsCmp?._items[actionsCmp._items.length - 1] ?? null;
    }

    onFieldBodyActionClick(data: any): void {
        const index = data?.index;
        if (index === undefined) return;
        const actionsCmp = this.getComponent('actions') as any;
        if (!actionsCmp) return;
        if (this._clearBtnItem && this._itemsIndexOf(actionsCmp, this._clearBtnItem) === index) {
            this.onClearBtnClick();
        }
        if (this._eyeBtnItem && this._itemsIndexOf(actionsCmp, this._eyeBtnItem) === index) {
            this.toggleVisibility();
        }
    }

    _mountStrengthIndicator(): void {
        const infoCmp = this.getComponent('infoGroup') as any;
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
        const password = this.value || '';
        const strength = calculateStrength(password);
        const changed = strength !== this._strength;
        this._strength = strength;

        const strengthCmp = this._strengthItem?.component;
        if (strengthCmp && typeof strengthCmp.update === 'function') {
            strengthCmp.update({ strength, password });
        }

        if (changed) {
            this.emit('strengthChange', { strength, value: password });
        }
    }

    toggleVisibility(visible?: boolean): void {
        this.visible = visible !== undefined ? visible : !this.visible;
    }

    getEventData(_nodeName: string, eventName: string, _eventType: string): Record<string, any> {
        if (eventName === 'strengthChange') {
            return { strength: this._strength, value: this.value };
        }
        return { value: this.value };
    }
}

PasswordInputComponent.define(PasswordInputComponentDefs);

export { PasswordInputComponent };
export type PasswordInputComponentInstance = InstanceType<typeof PasswordInputComponent>;
