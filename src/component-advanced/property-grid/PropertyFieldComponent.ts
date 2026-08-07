/**
 * PropertyFieldComponent 属性字段组件
 *
 * PropertyGrid 的单行：label + value。
 * 由 PropertyGrid 创建和管理，不独立使用。
 *
 * 根据 type 渲染不同内容：
 * - text: 直接文本
 * - number: formatNumber 格式化
 * - date: formatDate 格式化
 * - boolean: 只读 checkbox
 * - json: JSON.stringify 或嵌套 PropertyGrid
 * - array: chip 列表
 *
 * i18n + enums 驱动 label/value 的本地化。
 * onLocaleChange 钩子自动重渲染 i18n 内容。
 */

import { Component } from '@qimenjs/component-core';
import { PROPERTY_FIELD_TPL } from './property-field-tpl';
import { formatNumber } from '@/utils/number';
import { formatDate } from '@/utils/date';
import { resolveI18nValue } from '@qimenjs/i18n';

/** 属性字段类型 */
export type PropertyFieldType = 'text' | 'number' | 'date' | 'boolean' | 'json' | 'array';

/** 属性字段定义 */
export interface PropertyField {
    key: string;
    labelKey?: string;
    span?: number;
    type?: PropertyFieldType;
    format?: string;
    enums?: Record<string, string>;
    i18n?: boolean;
    fields?: PropertyField[];
    transform?: (value: string, data: Record<string, any>) => string;
    labelCls?: string;
    cls?: string;
}

class PropertyFieldComponent extends Component {
    _fieldDef: PropertyField = { key: '' };
    _data: Record<string, any> = {};
    _nestedGrid: any = null;

    onAfterInit(props?: { field: PropertyField; data: Record<string, any> }): void {
        if (props?.field) this._fieldDef = props.field;
        if (props?.data) this._data = props.data;
        this._applyField();
    }

    onLocaleChange(): void {
        this._applyLabel();
        if (
            this._fieldDef.i18n ||
            this._fieldDef.type === 'date' ||
            this._fieldDef.type === 'number'
        ) {
            this._applyValue();
        }
    }

    update(props?: { field?: PropertyField; data?: Record<string, any> }): void {
        if (props?.field) this._fieldDef = props.field;
        if (props?.data) this._data = props.data;
        this._applyField();
    }

    private _applyField(): void {
        const def = this._fieldDef;

        if (def.span && def.span > 1) {
            this.el.style.gridColumn = `span ${def.span}`;
        }

        if (def.labelCls) {
            const labelEl = this._resolveNodeEl('label');
            if (labelEl) labelEl.classList.add(...def.labelCls.split(/\s+/));
        }
        if (def.cls) {
            const valueEl = this._resolveNodeEl('value');
            if (valueEl) valueEl.classList.add(...def.cls.split(/\s+/));
        }

        this._applyLabel();
        this._applyValue();
    }

    private _applyLabel(): void {
        const def = this._fieldDef;
        const labelKey = def.labelKey ?? def.key;
        const labelText = def.i18n !== false ? resolveI18nValue(`i18n:${labelKey}`) : labelKey;
        this.setNodeProp('text', labelText, 'label');
    }

    private _applyValue(): void {
        const def = this._fieldDef;
        const raw = this._data[def.key];
        const valueEl = this._resolveNodeEl('value');
        if (!valueEl) return;

        valueEl.innerHTML = '';
        if (this._nestedGrid) {
            this._nestedGrid = null;
        }

        const type = def.type ?? 'text';

        if (raw === undefined || raw === null) {
            valueEl.textContent = '';
            return;
        }

        let result: string;

        switch (type) {
            case 'boolean':
                this._renderBoolean(valueEl, raw);
                return;
            case 'array':
                this._renderArray(valueEl, raw);
                return;
            case 'json':
                if (def.format === 'grid' && def.fields && typeof raw === 'object') {
                    this._renderNestedGrid(valueEl, raw);
                    return;
                }
                result = JSON.stringify(raw);
                break;
            case 'number':
                result = this._formatNumber(raw);
                break;
            case 'date':
                result = this._formatDate(raw);
                break;
            default:
                result = String(raw);
                break;
        }

        if (def.enums) {
            const mapped = def.enums[result] ?? def.enums[String(raw)];
            if (mapped !== undefined) {
                result = def.i18n ? resolveI18nValue(`i18n:${mapped}`) : mapped;
            }
        } else if (def.i18n && type === 'text') {
            result = resolveI18nValue(`i18n:${result}`);
        }

        if (def.transform) {
            result = def.transform(result, this._data);
        }

        valueEl.textContent = result;
    }

    private _formatNumber(raw: any): string {
        const num = Number(raw);
        if (!isFinite(num)) return String(raw);
        const fmt = this._fieldDef.format ?? '#,##0.##';
        return formatNumber(num, fmt);
    }

    private _formatDate(raw: any): string {
        const fmt = this._fieldDef.format ?? 'YYYY-MM-DD';
        return formatDate(raw, fmt);
    }

    private _renderBoolean(container: HTMLElement, value: any): void {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = Boolean(value);
        checkbox.disabled = true;
        checkbox.className = 'q-pgrid__checkbox';
        container.appendChild(checkbox);
    }

    private _renderArray(container: HTMLElement, value: any[]): void {
        const def = this._fieldDef;
        const arr = Array.isArray(value) ? value : [value];

        for (const item of arr) {
            const chip = document.createElement('span');
            chip.className = 'q-pgrid__chip';

            let text = String(item);
            if (def.enums) {
                const mapped = def.enums[text];
                if (mapped !== undefined) {
                    text = def.i18n ? resolveI18nValue(`i18n:${mapped}`) : mapped;
                }
            } else if (def.i18n) {
                text = resolveI18nValue(`i18n:${text}`);
            }

            chip.textContent = text;
            container.appendChild(chip);
        }
    }

    private _renderNestedGrid(container: HTMLElement, data: Record<string, any>): void {
        const PropertyGridComponent = (globalThis as any).__QimenComponentRegistrar?.get(
            'PropertyGrid'
        );
        if (!PropertyGridComponent) {
            container.textContent = JSON.stringify(data);
            return;
        }
        this._nestedGrid = new PropertyGridComponent({
            fields: this._fieldDef.fields,
            data,
            cols: 2,
        });
        container.appendChild(this._nestedGrid.el);
    }
}

PropertyFieldComponent.useTemplate(PROPERTY_FIELD_TPL);
export { PropertyFieldComponent };
/** 属性字段实例类型 */
export type PropertyFieldComponentInstance = InstanceType<typeof PropertyFieldComponent>;
