import { InputComponent } from './InputComponent';
import { Definitions } from '@/composable';
import { IconComponent } from '../icon/IconComponent';
import { EYE_BTN_ORDER, FIELD_ACTION } from './constants';
import { PasswordStrengthAbility, type PasswordStrength } from './abilities/PasswordStrengthAbility';
import './passwordinput.css';

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

    _eyeBtnItem: any = null;

    _onVisibleOptionChange(value: boolean): void {
        const fieldItem = this._fieldItem;
        if (fieldItem) fieldItem.inputType = value ? 'text' : 'password';
        const eyeCmp = this._eyeBtnItem;
        if (eyeCmp && typeof eyeCmp.update === 'function') {
            eyeCmp.update({ iconCls: value ? 'q-eye-off' : 'q-eye' });
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
        this._mountStrengthBar();
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
            iconCls: this.visible ? 'q-eye-off' : 'q-eye',
            action: FIELD_ACTION.EYE_TOGGLE,
            order: EYE_BTN_ORDER,
        });
        this._eyeBtnItem = item;
    }

    onFieldItemClick(domEvt?: any): void {
        super.onFieldItemClick(domEvt);
        if (domEvt?.action === FIELD_ACTION.EYE_TOGGLE) this.toggleVisibility();
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
PasswordInputComponent.use(PasswordStrengthAbility);

export { PasswordInputComponent };
export type PasswordInputComponentInstance = InstanceType<typeof PasswordInputComponent>;
export type { PasswordStrength };
