/**
 * DatePickerComponent 日期时间选择器
 *
 * 从 InputComponent 派生，共享统一模板（继承父类模板，无需 useTemplate）。
 * 下拉图标按需 add 进 fieldBody（order 排序，无预留槽位）。
 * 支持手动输入（输入掩码自动格式化）和面板选择两种方式。
 *
 * 使用 DateTimePanelComponent 作为下拉面板，面板切换逻辑内聚在 DateTimePanel 内部。
 * type='date'：纯日期选择（默认）
 * type='datetime'：日期+时间选择
 * type='time'：纯时间选择
 *
 * 事件：datePicker:change / datePicker:open / datePicker:close
 *
 * @example
 * ```ts
 * new DatePickerComponent({ type: 'datetime', showSeconds: true })
 * picker.on('datePicker:change', ({ value }) => { ... })
 * ```
 */

import { InputComponent } from './InputComponent';
import { DateTimePanelComponent } from '../date/DateTimePanelComponent';
import { Definitions } from '@/composable';
import { IconComponent } from '../icon/IconComponent';
import { DROPDOWN_ICON_ORDER, FIELD_ACTION } from './constants';
import './datepicker.css';
import {
    createDateTimeValue,
    dateTimeValueToDate,
    fixDateTime,
    type DateTimeValue,
} from '@/utils/date';

const DatePickerComponentDefs: Definitions = {
    options: {
        placeholder: null,
        clearable: false,
        showSeconds: true,
        startDayOfWeek: 0,
        type: 'date',
        minDate: null,
        maxDate: null,
        range: false,
    },
} as const;

class DatePickerComponent extends InputComponent {
    static type = 'date-picker';
    _dateValue: DateTimeValue | null = null;
    _originalValue: DateTimeValue | null = null;
    _dropdownOpen: boolean = false;
    _panelEl: HTMLElement | null = null;
    _panelCmp: any = null;
    _dropdownIconItem: any = null;
    _onDocumentClick: (e: MouseEvent) => void = () => {};

    onAfterInit(): void {
        super.onAfterInit();
        this.addCls('q-datepicker');

        const fieldItem = this._fieldItem;
        if (fieldItem) {
            fieldItem.inputType = null;
        }

        if (this.value) {
            this._dateValue = createDateTimeValue(new Date(this.value));
        } else {
            this._dateValue = null;
        }
        this._originalValue = this._dateValue ? { ...this._dateValue } : null;

        this._mountDropdownIcon();
        this._syncDisplayValue();
        this._applyState();
    }

    _onShowSecondsOptionChange(_value: boolean): void {
        this._syncDisplayValue();
    }

    _onTypeOptionChange(_value: string): void {
        this._syncDisplayValue();
    }

    onBeforeDispose(): void {
        this._closeDropdown();
        super.onBeforeDispose();
    }

    _mountDropdownIcon(): void {
        const fieldBodyCmp = this._getFieldBody();
        if (!fieldBodyCmp || this._dropdownIconItem) return;
        const item = fieldBodyCmp.add({
            type: IconComponent,
            iconCls: 'q-chevron-down',
            action: FIELD_ACTION.DROPDOWN_TOGGLE,
            order: DROPDOWN_ICON_ORDER,
        });
        if (item?.el) {
            item.el.classList.add('q-input__dropdown-icon');
        }
        this._dropdownIconItem = item;
    }

    onFieldItemClick(domEvt?: any): void {
        super.onFieldItemClick(domEvt);
        if (domEvt?.action === FIELD_ACTION.DROPDOWN_TOGGLE) {
            this._openDropdown();
        }
    }

    onFieldFocus(): void {
        this._focused = true;
        this._applyState();
        this._openDropdown();
    }

    onFieldInput(): void {
        const fieldItem = this._fieldItem;
        if (!fieldItem) return;
        const raw = fieldItem.value;
        const formatted = this._applyInputMask(raw);
        if (formatted !== raw) {
            fieldItem.value = formatted;
        }
        this._value = formatted;
        const parsed = this._parseInput(formatted);
        if (parsed) {
            this._dateValue = fixDateTime(parsed);
            if (this._panelCmp) {
                this._panelCmp.update({ value: this._dateValue });
            }
        }
    }

    onFieldBlur(): void {
        this._focused = false;
        this._applyState();
        const fieldItem = this._fieldItem;
        if (!fieldItem) return;
        const text = fieldItem.value;
        const parsed = this._parseInput(text);
        if (parsed) {
            this._dateValue = fixDateTime(parsed);
            this._syncDisplayValue();
            this.emit('datePicker:change', { value: dateTimeValueToDate(this._dateValue!) });
        } else if (text.trim() === '') {
            this._dateValue = null;
            this._syncDisplayValue();
            this.emit('datePicker:change', { value: null });
        } else {
            this._syncDisplayValue();
        }
    }

    _applyInputMask(raw: string): string {
        const digits = raw.replace(/\D/g, '');
        const type = this.getData('type') ?? 'date';
        const showSeconds = this.getData('showSeconds') ?? true;
        if (type === 'date') {
            return this._formatDateDigits(digits);
        }
        if (type === 'time') {
            return this._formatTimeDigits(digits, showSeconds);
        }
        const dateDigits = digits.slice(0, 8);
        const timeDigits = digits.slice(8);
        let result = this._formatDateDigits(dateDigits);
        if (timeDigits.length > 0) {
            result += ' ' + this._formatTimeDigits(timeDigits, showSeconds);
        }
        return result;
    }

    _formatDateDigits(digits: string): string {
        if (digits.length <= 4) return digits;
        if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
        return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
    }

    _formatTimeDigits(digits: string, showSeconds: boolean): string {
        if (digits.length <= 2) return digits;
        if (digits.length <= 4) return `${digits.slice(0, 2)}:${digits.slice(2)}`;
        if (showSeconds) return `${digits.slice(0, 2)}:${digits.slice(2, 4)}:${digits.slice(4, 6)}`;
        return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
    }

    _parseInput(text: string): DateTimeValue | null {
        const type = this.getData('type') ?? 'date';
        const showSeconds = this.getData('showSeconds') ?? true;
        if (type === 'date') {
            const m = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
            if (!m) return null;
            const year = +m[1], month = +m[2], day = +m[3];
            if (month < 1 || month > 12 || day < 1 || day > 31) return null;
            return { year, month, day, hour: 0, minute: 0, second: 0 };
        }
        if (type === 'time') {
            const re = showSeconds ? /^(\d{2}):(\d{2}):(\d{2})$/ : /^(\d{2}):(\d{2})$/;
            const m = text.match(re);
            if (!m) return null;
            const hour = +m[1], minute = +m[2], second = showSeconds ? +m[3] : 0;
            if (hour > 23 || minute > 59 || second > 59) return null;
            const now = new Date();
            return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate(), hour, minute, second };
        }
        const re = showSeconds ? /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/ : /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/;
        const m = text.match(re);
        if (!m) return null;
        const year = +m[1], month = +m[2], day = +m[3], hour = +m[4], minute = +m[5], second = showSeconds ? +m[6] : 0;
        if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59 || second > 59) return null;
        return { year, month, day, hour, minute, second };
    }

    _openDropdown(): void {
        if (this._dropdownOpen) return;

        this._dropdownOpen = true;
        this._originalValue = this._dateValue ? { ...this._dateValue } : null;
        this.toggleCls('q-datepicker--open', true);

        this._renderPanel();
        this.emit('datePicker:open', {});

        this._onDocumentClick = (e: MouseEvent): void => {
            const el = this.el;
            if (el && !el.contains(e.target as Node)) {
                this._closeDropdown();
            }
        };
        setTimeout(() => {
            document.addEventListener('click', this._onDocumentClick);
        }, 0);
    }

    _closeDropdown(): void {
        if (!this._dropdownOpen) return;
        this._dropdownOpen = false;
        this.toggleCls('q-datepicker--open', false);
        document.removeEventListener('click', this._onDocumentClick);

        if (this._panelCmp) {
            this._panelCmp.el?.remove();
            this._panelCmp = null;
        }
        if (this._panelEl) {
            this._panelEl.remove();
            this._panelEl = null;
        }

        this.emit('datePicker:close', {});
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

        const type = this.getData('type') ?? 'date';
        const panelCmp = new DateTimePanelComponent({
            value: this._dateValue,
            type,
            showPrevField: false,
            showConfirm: type !== 'date',
            showCancel: type !== 'date',
            showSeconds: this.getData('showSeconds') ?? true,
            minDate: this.getData('minDate'),
            maxDate: this.getData('maxDate'),
            range: this.getData('range'),
            startDayOfWeek: this.getData('startDayOfWeek'),
        });

        panelCmp.on('change', (ctx: any) => {
            this._dateValue = fixDateTime(ctx.data.value);
            this._syncDisplayValue();
            if (type === 'date') {
                const isRange = this.getData('range');
                const rangeComplete = ctx.data.rangeStart && ctx.data.rangeEnd;
                if (!isRange || rangeComplete) {
                    this._closeDropdown();
                    const eventData: any = { value: dateTimeValueToDate(this._dateValue!) };
                    if (ctx.data.rangeStart) eventData.rangeStart = ctx.data.rangeStart;
                    if (ctx.data.rangeEnd) eventData.rangeEnd = ctx.data.rangeEnd;
                    this.emit('datePicker:change', eventData);
                }
            }
        });
        panelCmp.on('confirm', (ctx: any) => {
            this._dateValue = fixDateTime(ctx.data.value);
            this._syncDisplayValue();
            this._closeDropdown();
            const eventData: any = { value: dateTimeValueToDate(this._dateValue!) };
            if (ctx.data.rangeStart) eventData.rangeStart = ctx.data.rangeStart;
            if (ctx.data.rangeEnd) eventData.rangeEnd = ctx.data.rangeEnd;
            this.emit('datePicker:change', eventData);
        });
        panelCmp.on('cancel', () => this._onCancel());

        if (panelCmp.el) {
            container.appendChild(panelCmp.el);
        }
        this._panelEl = container;
        this._panelCmp = panelCmp;

        const wrapperEl = this.getNodeEl('fieldBody');
        if (wrapperEl) {
            wrapperEl.appendChild(container);
        }
    }

    _onCancel(): void {
        this._dateValue = this._originalValue ? { ...this._originalValue } : null;
        this._syncDisplayValue();
        this._closeDropdown();
    }

    onClearBtnClick(): void {
        this._dateValue = null;
        this._syncDisplayValue();
        this.emit('datePicker:change', { value: null });
        this._toggleClearBtn();
        this._fieldItem?.focus();
    }

    _syncDisplayValue(): void {
        const fieldItem = this._fieldItem;
        if (!fieldItem) return;
        const type = this.getData('type') ?? 'date';
        const text = this._formatValue(type);
        fieldItem.value = text;
        this._value = text;
    }

    _formatValue(type: string): string {
        if (!this._dateValue) return '';
        const v = this._dateValue;
        const y = String(v.year).padStart(4, '0');
        const m = String(v.month).padStart(2, '0');
        const d = String(v.day).padStart(2, '0');
        const h = String(v.hour).padStart(2, '0');
        const min = String(v.minute).padStart(2, '0');
        const sec = String(v.second ?? 0).padStart(2, '0');
        const showSeconds = this.getData('showSeconds') ?? true;

        if (type === 'date') {
            return `${y}-${m}-${d}`;
        }
        if (type === 'time') {
            return showSeconds ? `${h}:${min}:${sec}` : `${h}:${min}`;
        }
        const time = showSeconds ? `${h}:${min}:${sec}` : `${h}:${min}`;
        return `${y}-${m}-${d} ${time}`;
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

    update(props?: Record<string, any>): void {
        super.update(props);

        if (props?.value !== undefined) this.dateValue = props.value;
    }
}

DatePickerComponent.define(DatePickerComponentDefs);

export { DatePickerComponent };
export type DatePickerComponentInstance = InstanceType<typeof DatePickerComponent>;
