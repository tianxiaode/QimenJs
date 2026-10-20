import { FormFieldComponent } from './FormFieldComponent';
import { FIELD_ACTION } from './constants';

import { Definitions } from '@/composable';
import './switch.css';

const SwitchComponentDefs: Definitions = {
    options: {
        checked: false,
        activeText: null,
        inactiveText: null,
        fieldType: 'switch',
    },
} as const;

class SwitchComponent extends FormFieldComponent {
    static type = 'switch';

    _getTrackEl(): HTMLElement | undefined {
        return this._fieldItem?.getNodeEl?.('track');
    }

    _onCheckedOptionChange(value: boolean): void {
        this.toggleCls('q-switch--checked', value);
        this.toggleCls('q-switch--error', !!this._error);
        const trackEl = this._getTrackEl();
        if (trackEl) {
            trackEl.setAttribute('aria-checked', String(value));
            trackEl.setAttribute('role', 'switch');
        }
        this._updateText();
    }

    _onDisableOptionChange(value: boolean): void {
        const cls = `${this._cssPrefix}--disabled`;
        value ? this.addCls(cls) : this.removeCls(cls);
        const trackEl = this._getTrackEl();
        if (trackEl) {
            if (value) trackEl.setAttribute('aria-disabled', 'true');
            else trackEl.removeAttribute('aria-disabled');
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
    }

    /** 覆写基类统一监听：track item action=toggle 时切换（disable 已由引擎委托入口检查） */
    onFieldItemClick(domEvt?: any): void {
        super.onFieldItemClick(domEvt);
        if (domEvt?.action !== FIELD_ACTION.SWITCH_TOGGLE) return;
        this.checked = !this.checked;
        this.emit('switch:change', { checked: this.checked });
        if (this._shouldValidate('change')) this._doValidate();
    }

    _updateText(): void {
        const trackEl = this._getTrackEl();
        if (!trackEl) return;
        const text = this.checked ? this.activeText : this.inactiveText;
        if (text) {
            trackEl.setAttribute('data-text', text);
        } else {
            trackEl.removeAttribute('data-text');
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
