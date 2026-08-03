/**
 * DatePickerComponent 日期时间选择器
 *
 * 从 InputComponent 派生，共享统一模板（继承父类模板，无需 useTemplate）。
 * InputFieldBody 已预留 dropdownIcon 节点，DatePicker 开启该节点。
 * field 设为 readonly，通过下拉面板选择值。
 *
 * 面板导航栏内嵌预览，单击字段进入对应面板，选完自动流转。
 * 导航栏：[◀上一面板] [▶下一面板] [预览...] [✓确认] [✕取消]
 *
 * 面板组件在 date/ 目录下独立存在，可复用。
 * DatePicker 只负责：Input + 浮动层 + 面板切换 + 流转逻辑。
 *
 * 事件：datePicker:change / datePicker:open / datePicker:close
 *
 * @example
 * ```ts
 * new DatePickerComponent({ value: new Date(), showSeconds: true })
 * picker.on('datePicker:change', ({ value }) => { ... })
 * ```
 */

import { InputComponent, type InputProps } from './InputComponent';
import { YearPanelComponent } from '../date/YearPanelComponent';
import { MonthPanelComponent } from '../date/MonthPanelComponent';
import { DatePanelComponent } from '../date/DatePanelComponent';
import { HourPanelComponent } from '../date/HourPanelComponent';
import { MinutePanelComponent } from '../date/MinutePanelComponent';
import { SecondPanelComponent } from '../date/SecondPanelComponent';
import {
    createDateTimeValue,
    dateTimeValueToDate,
    fixDateTime,
    formatPreview,
    getNextField,
    getFlowFromEntry,
    type DateTimeField,
    type DateTimeValue,
} from '@/utils/date';
import type { PanelPreviewData } from '../date/panel-preview';
import './datepicker.css';

export interface DatePickerProps extends Omit<InputProps, 'value' | 'type'> {
    value?: Date;
    showSeconds?: boolean;
    startDayOfWeek?: number;
}

const FIELD_ORDER: DateTimeField[] = ['year', 'month', 'day', 'hour', 'minute', 'second'];

class DatePickerComponent extends InputComponent {
    _dateValue: DateTimeValue | null = null;
    _originalValue: DateTimeValue | null = null;
    _showSeconds: boolean = true;
    _startDayOfWeek: number = 0;
    _dropdownOpen: boolean = false;
    _currentField: DateTimeField | null = null;
    _flowQueue: DateTimeField[] = [];
    _panelEl: HTMLElement | null = null;
    _panelCmp: any = null;

    onAfterInit(props?: DatePickerProps): void {
        super.onAfterInit(props);
        this.addCls('q-datepicker');

        const fieldEl = this.field;

        if (fieldEl) {
            fieldEl.setAttribute('readonly', 'true');
            fieldEl.removeAttribute('type');
        }

        this._showSeconds = props?.showSeconds ?? true;
        this._startDayOfWeek = props?.startDayOfWeek ?? 0;

        const date = props?.value ?? new Date();
        this._dateValue = createDateTimeValue(date);
        this._originalValue = { ...this._dateValue };

        this._mountDropdownIcon();
        this._syncDisplayValue();
        this._applyState();
    }

    onBeforeDispose(): void {
        this._closeDropdown();
        super.onBeforeDispose();
    }

    _mountDropdownIcon(): void {
        this.setNodeHidden(false, 'dropdownIcon');
        const dropdownEl = this.nodeMap?.dropdownIcon?.el as HTMLElement | null;
        if (dropdownEl) {
            dropdownEl.textContent = '📅';
            dropdownEl.style.cursor = 'pointer';
        }
    }

    onFieldFocus(): void {
        this._focused = true;
        this._applyState();
        this._openDropdown('year');
    }

    onFieldBlur(): void {
        this._focused = false;
        this._applyState();
    }

    _openDropdown(entryField: DateTimeField): void {
        if (this._dropdownOpen) {
            this._switchPanel(entryField);
            return;
        }

        this._dropdownOpen = true;
        this._originalValue = { ...this._dateValue! };
        this.toggleCls('q-datepicker--open', true);

        this._flowQueue = getFlowFromEntry(entryField, this._showSeconds);
        this._currentField = entryField;

        this._renderPanel();
        this.emit('datePicker:open', {});
    }

    _closeDropdown(): void {
        if (!this._dropdownOpen) return;
        this._dropdownOpen = false;
        this.toggleCls('q-datepicker--open', false);

        if (this._panelCmp) {
            this._panelCmp.el?.remove();
            this._panelCmp = null;
        }
        if (this._panelEl) {
            this._panelEl.remove();
            this._panelEl = null;
        }

        this._currentField = null;
        this._flowQueue = [];
        this.emit('datePicker:close', {});
    }

    _switchPanel(field: DateTimeField): void {
        this._flowQueue = getFlowFromEntry(field, this._showSeconds);
        this._currentField = field;
        this._renderPanel();
    }

    _getPreviewData(): PanelPreviewData {
        return {
            value: this._dateValue!,
            activeField: this._currentField!,
            showSeconds: this._showSeconds,
        };
    }

    _renderPanel(): void {
        if (this._panelCmp) {
            this._panelCmp.el?.remove();
            this._panelCmp = null;
        }
        if (this._panelEl) {
            this._panelEl.remove();
            this._panelEl = null;
        }

        const container = document.createElement('div');
        container.className = 'q-datepicker__dropdown';

        const panelContainer = document.createElement('div');
        panelContainer.className = 'q-datepicker__panel-area';

        const field = this._currentField!;
        const value = this._dateValue!;
        const flowIdx = FIELD_ORDER.indexOf(field);
        const showPrevField = flowIdx > 0;
        const showNextField = flowIdx < FIELD_ORDER.length - 1;
        const previewData = this._getPreviewData();

        let panelCmp: any = null;

        switch (field) {
            case 'year':
                panelCmp = new YearPanelComponent({
                    value,
                    previewData,
                    showPrevField,
                    showNextField,
                });
                panelCmp.on('yearSelect', (data: any) => this._onAutoNext(data.value));
                break;
            case 'month':
                panelCmp = new MonthPanelComponent({
                    value,
                    previewData,
                    showPrevField,
                    showNextField,
                });
                panelCmp.on('monthSelect', (data: any) => this._onAutoNext(data.value));
                break;
            case 'day':
                panelCmp = new DatePanelComponent({ value });
                panelCmp.on('daySelect', (data: any) => this._onAutoNext(data.value));
                panelCmp.on('navigate', (_data: any) => this._switchPanel('month'));
                break;
            case 'hour':
                panelCmp = new HourPanelComponent({
                    value,
                    previewData,
                    showPrevField,
                    showNextField,
                });
                panelCmp.on('hourSelect', (data: any) => this._onAutoNext(data.value));
                break;
            case 'minute':
                panelCmp = new MinutePanelComponent({
                    value,
                    previewData,
                    showPrevField,
                    showNextField,
                });
                panelCmp.on('minuteSelect', (data: any) => this._onAutoNext(data.value));
                break;
            case 'second':
                panelCmp = new SecondPanelComponent({
                    value,
                    previewData,
                    showPrevField,
                    showNextField,
                });
                panelCmp.on('secondSelect', (data: any) => this._onAutoNext(data.value));
                break;
        }

        if (panelCmp) {
            panelCmp.on('prevField', () => this._onPrevField());
            panelCmp.on('nextField', () => this._onNextField());
            panelCmp.on('confirm', (data: any) => this._onConfirm(data.value));
            panelCmp.on('cancel', () => this._onCancel());
            panelCmp.on('navigate', (data: any) => this._switchPanel(data.field));
            panelContainer.appendChild(panelCmp.el);
            this._panelCmp = panelCmp;
        }

        container.appendChild(panelContainer);
        this._panelEl = container;

        const wrapperEl = this.nodeMap?.fieldBody?.el as HTMLElement | null;
        if (wrapperEl) {
            wrapperEl.appendChild(container);
        }
    }

    _onAutoNext(newValue: DateTimeValue): void {
        const fixed = fixDateTime(newValue);
        this._dateValue = fixed;
        this._syncDisplayValue();

        const nextField = getNextField(this._currentField!, this._showSeconds);
        if (nextField) {
            this._currentField = nextField;
            this._renderPanel();
        } else {
            this._closeDropdown();
            this.emit('datePicker:change', { value: dateTimeValueToDate(this._dateValue!) });
        }
    }

    _onPrevField(): void {
        const idx = FIELD_ORDER.indexOf(this._currentField!);
        if (idx > 0) {
            this._switchPanel(FIELD_ORDER[idx - 1]);
        }
    }

    _onNextField(): void {
        const idx = FIELD_ORDER.indexOf(this._currentField!);
        if (idx < FIELD_ORDER.length - 1) {
            this._switchPanel(FIELD_ORDER[idx + 1]);
        }
    }

    _onConfirm(value?: DateTimeValue): void {
        if (value) {
            this._dateValue = fixDateTime(value);
        }
        this._syncDisplayValue();
        this._closeDropdown();
        this.emit('datePicker:change', { value: dateTimeValueToDate(this._dateValue!) });
    }

    _onCancel(): void {
        this._dateValue = { ...this._originalValue! };
        this._syncDisplayValue();
        this._closeDropdown();
    }

    _syncDisplayValue(): void {
        const fieldEl = this.field;
        if (!fieldEl) return;
        const text = formatPreview(this._dateValue!, this._showSeconds);
        fieldEl.value = text;
        this._value = text;
    }

    getEventData(_nodeName: string, _eventName: string, _eventType: string): Record<string, any> {
        return { value: this._dateValue ? dateTimeValueToDate(this._dateValue) : null };
    }

    get dateValue(): Date | null {
        return this._dateValue ? dateTimeValueToDate(this._dateValue) : null;
    }
    set dateValue(v: Date | null) {
        if (v) {
            this._dateValue = createDateTimeValue(v);
        } else {
            this._dateValue = null;
        }
        this._syncDisplayValue();
    }

    get showSeconds(): boolean {
        return this._showSeconds;
    }
    set showSeconds(v: boolean) {
        this._showSeconds = v;
        this._syncDisplayValue();
    }

    getFormValue(): any {
        return this._dateValue ? dateTimeValueToDate(this._dateValue) : null;
    }

    setFormValue(v: any): void {
        if (v instanceof Date) {
            this.dateValue = v;
        } else if (v) {
            this.dateValue = new Date(v);
        } else {
            this.dateValue = null;
        }
    }

    formReset(defaultValue?: any): void {
        this.dateValue = defaultValue ?? null;
        this.error = '';
    }

    update(props?: Partial<DatePickerProps>): void {
        super.update(props);

        if (props?.value !== undefined) this.dateValue = props.value;
        if (props?.showSeconds !== undefined) this.showSeconds = props.showSeconds;
    }
}

DatePickerComponent.register();
export { DatePickerComponent };
export type DatePickerComponentInstance = InstanceType<typeof DatePickerComponent>;
