/**
 * SelectComponent 下拉选择组件
 *
 * 从 InputComponent 派生，共享统一模板。
 * 下拉弹出复用 PopoverAbility（popover option → ListComponent 浮层），
 * 选项渲染用 ListItemComponent（label/status/markForm），
 * 选中值通过 action/actionData 传递（ComponentDefs 通用 option）。
 *
 * 特有功能：
 * - options 选项列表（静态 / 动态加载）
 * - 下拉面板（PopoverAbility + ListComponent）
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
            this._selectedValue = Array.isArray(value) ? value : value ? [value] : undefined;
        } else {
            this._selectedValue = value || undefined;
        }
        this._syncDisplayValue();
        this._toggleClearBtn();
        this._updatePopoverItems();
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
            type: 'list',
            trigger: 'manual',
            anchor: 'fieldBody',
            placement: 'bottom',
            options: {
                items: this._buildListItems(),
                classes: 'q-select-panel',
                offset: 0,
                align: 'start',
            },
        });
    }

    _buildListItems(): any[] {
        const opts = this.options as SelectOption[];
        if (!opts || !opts.length) return [];

        const items: any[] = [];
        const seenGroups = new Set<string>();

        for (const opt of opts) {
            if (opt.group && !seenGroups.has(opt.group)) {
                seenGroups.add(opt.group);
                items.push({
                    label: opt.group,
                    disable: true,
                    classes: 'q-list__group-title',
                });
            }

            items.push({
                label: opt.label,
                action: 'select-option',
                actionData: opt.value,
                status: this._isSelected(opt.value) ? 'primary' : 'default',
                disable: opt.disabled,
            });
        }
        return items;
    }

    _updatePopoverItems(): void {
        const inst = this._getPopoverInstance();
        if (inst) {
            inst.setItems(this._buildListItems());
        } else {
            this.updatePopover({ items: this._buildListItems() });
        }
    }

    showPopover(): void {
        super.showPopover();
        const inst = this._getPopoverInstance();
        if (inst) {
            inst.addCls('q-select-panel');
            const fieldBody = this.getNodeEl('fieldBody');
            if (fieldBody) {
                inst.ready.then(() => {
                    inst.el?.style.setProperty('min-width', `${fieldBody.offsetWidth}px`);
                });
            }
            if (!this._selectBound) {
                this._selectBound = true;
                inst.on('select', (ctx: any) => {
                    this._onListSelect(ctx);
                });
            }
        }
        this.emit('select:open', {});
    }

    hidePopover(): void {
        super.hidePopover();
        this.emit('select:close', {});
    }

    _onListSelect(ctx: any): void {
        const domEvt = ctx?.domEvent ?? ctx;
        const action = domEvt?.action;
        if (action !== 'select-option') return;

        const value = this._parseValue(domEvt.actionData);
        if (this.multiple) {
            const arr = Array.isArray(this._selectedValue) ? [...this._selectedValue] : [];
            const idx = arr.indexOf(value);
            if (idx >= 0) {
                arr.splice(idx, 1);
            } else {
                arr.push(value);
            }
            this._selectedValue = arr.length ? arr : undefined;
            this._syncDisplayValue();
            this._updatePopoverItems();
        } else {
            this._selectedValue = value;
            this._syncDisplayValue();
            this.hidePopover();
        }

        this.emit('select:change', { value: this._selectedValue });
        if (this._shouldValidate('change')) this._doValidate();
    }

    _parseValue(raw: any): string | number {
        if (typeof raw === 'number') return raw;
        const num = Number(raw);
        return Number.isNaN(num) ? raw : num;
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
        this._updatePopoverItems();
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
        this._updatePopoverItems();
    }

    getFormValue(): any {
        return this._selectedValue;
    }

    setFormValue(v: any): void {
        this._selectedValue = v;
        this._syncDisplayValue();
        this._updatePopoverItems();
    }

    formReset(defaultValue?: any): void {
        this._selectedValue = defaultValue ?? undefined;
        this._syncDisplayValue();
        this._updatePopoverItems();
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
