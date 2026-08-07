/**
 * SwitchComponent 开关组件
 *
 * 从 FormFieldComponent 派生，复用标签/验证/信息区域等通用逻辑。
 * fieldBody 子组件为 SwitchFieldBodyComponent（由 SWITCH_TPL 指定）。
 *
 * 三封装结构（继承自 FormField）：
 * - labelGroup  标签封装：label + requiredMark + separator
 * - fieldBody   开关封装：track + thumb
 * - infoGroup   信息封装：InputInfoGroupComponent
 *
 * Switch 特有功能：
 * - checked 属性
 * - disabled 属性
 * - 点击切换
 * - activeText/inactiveText 文字标签
 *
 * 事件：switch:change。
 *
 * @example
 * ```ts
 * new SwitchComponent({ checked: true, label: '启用' })
 * sw.on('switch:change', ({ checked }) => { ... })
 * ```
 */

import { FormFieldComponent, type FormFieldProps } from './FormFieldComponent';
import { SWITCH_TPL } from './switch-tpl';
import './switch.css.ts';

export interface SwitchProps extends FormFieldProps {
    checked?: boolean;
    disabled?: boolean;
    activeText?: string;
    inactiveText?: string;
}

class SwitchComponent extends FormFieldComponent {
    _checked: boolean = false;
    _activeText: string = '';
    _inactiveText: string = '';

    onAfterInit(props?: SwitchProps): void {
        super.onAfterInit(props);
        this.addCls('q-switch');
        this._initSwitch(props);
    }

    _initSwitch(props?: SwitchProps): void {
        const fieldBodyCmp = this.nodeMap?.fieldBody?.component;
        if (fieldBodyCmp) {
            fieldBodyCmp.on('switchToggle', () => this.onTrackClick());
        }

        if (props?.checked) this._checked = props.checked;
        if (props?.activeText) this._activeText = props.activeText;
        if (props?.inactiveText) this._inactiveText = props.inactiveText;
        if (props?.disabled) this.disabled = props.disabled;

        this._applyState();
        this._updateText();
    }

    onTrackClick(): void {
        if (this.disabled) return;
        this._checked = !this._checked;
        this._applyState();
        this._updateText();
        this.emit('switch:change', { checked: this._checked });
        if (this._shouldValidate('change')) this._doValidate();
    }

    _updateText(): void {
        const trackEl = this.nodeMap?.track?.el as HTMLElement | null;
        if (!trackEl) return;

        const text = this._checked ? this._activeText : this._inactiveText;
        if (text) {
            trackEl.setAttribute('data-text', text);
        } else {
            trackEl.removeAttribute('data-text');
        }
    }

    getEventData(_nodeName: string, _eventName: string, _eventType: string): Record<string, any> {
        return { checked: this._checked };
    }

    get checked(): boolean {
        return this._checked;
    }
    set checked(v: boolean) {
        this._checked = v;
        this._applyState();
        this._updateText();
    }

    get disabled(): boolean {
        return this.el.classList.contains('q-switch--disabled');
    }
    set disabled(v: boolean) {
        this.toggleCls('q-switch--disabled', v);
        const trackEl = this.nodeMap?.track?.el as HTMLElement | null;
        if (trackEl) {
            if (v) trackEl.setAttribute('aria-disabled', 'true');
            else trackEl.removeAttribute('aria-disabled');
        }
    }

    _applyState(): void {
        this.toggleCls('q-switch--checked', this._checked);
        this.toggleCls('q-switch--error', !!this._error);

        const trackEl = this.nodeMap?.track?.el as HTMLElement | null;
        if (trackEl) {
            trackEl.setAttribute('aria-checked', String(this._checked));
            trackEl.setAttribute('role', 'switch');
        }
    }

    getFormValue(): any {
        return this._checked;
    }

    setFormValue(v: any): void {
        this.checked = !!v;
    }

    formReset(defaultValue?: any): void {
        this.checked = defaultValue ?? false;
        this.error = '';
    }

    update(props?: Partial<SwitchProps>): void {
        super.update(props);

        if (props?.checked !== undefined) this.checked = props.checked;
        if (props?.disabled !== undefined) this.disabled = props.disabled;
        if (props?.activeText !== undefined) {
            this._activeText = props.activeText;
            this._updateText();
        }
        if (props?.inactiveText !== undefined) {
            this._inactiveText = props.inactiveText;
            this._updateText();
        }
    }
}

SwitchComponent.useTemplate(SWITCH_TPL);
export { SwitchComponent };
export type SwitchComponentInstance = InstanceType<typeof SwitchComponent>;
