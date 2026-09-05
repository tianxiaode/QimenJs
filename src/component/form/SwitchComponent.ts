import { FormFieldComponent } from './FormFieldComponent';
import type { TemplateDecl } from '@/component-core';
import { Definitions } from '@/composable';
import { SWITCH_TPL } from './switch-tpl';
import './switch.css';

const SwitchComponentDefs: Definitions = {
    options: {
        checked: false,
        activeText: null,
        inactiveText: null,
    },
} as const;

class SwitchComponent extends FormFieldComponent {
    static type = 'switch';

    get tpl(): TemplateDecl {
        return SWITCH_TPL;
    }

    _onCheckedOptionChange(value: boolean): void {
        this.toggleCls('q-switch--checked', value);
        this.toggleCls('q-switch--error', !!this._error);
        const trackEl = this.getNodeEl('track');
        if (trackEl) {
            (trackEl as HTMLElement).setAttribute('aria-checked', String(value));
            (trackEl as HTMLElement).setAttribute('role', 'switch');
        }
        this._updateText();
    }

    _onDisableOptionChange(value: boolean): void {
        const cls = `${this._cssPrefix}--disabled`;
        value ? this.addCls(cls) : this.removeCls(cls);
        const trackEl = this.getNodeEl('track');
        if (trackEl) {
            if (value) (trackEl as HTMLElement).setAttribute('aria-disabled', 'true');
            else (trackEl as HTMLElement).removeAttribute('aria-disabled');
        }
    }

    _onActiveTextOptionChange(_value: string): void {
        this._updateText();
    }

    _onInactiveTextOptionChange(_value: string): void {
        this._updateText();
    }

    onAfterInit(): void {
        super.onAfterInit();
        this.addCls('q-switch');
        const fieldBodyCmp = this.getComponent('fieldBody') as any;
        if (fieldBodyCmp) {
            fieldBodyCmp.on('switchToggle', () => this.onTrackClick());
        }
    }

    onTrackClick(): void {
        if (this.disable) return;
        this.checked = !this.checked;
        this.emit('switch:change', { checked: this.checked });
        if (this._shouldValidate('change')) this._doValidate();
    }

    _updateText(): void {
        const trackEl = this.getNodeEl('track');
        if (!trackEl) return;
        const text = this.checked ? this.activeText : this.inactiveText;
        if (text) {
            (trackEl as HTMLElement).setAttribute('data-text', text);
        } else {
            (trackEl as HTMLElement).removeAttribute('data-text');
        }
    }

    getEventData(_nodeName: string, _eventName: string, _eventType: string): Record<string, any> {
        return { checked: this.checked };
    }

    getFormValue(): any {
        return this.checked;
    }

    setFormValue(v: any): void {
        this.checked = !!v;
    }

    formReset(defaultValue?: any): void {
        this.checked = defaultValue ?? false;
        this.error = '';
    }
}

SwitchComponent.define(SwitchComponentDefs);

export { SwitchComponent };
export type SwitchComponentInstance = InstanceType<typeof SwitchComponent>;
