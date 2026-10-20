import { InputComponent } from './InputComponent';
import { Definitions } from '@/composable';
import { DomEventsEngine } from '@/component-core/engine';
import { IconComponent } from '../icon/IconComponent';
import { PasswordStrengthComponent } from './PasswordStrengthComponent';
import { EYE_BTN_ORDER } from './constants';
import './passwordinput.css';

export type PasswordStrength = 0 | 1 | 2 | 3 | 4;

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

const STRENGTH_ORDER = 5;

const PasswordInputComponentDefs: Definitions = {
    options: {
        placeholder: null,
        clearable: false,
        maxLength: null,
        visible: false,
    },
} as const;

class PasswordInputComponent extends InputComponent {
    static type = 'password-input';

    _strength: PasswordStrength = 0;
    _eyeBtnItem: any = null;
    _strengthItem: any = null;

    _onVisibleOptionChange(value: boolean): void {
        const fieldItem = this._fieldItem;
        if (fieldItem) fieldItem.inputType = value ? 'text' : 'password';
        const eyeCmp = this._eyeBtnItem;
        if (eyeCmp && typeof eyeCmp.update === 'function') {
            eyeCmp.update({ iconCls: value ? 'eye-off' : 'eye' });
        }
    }

    onAfterInit(): void {
        super.onAfterInit();
        this.addCls('q-input--password');

        const fieldItem = this._fieldItem;
        if (fieldItem && this.type === 'text') {
            fieldItem.inputType = this.visible ? 'text' : 'password';
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
        const fieldBodyCmp = this._getFieldBody();
        if (!fieldBodyCmp || this._eyeBtnItem) return;
        const item = fieldBodyCmp.add({
            type: IconComponent,
            iconCls: this.visible ? 'eye-off' : 'eye',
            order: EYE_BTN_ORDER,
        });
        if (item?.el) {
            item.el.classList.add('q-password-toggle');
            DomEventsEngine.addEventRule(this, {
                event: 'click',
                path: item.el,
                handler: '_onEyeToggleClick',
            });
        }
        this._eyeBtnItem = item;
    }

    /** eye 按钮点击（DomEventsEngine isDirect 规则分发） */
    _onEyeToggleClick(domEvt?: any): void {
        (domEvt?.data?.originalEvent as Event | undefined)?.stopPropagation();
        this.toggleVisibility();
    }

    _mountStrengthIndicator(): void {
        const infoCmp = this.getComponent('infoGroup') as any;
        if (!infoCmp) return;

        const strengthCmp = infoCmp.addInfo({
            type: PasswordStrengthComponent,
            order: STRENGTH_ORDER,
        });
        if (strengthCmp) {
            this._strengthItem = infoCmp.items[infoCmp.items.length - 1] ?? null;
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
