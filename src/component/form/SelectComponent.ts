/**
 * SelectComponent 下拉选择组件
 *
 * 基于 InputComponent 通过 .replace() 派生，共享统一模板。
 * InputFieldBody 已预留 dropdownIcon 节点，Select 开启该节点并添加下拉箭头图标。
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

import { InputComponent, type InputProps } from './InputComponent';
import type { ValidationRule } from '@qimenjs/schema';

export interface SelectOption {
    label: string;
    value: string | number;
    disabled?: boolean;
    group?: string;
}

export interface SelectProps extends Omit<InputProps, 'value'> {
    options?: SelectOption[];
    value?: string | number | (string | number)[];
    multiple?: boolean;
    filterable?: boolean;
    placeholder?: string;
    clearable?: boolean;
}

function getFieldEl(cmp: any): HTMLInputElement | null {
    return cmp.nodeMap?.field?.el as HTMLInputElement | null;
}

const DROPDOWN_ICON_ORDER = 30;

export let SelectComponent = InputComponent.replace({
    type: 'Select',

    body: {
        nodes: {
            root: { addCls: 'q-select' },
        },

        onInitState() {
            const self = this as any;
            const state = self._super.onInitState();
            return {
                ...state,
                _options: [] as SelectOption[],
                _selectedValue: undefined as string | number | (string | number)[] | undefined,
                _multiple: false,
                _filterable: false,
                _dropdownOpen: false,
                _dropdownIconItem: null as any,
                _panelEl: null as HTMLElement | null,
                _offOverlay: null as (() => void) | null,
            };
        },

        onAfterInit(props?: SelectProps): void {
            const self = this as any;
            const fieldEl = getFieldEl(self);

            if (fieldEl) {
                fieldEl.setAttribute('readonly', 'true');
                fieldEl.removeAttribute('type');
            }

            self._options = props?.options ?? [];
            self._multiple = props?.multiple ?? false;
            self._filterable = props?.filterable ?? false;

            if (self._filterable && fieldEl) {
                fieldEl.removeAttribute('readonly');
            }

            self._mountDropdownIcon();

            if (props?.value !== undefined) {
                self._selectedValue = props.value;
                self._syncDisplayValue();
            }

            self._applyState();
        },

        onBeforeDispose(): void {
            const self = this as any;
            self._closeDropdown();
            if (self._offOverlay) {
                self._offOverlay();
                self._offOverlay = null;
            }
        },

        _mountDropdownIcon(): void {
            const self = this as any;
            self.setNodeHidden(false, 'dropdownIcon');
            const dropdownEl = self.nodeMap?.dropdownIcon?.el as HTMLElement | null;
            if (dropdownEl) {
                dropdownEl.textContent = '▼';
                dropdownEl.style.fontSize = '10px';
                dropdownEl.style.color = 'var(--q-colors-text-secondary, #666)';
                dropdownEl.style.cursor = 'pointer';
            }
        },

        onFieldFocus(): void {
            const self = this as any;
            self._focused = true;
            self._applyState();
            self._openDropdown();
        },

        onFieldBlur(): void {
            const self = this as any;
            self._focused = false;
            self._applyState();
            self._closeDropdown();
            if (self._shouldValidate('blur')) self._doValidate();
        },

        onFieldInput(): void {
            const self = this as any;
            if (!self._filterable) return;
            self._value = getFieldEl(self)?.value ?? '';
            self.emit('select:search', { query: self._value });
        },

        _openDropdown(): void {
            const self = this as any;
            if (self._dropdownOpen) return;
            self._dropdownOpen = true;
            self.toggleCls('q-select--open', true);

            self._renderPanel();

            self.emit('select:open', {});
        },

        _closeDropdown(): void {
            const self = this as any;
            if (!self._dropdownOpen) return;
            self._dropdownOpen = false;
            self.toggleCls('q-select--open', false);

            if (self._panelEl) {
                self._panelEl.remove();
                self._panelEl = null;
            }

            self.emit('select:close', {});
        },

        _renderPanel(): void {
            const self = this as any;
            if (self._panelEl) self._panelEl.remove();

            const panel = document.createElement('div');
            panel.className = 'q-select__panel';

            const filteredOptions = self._getFilteredOptions();

            for (const opt of filteredOptions) {
                const item = document.createElement('div');
                item.className = 'q-select__option';
                if (self._isSelected(opt.value)) {
                    item.classList.add('q-select__option--selected');
                }
                if (opt.disabled) {
                    item.classList.add('q-select__option--disabled');
                }
                item.textContent = opt.label;
                item.dataset.value = String(opt.value);

                if (!opt.disabled) {
                    item.addEventListener('click', () => {
                        self._onOptionClick(opt);
                    });
                }

                panel.appendChild(item);
            }

            if (filteredOptions.length === 0) {
                const empty = document.createElement('div');
                empty.className = 'q-select__empty';
                empty.textContent = '无匹配项';
                panel.appendChild(empty);
            }

            const wrapperEl = self.nodeMap?.fieldBody?.el as HTMLElement | null;
            if (wrapperEl) {
                wrapperEl.appendChild(panel);
                self._panelEl = panel;
            }
        },

        _getFilteredOptions(): SelectOption[] {
            const self = this as any;
            if (!self._filterable || !self._value) return self._options;
            const query = self._value.toLowerCase();
            return (self._options as SelectOption[]).filter((opt: SelectOption) =>
                opt.label.toLowerCase().includes(query)
            );
        },

        _isSelected(value: string | number): boolean {
            const self = this as any;
            if (self._multiple && Array.isArray(self._selectedValue)) {
                return self._selectedValue.includes(value);
            }
            return self._selectedValue === value;
        },

        _onOptionClick(opt: SelectOption): void {
            const self = this as any;

            if (self._multiple) {
                const arr = Array.isArray(self._selectedValue)
                    ? [...self._selectedValue]
                    : self._selectedValue !== undefined
                      ? [self._selectedValue]
                      : [];
                const idx = arr.indexOf(opt.value);
                if (idx >= 0) {
                    arr.splice(idx, 1);
                } else {
                    arr.push(opt.value);
                }
                self._selectedValue = arr;
            } else {
                self._selectedValue = opt.value;
                self._closeDropdown();
            }

            self._syncDisplayValue();
            self.emit('select:change', { value: self._selectedValue, option: opt });
            if (self._shouldValidate('change')) self._doValidate();
        },

        _syncDisplayValue(): void {
            const self = this as any;
            const fieldEl = getFieldEl(self);
            if (!fieldEl) return;

            if (self._multiple && Array.isArray(self._selectedValue)) {
                const labels = (self._selectedValue as (string | number)[]).map(
                    (v: string | number) => {
                        const opt = (self._options as SelectOption[]).find(
                            (o: SelectOption) => o.value === v
                        );
                        return opt?.label ?? String(v);
                    }
                );
                fieldEl.value = labels.join(', ');
            } else if (self._selectedValue !== undefined) {
                const opt = (self._options as SelectOption[]).find(
                    (o: SelectOption) => o.value === self._selectedValue
                );
                fieldEl.value = opt?.label ?? String(self._selectedValue);
            } else {
                fieldEl.value = '';
            }
            self._value = fieldEl.value;
        },

        getEventData(nodeName: string, eventName: string, eventType: string): Record<string, any> {
            const self = this as any;
            return { value: self._selectedValue };
        },

        get selectedValue(): string | number | (string | number)[] | undefined {
            const self = this as any;
            return self._selectedValue;
        },
        set selectedValue(v: string | number | (string | number)[] | undefined) {
            const self = this as any;
            self._selectedValue = v;
            self._syncDisplayValue();
        },

        get options(): SelectOption[] {
            const self = this as any;
            return self._options;
        },
        set options(v: SelectOption[]) {
            const self = this as any;
            self._options = v;
            if (self._dropdownOpen) self._renderPanel();
        },

        getFormValue(): any {
            const self = this as any;
            return self._selectedValue;
        },

        setFormValue(v: any): void {
            const self = this as any;
            self._selectedValue = v;
            self._syncDisplayValue();
        },

        formReset(defaultValue?: any): void {
            const self = this as any;
            self._selectedValue = defaultValue ?? undefined;
            self._syncDisplayValue();
            self.error = '';
        },

        update(props?: Partial<SelectProps>): void {
            const self = this as any;
            self._super.update(props);

            if (props?.options !== undefined) self.options = props.options;
            if (props?.value !== undefined) self.selectedValue = props.value;
            if (props?.multiple !== undefined) self._multiple = props.multiple;
            if (props?.filterable !== undefined) {
                self._filterable = props.filterable;
                const fieldEl = getFieldEl(self);
                if (fieldEl) {
                    if (props.filterable) {
                        fieldEl.removeAttribute('readonly');
                    } else {
                        fieldEl.setAttribute('readonly', 'true');
                    }
                }
            }
        },
    },
});

export type SelectComponent = InstanceType<typeof SelectComponent>;
