/**
 * SelectComponent 下拉选择组件
 *
 * 从 InputComponent 派生，共享统一模板（继承父类模板，无需 useTemplate）。
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

import { InputComponent } from './InputComponent';
import './select.css';

export interface SelectOption {
    label: string;
    value: string | number;
    disabled?: boolean;
    group?: string;
}


class SelectComponent extends InputComponent {
    _options: SelectOption[] = [];
    _selectedValue: string | number | (string | number)[] | undefined = undefined;
    _multiple: boolean = false;
    _filterable: boolean = false;
    _dropdownOpen: boolean = false;
    _dropdownIconItem: any = null;
    _panelEl: HTMLElement | null = null;
    _offOverlay: (() => void) | null = null;

    onAfterInit(props?: Record<string, any>): void {
        super.onAfterInit(props);
        this.addCls('q-select');

        const fieldEl = this.field;

        if (fieldEl) {
            fieldEl.setAttribute('readonly', 'true');
            fieldEl.removeAttribute('type');
        }

        this._options = props?.options ?? [];
        this._multiple = props?.multiple ?? false;
        this._filterable = props?.filterable ?? false;

        if (this._filterable && fieldEl) {
            fieldEl.removeAttribute('readonly');
        }

        this._mountDropdownIcon();

        if (props?.value !== undefined) {
            this._selectedValue = props.value;
            this._syncDisplayValue();
        }

        this._applyState();
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
        this.setNodeHidden(false, 'dropdownIcon');
        const dropdownEl = this.nodeMap?.dropdownIcon?.el as HTMLElement | null;
        if (dropdownEl) {
            dropdownEl.textContent = '▼';
            dropdownEl.style.fontSize = '10px';
            dropdownEl.style.color = 'var(--q-colors-text-secondary, #666)';
            dropdownEl.style.cursor = 'pointer';
        }
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

        if (this._panelEl) {
            this._panelEl.remove();
            this._panelEl = null;
        }

        this.emit('select:close', {});
    }

    _renderPanel(): void {
        if (this._panelEl) this._panelEl.remove();

        const panel = document.createElement('div');
        panel.className = 'q-select__panel';

        const filteredOptions = this._getFilteredOptions();

        for (const opt of filteredOptions) {
            const item = document.createElement('div');
            item.className = 'q-select__option';
            if (this._isSelected(opt.value)) {
                item.classList.add('q-select__option--selected');
            }
            if (opt.disabled) {
                item.classList.add('q-select__option--disabled');
            }
            item.textContent = opt.label;
            item.dataset.value = String(opt.value);

            if (!opt.disabled) {
                item.addEventListener('click', () => {
                    this._onOptionClick(opt);
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

        const wrapperEl = this.nodeMap?.fieldBody?.el as HTMLElement | null;
        if (wrapperEl) {
            wrapperEl.appendChild(panel);
            this._panelEl = panel;
        }
    }

    _getFilteredOptions(): SelectOption[] {
        if (!this._filterable || !this._value) return this._options;
        const query = this._value.toLowerCase();
        return (this._options as SelectOption[]).filter((opt: SelectOption) =>
            opt.label.toLowerCase().includes(query)
        );
    }

    _isSelected(value: string | number): boolean {
        if (this._multiple && Array.isArray(this._selectedValue)) {
            return this._selectedValue.includes(value);
        }
        return this._selectedValue === value;
    }

    _onOptionClick(opt: SelectOption): void {
        if (this._multiple) {
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

    _syncDisplayValue(): void {
        const fieldEl = this.field;
        if (!fieldEl) return;

        if (this._multiple && Array.isArray(this._selectedValue)) {
            const labels = (this._selectedValue as (string | number)[]).map(
                (v: string | number) => {
                    const opt = (this._options as SelectOption[]).find(
                        (o: SelectOption) => o.value === v
                    );
                    return opt?.label ?? String(v);
                }
            );
            fieldEl.value = labels.join(', ');
        } else if (this._selectedValue !== undefined) {
            const opt = (this._options as SelectOption[]).find(
                (o: SelectOption) => o.value === this._selectedValue
            );
            fieldEl.value = opt?.label ?? String(this._selectedValue);
        } else {
            fieldEl.value = '';
        }
        this._value = fieldEl.value;
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

    get options(): SelectOption[] {
        return this._options;
    }
    set options(v: SelectOption[]) {
        this._options = v;
        if (this._dropdownOpen) this._renderPanel();
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

        if (props?.options !== undefined) this.options = props.options;
        if (props?.value !== undefined) this.selectedValue = props.value;
        if (props?.multiple !== undefined) this._multiple = props.multiple;
        if (props?.filterable !== undefined) {
            this._filterable = props.filterable;
            const fieldEl = this.field;
            if (fieldEl) {
                if (props.filterable) {
                    fieldEl.removeAttribute('readonly');
                } else {
                    fieldEl.setAttribute('readonly', 'true');
                }
            }
        }
    }
}

export { SelectComponent };
export type SelectComponentInstance = InstanceType<typeof SelectComponent>;
