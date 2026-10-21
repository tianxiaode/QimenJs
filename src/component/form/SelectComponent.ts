/**
 * SelectComponent 下拉选择组件
 *
 * 从 InputComponent 派生，共享统一模板（继承父类模板，无需 useTemplate）。
 * 下拉箭头图标按需 add 进 fieldBody（order 排序，无预留槽位）。
 * field 设为 readonly，通过下拉面板选择值。
 *
 * 特有功能：
 * - options 选项列表（静态 / 动态加载）
 * - 下拉面板（通过 OverlayEventBus 管理浮层）
 * - 可搜索（filterable）
 * - 多选（multiple）
 * - 选中值显示
 *
 * 事件：select:change / select:open / select:close / select:search。
 *
 * @example
 * ```ts
 * new SelectComponent({
 *     options: [
 *         { label: '选项1', value: '1' },
 *         { label: '选项2', value: '2' },
 *     ],
 *     value: '1',
 * })
 * select.on('select:change', ({ value }) => { ... })
 * ```
 */

import { InputComponent } from './InputComponent';
import { Definitions } from '@/composable';
import { IconComponent } from '../icon/IconComponent';
import { DROPDOWN_ICON_ORDER, FIELD_ACTION } from './constants';
import './select.css';

export interface SelectOption {
    label: string;
    value: string | number;
    disabled?: boolean;
    group?: string;
}

const SelectComponentDefs: Definitions = {
    options: {
        placeholder: null,
        clearable: false,
        options: [],
        multiple: false,
        filterable: false,
    },
} as const;

class SelectComponent extends InputComponent {
    static type = 'select';
    _selectedValue: string | number | (string | number)[] | undefined = undefined;
    _dropdownOpen: boolean = false;
    _dropdownIconItem: any = null;
    _panelItem: any = null;
    _offOverlay: (() => void) | null = null;

    onAfterInit(): void {
        super.onAfterInit();
        this.addCls('q-select');

        const fieldItem = this._fieldItem;

        if (fieldItem) {
            fieldItem.readonly = true;
            fieldItem.inputType = null;
            if (this.filterable) fieldItem.readonly = false;
        }

        this._mountDropdownIcon();

        this._applyState();
    }

    _onOptionsOptionChange(_value: SelectOption[]): void {
        if (this._dropdownOpen) this._renderPanel();
    }

    _onFilterableOptionChange(value: boolean): void {
        const fieldItem = this._fieldItem;
        if (fieldItem) fieldItem.readonly = !value;
    }

    onBeforeDispose(): void {
        this._closeDropdown();
        if (this._offOverlay) {
            this._offOverlay();
            this._offOverlay = null;
        }
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

    onFieldFocus(): void {
        this._focused = true;
        this._applyState();
        this._openDropdown();
    }

    onFieldBlur(): void {
        this._focused = false;
        this._applyState();
        this._closeDropdown();
        if (this._shouldValidate('blur')) this._doValidate();
    }

    onFieldInput(): void {
        if (!this._filterable) return;
        this._value = this.field?.value ?? '';
        this.emit('select:search', { query: this._value });
    }

    _openDropdown(): void {
        if (this._dropdownOpen) return;
        this._dropdownOpen = true;
        this.toggleCls('q-select--open', true);

        this._renderPanel();

        this.emit('select:open', {});
    }

    _closeDropdown(): void {
        if (!this._dropdownOpen) return;
        this._dropdownOpen = false;
        this.toggleCls('q-select--open', false);

        this._removePanel();

        this.emit('select:close', {});
    }

    /** 下拉面板作为 fieldBody item（action=panel），option 挂 children，经 fieldBody.[items] 委托分发 */
    _renderPanel(): void {
        this._removePanel();

        const fieldBodyCmp = this.getComponent('fieldBody') as any;
        if (!fieldBodyCmp) return;

        const filteredOptions = this._getFilteredOptions();
        const children: any[] = filteredOptions.map((opt: SelectOption) => {
            const selected = this._isSelected(opt.value);
            const cls = ['q-select__option'];
            if (selected) cls.push('q-select__option--selected');
            if (opt.disabled) cls.push('q-select__option--disabled');
            return {
                tag: 'div',
                classes: cls.join(' '),
                options: { text: opt.label },
                attributes: { 'data-value': String(opt.value) },
            };
        });
        if (children.length === 0) {
            children.push({ tag: 'div', classes: 'q-select__empty', options: { text: '无匹配项' } });
        }

        this._panelItem = fieldBodyCmp.add({
            tag: 'div',
            classes: 'q-select__panel',
            action: FIELD_ACTION.SELECT_PANEL,
            children,
        });
    }

    _removePanel(): void {
        if (!this._panelItem) return;
        const fieldBodyCmp = this.getComponent('fieldBody') as any;
        if (fieldBodyCmp) {
            const idx = fieldBodyCmp.items?.indexOf(this._panelItem) ?? -1;
            if (idx >= 0) fieldBodyCmp.removeAt(idx);
        }
        this._panelItem = null;
    }

    _getFilteredOptions(): SelectOption[] {
        if (!this.filterable || !this._value) return this.options;
        const query = this._value.toLowerCase();
        return (this.options as SelectOption[]).filter((opt: SelectOption) =>
            opt.label.toLowerCase().includes(query)
        );
    }

    _isSelected(value: string | number): boolean {
        if (this.multiple && Array.isArray(this._selectedValue)) {
            return this._selectedValue.includes(value);
        }
        return this._selectedValue === value;
    }

    /** 下拉面板 option 点击分发（super 保持 clear 分发） */
    onFieldItemClick(domEvt?: any): void {
        super.onFieldItemClick(domEvt);
        if (domEvt?.action === FIELD_ACTION.DROPDOWN_TOGGLE) {
            if (this._dropdownOpen) {
                this._closeDropdown();
            } else {
                this._openDropdown();
            }
            return;
        }
        if (domEvt?.action !== FIELD_ACTION.SELECT_PANEL) return;
        const target = domEvt?.data?.originalEvent?.target as Element | undefined;
        if (!target) return;
        const optionEl = target.closest('.q-select__option') as HTMLElement | null;
        if (!optionEl || !this._panelItem?.el?.contains(optionEl)) return;
        if (optionEl.classList.contains('q-select__option--disabled')) return;
        const value = optionEl.dataset.value;
        const opt = (this.options as SelectOption[]).find(o => String(o.value) === value);
        if (opt) this._onOptionClick(opt);
    }

    _onOptionClick(opt: SelectOption): void {
        if (this.multiple) {
            const arr = Array.isArray(this._selectedValue)
                ? [...this._selectedValue]
                : this._selectedValue !== undefined
                  ? [this._selectedValue]
                  : [];
            const idx = arr.indexOf(opt.value);
            if (idx >= 0) {
                arr.splice(idx, 1);
            } else {
                arr.push(opt.value);
            }
            this._selectedValue = arr;
        } else {
            this._selectedValue = opt.value;
            this._closeDropdown();
        }

        this._syncDisplayValue();
        this.emit('select:change', { value: this._selectedValue, option: opt });
        if (this._shouldValidate('change')) this._doValidate();
    }

    onClearBtnClick(): void {
        this._selectedValue = undefined;
        this._syncDisplayValue();
        this.emit('select:change', { value: undefined });
        this._toggleClearBtn();
        this._fieldItem?.focus();
    }

    _syncDisplayValue(): void {
        const fieldItem = this._fieldItem;
        if (!fieldItem) return;

        if (this.multiple && Array.isArray(this._selectedValue)) {
            const labels = (this._selectedValue as (string | number)[]).map(
                (v: string | number) => {
                    const opt = (this.options as SelectOption[]).find(
                        (o: SelectOption) => o.value === v
                    );
                    return opt?.label ?? String(v);
                }
            );
            fieldItem.value = labels.join(', ');
        } else if (this._selectedValue !== undefined) {
            const opt = (this.options as SelectOption[]).find(
                (o: SelectOption) => o.value === this._selectedValue
            );
            fieldItem.value = opt?.label ?? String(this._selectedValue);
        } else {
            fieldItem.value = '';
        }
        this._value = fieldItem.value;
    }

    getEventData(_nodeName: string, _eventName: string, _eventType: string): Record<string, any> {
        return { value: this._selectedValue };
    }

    get selectedValue(): string | number | (string | number)[] | undefined {
        return this._selectedValue;
    }
    set selectedValue(v: string | number | (string | number)[] | undefined) {
        this._selectedValue = v;
        this._syncDisplayValue();
    }

    getFormValue(): any {
        return this._selectedValue;
    }

    setFormValue(v: any): void {
        this._selectedValue = v;
        this._syncDisplayValue();
    }

    formReset(defaultValue?: any): void {
        this._selectedValue = defaultValue ?? undefined;
        this._syncDisplayValue();
        this.error = '';
    }

    update(props?: Record<string, any>): void {
        super.update(props);

        if (props?.value !== undefined) this.selectedValue = props.value;
    }
}

SelectComponent.define(SelectComponentDefs);

export { SelectComponent };
export type SelectComponentInstance = InstanceType<typeof SelectComponent>;
