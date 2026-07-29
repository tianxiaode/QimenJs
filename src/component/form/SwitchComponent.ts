/**
 * SwitchComponent 开关组件
 *
 * 从 FormFieldComponent 派生，复用标签/验证/信息区域等通用逻辑。
 * 通过 nodeOverrides 指定 fieldBody 为 SwitchFieldBodyComponent。
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
import { SwitchFieldBodyComponent } from './SwitchFieldBodyComponent';
import type { ValidationRule } from '@qimenjs/schema';

export interface SwitchProps extends FormFieldProps {
    checked?: boolean;
    disabled?: boolean;
    activeText?: string;
    inactiveText?: string;
}

export let SwitchComponent = FormFieldComponent.replace({
    body: {
        nodes: {
            root: { addCls: 'q-switch' },
            fieldBody: {
                type: SwitchFieldBodyComponent,
            },
        },

        _checked: false,
        _activeText: '' as string,
        _inactiveText: '' as string,

        onAfterInit(props?: SwitchProps): void {
            const self = this as any;
            self._initSwitch(props);
        },

        _initSwitch(props?: SwitchProps): void {
            const self = this as any;

            const fieldBodyCmp = self.nodeMap?.fieldBody?.component;
            if (fieldBodyCmp) {
                fieldBodyCmp.on('switchToggle', () => self.onTrackClick());
            }

            if (props?.checked) self._checked = props.checked;
            if (props?.activeText) self._activeText = props.activeText;
            if (props?.inactiveText) self._inactiveText = props.inactiveText;
            if (props?.disabled) self.disabled = props.disabled;

            self._applyState();
            self._updateText();
        },

        onTrackClick(): void {
            const self = this as any;
            if (self.disabled) return;
            self._checked = !self._checked;
            self._applyState();
            self._updateText();
            self.emit('switch:change', { checked: self._checked });
            if (self._shouldValidate('change')) self._doValidate();
        },

        _updateText(): void {
            const self = this as any;
            const trackEl = self.nodeMap?.track?.el as HTMLElement | null;
            if (!trackEl) return;

            const text = self._checked ? self._activeText : self._inactiveText;
            if (text) {
                trackEl.setAttribute('data-text', text);
            } else {
                trackEl.removeAttribute('data-text');
            }
        },

        getEventData(nodeName: string, eventName: string, eventType: string): Record<string, any> {
            const self = this as any;
            return { checked: self._checked };
        },

        get checked(): boolean {
            const self = this as any;
            return self._checked;
        },
        set checked(v: boolean) {
            const self = this as any;
            self._checked = v;
            self._applyState();
            self._updateText();
        },

        get disabled(): boolean {
            const self = this as any;
            return self.el.classList.contains('q-switch--disabled');
        },
        set disabled(v: boolean) {
            const self = this as any;
            self.toggleCls('q-switch--disabled', v);
            const trackEl = self.nodeMap?.track?.el as HTMLElement | null;
            if (trackEl) {
                if (v) trackEl.setAttribute('aria-disabled', 'true');
                else trackEl.removeAttribute('aria-disabled');
            }
        },

        _applyState(): void {
            const self = this as any;
            self.toggleCls('q-switch--checked', self._checked);
            self.toggleCls('q-switch--error', !!self._error);

            const trackEl = self.nodeMap?.track?.el as HTMLElement | null;
            if (trackEl) {
                trackEl.setAttribute('aria-checked', String(self._checked));
                trackEl.setAttribute('role', 'switch');
            }
        },

        getFormValue(): any {
            const self = this as any;
            return self._checked;
        },

        setFormValue(v: any): void {
            const self = this as any;
            self.checked = !!v;
        },

        formReset(defaultValue?: any): void {
            const self = this as any;
            self.checked = defaultValue ?? false;
            self.error = '';
        },

        update(props?: Partial<SwitchProps>): void {
            const self = this as any;
            self._super.update(props);

            if (props?.checked !== undefined) self.checked = props.checked;
            if (props?.disabled !== undefined) self.disabled = props.disabled;
            if (props?.activeText !== undefined) {
                self._activeText = props.activeText;
                self._updateText();
            }
            if (props?.inactiveText !== undefined) {
                self._inactiveText = props.inactiveText;
                self._updateText();
            }
        },
    },
});

export type SwitchComponent = InstanceType<typeof SwitchComponent>;
