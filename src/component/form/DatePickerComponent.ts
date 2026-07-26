/**
 * DatePickerComponent 日期时间选择器
 *
 * 基于 InputComponent 通过 .replace() 派生，共享统一模板。
 * InputFieldBody 已预留 dropdownIcon 节点，DatePicker 开启该节点。
 * field 设为 readonly，通过下拉面板选择值。
 *
 * 预览栏显示完整日期时间，单击字段进入对应面板，选完自动流转。
 * 导航栏三按钮：← 返回（放弃修改）| ↶ 上一步 | 确认 ✓（保存+结束流转）
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
} from '@/utils/date/datetime-picker';
import './datepicker.css';

export interface DatePickerProps extends Omit<InputProps, 'value' | 'type'> {
    value?: Date;
    showSeconds?: boolean;
    startDayOfWeek?: number;
}

const FIELD_ORDER: DateTimeField[] = ['year', 'month', 'day', 'hour', 'minute', 'second'];

function getFieldEl(cmp: any): HTMLInputElement | null {
    return cmp.nodeMap?.field?.el as HTMLInputElement | null;
}

export const DatePickerComponent = InputComponent.replace({
    type: 'DatePicker',

    body: {
        nodes: {
            root: { addCls: 'q-datepicker' },
        },

        onInitState() {
            const self = this as any;
            const state = self._super.onInitState();
            return {
                ...state,
                _dateValue: null as DateTimeValue | null,
                _originalValue: null as DateTimeValue | null,
                _showSeconds: true,
                _startDayOfWeek: 0,
                _dropdownOpen: false,
                _currentField: null as DateTimeField | null,
                _flowQueue: [] as DateTimeField[],
                _panelEl: null as HTMLElement | null,
                _panelCmp: null as any,
                _previewEl: null as HTMLElement | null,
            };
        },

        onAfterInit(props?: DatePickerProps): void {
            const self = this as any;
            const fieldEl = getFieldEl(self);

            if (fieldEl) {
                fieldEl.setAttribute('readonly', 'true');
                fieldEl.removeAttribute('type');
            }

            self._showSeconds = props?.showSeconds ?? true;
            self._startDayOfWeek = props?.startDayOfWeek ?? 0;

            const date = props?.value ?? new Date();
            self._dateValue = createDateTimeValue(date);
            self._originalValue = { ...self._dateValue };

            self._mountDropdownIcon();
            self._syncDisplayValue();
            self._applyState();
        },

        onBeforeDispose(): void {
            const self = this as any;
            self._closeDropdown();
        },

        _mountDropdownIcon(): void {
            const self = this as any;
            self.setNodeHidden(false, 'dropdownIcon');
            const dropdownEl = self.nodeMap?.dropdownIcon?.el as HTMLElement | null;
            if (dropdownEl) {
                dropdownEl.textContent = '📅';
                dropdownEl.style.cursor = 'pointer';
            }
        },

        onFieldFocus(): void {
            const self = this as any;
            self._focused = true;
            self._applyState();
            self._openDropdown('year');
        },

        onFieldBlur(): void {
            const self = this as any;
            self._focused = false;
            self._applyState();
        },

        _openDropdown(entryField: DateTimeField): void {
            const self = this as any;
            if (self._dropdownOpen) {
                self._switchPanel(entryField);
                return;
            }

            self._dropdownOpen = true;
            self._originalValue = { ...self._dateValue };
            self.toggleCls('q-datepicker--open', true);

            self._flowQueue = getFlowFromEntry(entryField, self._showSeconds);
            self._currentField = entryField;

            self._renderPanel();
            self.emit('datePicker:open', {});
        },

        _closeDropdown(): void {
            const self = this as any;
            if (!self._dropdownOpen) return;
            self._dropdownOpen = false;
            self.toggleCls('q-datepicker--open', false);

            if (self._panelCmp) {
                self._panelCmp.el?.remove();
                self._panelCmp = null;
            }
            if (self._panelEl) {
                self._panelEl.remove();
                self._panelEl = null;
            }
            if (self._previewEl) {
                self._previewEl.remove();
                self._previewEl = null;
            }

            self._currentField = null;
            self._flowQueue = [];
            self.emit('datePicker:close', {});
        },

        _switchPanel(field: DateTimeField): void {
            const self = this as any;
            self._flowQueue = getFlowFromEntry(field, self._showSeconds);
            self._currentField = field;
            self._renderPanel();
        },

        _renderPanel(): void {
            const self = this as any;

            if (self._panelCmp) {
                self._panelCmp.el?.remove();
                self._panelCmp = null;
            }
            if (self._panelEl) {
                self._panelEl.remove();
                self._panelEl = null;
            }
            if (self._previewEl) {
                self._previewEl.remove();
                self._previewEl = null;
            }

            const container = document.createElement('div');
            container.className = 'q-datepicker__dropdown';

            self._renderPreview(container);

            const panelContainer = document.createElement('div');
            panelContainer.className = 'q-datepicker__panel-area';

            const field = self._currentField;
            const value = self._dateValue;
            const flowIdx = FIELD_ORDER.indexOf(field);
            const showPrev = flowIdx > 0;

            let panelCmp: any = null;

            switch (field) {
                case 'year':
                    panelCmp = new YearPanelComponent({ value, showPrev });
                    panelCmp.on('yearSelect', (data: any) => self._onAutoNext(data.value));
                    break;
                case 'month':
                    panelCmp = new MonthPanelComponent({ value, showPrev });
                    panelCmp.on('monthSelect', (data: any) => self._onAutoNext(data.value));
                    break;
                case 'day':
                    panelCmp = new DatePanelComponent({ value });
                    panelCmp.on('daySelect', (data: any) => self._onAutoNext(data.value));
                    panelCmp.on('navigate', (_data: any) => self._switchPanel('month'));
                    break;
                case 'hour':
                    panelCmp = new HourPanelComponent({ value, showPrev });
                    panelCmp.on('hourSelect', (data: any) => self._onAutoNext(data.value));
                    break;
                case 'minute':
                    panelCmp = new MinutePanelComponent({ value, showPrev });
                    panelCmp.on('minuteSelect', (data: any) => self._onAutoNext(data.value));
                    break;
                case 'second':
                    panelCmp = new SecondPanelComponent({ value, showPrev });
                    panelCmp.on('secondSelect', (data: any) => self._onAutoNext(data.value));
                    break;
            }

            if (panelCmp) {
                panelCmp.on('back', () => self._onBack());
                panelCmp.on('prev', () => self._onPrev());
                panelCmp.on('confirm', (data: any) => self._onConfirm(data.value));
                panelContainer.appendChild(panelCmp.el);
                self._panelCmp = panelCmp;
            }

            container.appendChild(panelContainer);
            self._panelEl = container;

            const wrapperEl = self.nodeMap?.fieldBody?.el as HTMLElement | null;
            if (wrapperEl) {
                wrapperEl.appendChild(container);
            }
        },

        _renderPreview(container: HTMLElement): void {
            const self = this as any;
            const preview = document.createElement('div');
            preview.className = 'q-dtpanel__preview';

            const value = self._dateValue;
            const fields: { key: DateTimeField; text: string }[] = [
                { key: 'year', text: String(value.year).padStart(4, '0') },
                { key: 'month', text: String(value.month).padStart(2, '0') },
                { key: 'day', text: String(value.day).padStart(2, '0') },
                { key: 'hour', text: String(value.hour).padStart(2, '0') },
                { key: 'minute', text: String(value.minute).padStart(2, '0') },
            ];
            if (self._showSeconds) {
                fields.push({ key: 'second', text: String(value.second).padStart(2, '0') });
            }

            const separators: Record<string, string> = {
                year: '年',
                month: '月',
                day: '日',
                hour: ':',
                minute: ':',
            };

            for (let i = 0; i < fields.length; i++) {
                const f = fields[i];
                const span = document.createElement('span');
                span.className = 'q-dtpanel__preview-field';
                if (self._currentField === f.key) {
                    span.classList.add('q-dtpanel__preview-field--active');
                }
                span.textContent = f.text;
                span.addEventListener('click', e => {
                    e.stopPropagation();
                    self._switchPanel(f.key);
                });
                preview.appendChild(span);

                const sep = separators[f.key];
                if (sep) {
                    const sepSpan = document.createElement('span');
                    sepSpan.className = 'q-dtpanel__preview-sep';
                    sepSpan.textContent = sep;
                    preview.appendChild(sepSpan);
                }
            }

            container.appendChild(preview);
            self._previewEl = preview;
        },

        _onAutoNext(newValue: DateTimeValue): void {
            const self = this as any;
            const fixed = fixDateTime(newValue);
            self._dateValue = fixed;
            self._syncDisplayValue();

            const nextField = getNextField(self._currentField, self._showSeconds);
            if (nextField) {
                self._currentField = nextField;
                self._renderPanel();
            } else {
                self._closeDropdown();
                self.emit('datePicker:change', { value: dateTimeValueToDate(self._dateValue) });
            }
        },

        _onBack(): void {
            const self = this as any;
            self._dateValue = { ...self._originalValue };
            self._syncDisplayValue();
            self._closeDropdown();
        },

        _onPrev(): void {
            const self = this as any;
            const idx = FIELD_ORDER.indexOf(self._currentField);
            if (idx > 0) {
                self._switchPanel(FIELD_ORDER[idx - 1]);
            }
        },

        _onConfirm(value?: DateTimeValue): void {
            const self = this as any;
            if (value) {
                self._dateValue = fixDateTime(value);
            }
            self._syncDisplayValue();
            self._closeDropdown();
            self.emit('datePicker:change', { value: dateTimeValueToDate(self._dateValue) });
        },

        _syncDisplayValue(): void {
            const self = this as any;
            const fieldEl = getFieldEl(self);
            if (!fieldEl) return;
            const text = formatPreview(self._dateValue, self._showSeconds);
            fieldEl.value = text;
            self._value = text;
        },

        getEventData(
            _nodeName: string,
            _eventName: string,
            _eventType: string
        ): Record<string, any> {
            const self = this as any;
            return { value: self._dateValue ? dateTimeValueToDate(self._dateValue) : null };
        },

        get dateValue(): Date | null {
            const self = this as any;
            return self._dateValue ? dateTimeValueToDate(self._dateValue) : null;
        },
        set dateValue(v: Date | null) {
            const self = this as any;
            if (v) {
                self._dateValue = createDateTimeValue(v);
            } else {
                self._dateValue = null;
            }
            self._syncDisplayValue();
        },

        get showSeconds(): boolean {
            const self = this as any;
            return self._showSeconds;
        },
        set showSeconds(v: boolean) {
            const self = this as any;
            self._showSeconds = v;
            self._syncDisplayValue();
        },

        getFormValue(): any {
            const self = this as any;
            return self._dateValue ? dateTimeValueToDate(self._dateValue) : null;
        },

        setFormValue(v: any): void {
            const self = this as any;
            if (v instanceof Date) {
                self.dateValue = v;
            } else if (v) {
                self.dateValue = new Date(v);
            } else {
                self.dateValue = null;
            }
        },

        formReset(defaultValue?: any): void {
            const self = this as any;
            self.dateValue = defaultValue ?? null;
            self.error = '';
        },

        update(props?: Partial<DatePickerProps>): void {
            const self = this as any;
            self._super.update(props);

            if (props?.value !== undefined) self.dateValue = props.value;
            if (props?.showSeconds !== undefined) self.showSeconds = props.showSeconds;
        },
    },
});

export type DatePickerComponent = InstanceType<typeof DatePickerComponent>;
