/**
 * SelectComponent 下拉选择组件
 *
 * 从 InputComponent 派生，共享统一模板。
 * 下拉弹出复用 PopoverAbility（popover option → MenuComponent 浮层），
 * 选项渲染复用 MenuItemComponent（group/groupMode/checked 选中态管理）。
 *
 * 特有功能：
 * - options 选项列表（静态 / 动态加载）
 * - 下拉面板（PopoverAbility + MenuComponent）
 * - 多选（multiple）
 * - 分组（opt.group 视觉分组标题）
 * - 选中值显示
 *
 * 事件：select:change / select:open / select:close。
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
    },
} as const;

class SelectComponent extends InputComponent {
    static type = 'select';
    _selectedValue: string | number | (string | number)[] | undefined = undefined;
    _dropdownIconItem: any = null;
    _selectBound: boolean = false;

    onAfterInit(): void {
        super.onAfterInit();
        this.addCls('q-select');

        const fieldItem = this._fieldItem;
        if (fieldItem) {
            fieldItem.readonly = true;
            fieldItem.inputType = null;
        }

        this._mountDropdownIcon();
        this._buildPopover();
        this._applyState();
    }

    _onValueOptionChange(value: any): void {
        if (this.multiple) {
            this._selectedValue = Array.isArray(value) ? value : (value ? [value] : undefined);
        } else {
            this._selectedValue = value || undefined;
        }
        this._syncDisplayValue();
        this._toggleClearBtn();
        this._updatePopoverChecked();
    }

    _onOptionsOptionChange(_value: SelectOption[]): void {
        this._updatePopoverItems();
    }

    _onMultipleOptionChange(_value: boolean): void {
        this._updatePopoverItems();
    }

    onBeforeDispose(): void {
        this.hidePopover();
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

    _buildPopover(): void {
        this.setData('popover', {
            type: 'menu',
            trigger: 'manual',
            anchor: 'fieldBody',
            placement: 'bottom',
            options: { items: this._buildMenuItems() },
        });
    }

    _buildMenuItems(): any[] {
        const opts = this.options as SelectOption[];
        if (!opts || !opts.length) return [];

        const groupMode = this.multiple ? 'checkbox' : 'radio';
        const items: any[] = [];
        const seenGroups = new Set<string>();

        for (const opt of opts) {
            if (opt.group && !seenGroups.has(opt.group)) {
                seenGroups.add(opt.group);
                items.push({
                    type: 'menu-item',
                    text: opt.group,
                    disabled: true,
                    action: 'select-group-title',
                });
            }
            items.push({
                type: 'menu-item',
                text: opt.label,
                group: 'select',
                groupMode,
                checked: this._isSelected(opt.value),
                action: 'select-option',
                actionData: opt.value,
                disabled: opt.disabled,
            });
        }
        return items;
    }

    _updatePopoverItems(): void {
        const inst = this._getPopoverInstance();
        if (inst) {
            inst.setItems(this._buildMenuItems());
        } else {
            this.updatePopover({ items: this._buildMenuItems() });
        }
    }

    _updatePopoverChecked(): void {
        const inst = this._getPopoverInstance();
        if (!inst) return;
        for (const item of inst.items ?? []) {
            const value = item.getData?.('actionData');
            if (value !== undefined) {
                item.checked = this._isSelected(value);
            }
        }
    }

    showPopover(): void {
        super.showPopover();
        const inst = this._getPopoverInstance();
        if (inst && !this._selectBound) {
            this._selectBound = true;
            inst.on('select', (data: any) => {
                this._onMenuSelect(data);
            });
        }
        this.emit('select:open', {});
    }

    hidePopover(): void {
        super.hidePopover();
        this.emit('select:close', {});
    }

    _onMenuSelect(data: any): void {
        const inst = this._getPopoverInstance();
        if (!inst) return;

        const checkedItems = (inst.items ?? []).filter((item: any) => item.checked);
        if (this.multiple) {
            this._selectedValue = checkedItems
                .map((item: any) => item.getData?.('actionData'))
                .filter((v: any) => v !== undefined);
            this._syncDisplayValue();
            this.showPopover();
        } else {
            const checkedItem = checkedItems[0];
            this._selectedValue = checkedItem?.getData?.('actionData');
            this._syncDisplayValue();
            this.hidePopover();
        }

        this.emit('select:change', { value: this._selectedValue });
        if (this._shouldValidate('change')) this._doValidate();
    }

    onFieldFocus(): void {
        this._focused = true;
        this._applyState();
        if (!this._getPopoverInstance()?.isOpen) {
            this.showPopover();
        }
    }

    onFieldBlur(): void {
        this._focused = false;
        this._applyState();
        this.hidePopover();
        if (this._shouldValidate('blur')) this._doValidate();
    }

    onFieldItemClick(domEvt?: any): void {
        super.onFieldItemClick(domEvt);
        if (domEvt?.action === FIELD_ACTION.DROPDOWN_TOGGLE) {
            this.togglePopover();
        }
    }

    onClearBtnClick(): void {
        this._selectedValue = undefined;
        this._syncDisplayValue();
        this._updatePopoverChecked();
        this.emit('select:change', { value: undefined });
        this._toggleClearBtn();
        this._fieldItem?.focus();
    }

    _isSelected(value: string | number): boolean {
        if (this.multiple && Array.isArray(this._selectedValue)) {
            return this._selectedValue.includes(value);
        }
        return this._selectedValue === value;
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
        this._updatePopoverChecked();
    }

    getFormValue(): any {
        return this._selectedValue;
    }

    setFormValue(v: any): void {
        this._selectedValue = v;
        this._syncDisplayValue();
        this._updatePopoverChecked();
    }

    formReset(defaultValue?: any): void {
        this._selectedValue = defaultValue ?? undefined;
        this._syncDisplayValue();
        this._updatePopoverChecked();
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
