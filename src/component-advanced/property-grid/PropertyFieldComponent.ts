import { Component } from '@qimenjs/component-core';
import type { TemplateDecl } from '@qimenjs/component-core';
import { ComponentRegistrar } from '@/component-core/ComponentRegistrar';
import { Definitions } from '@/composable';
import { PROPERTY_FIELD_TPL } from './property-field-tpl';
import { formatNumber } from '@/utils/number';
import { formatDate } from '@/utils/date';
import { resolveI18nValue } from '@qimenjs/i18n';

export type PropertyFieldType = 'text' | 'number' | 'date' | 'boolean' | 'json' | 'array';

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

const PropertyFieldComponentDefs: Definitions = {
    options: {
        field: null,
        data: null,
    },
} as const;

class PropertyFieldComponent extends Component {
    static type = 'property-field';

    get tpl(): TemplateDecl {
        return PROPERTY_FIELD_TPL;
    }

    _nestedGrid: any = null;

    _onFieldOptionChange(value: PropertyField): void {
        if (value) this._applyField();
    }

    _onDataOptionChange(value: Record<string, any>): void {
        if (value) this._applyValue();
    }

    onAfterInit(): void {
        this._applyField();
    }

    onLocaleChange(): void {
        this._applyLabel();
        const def = this.field as PropertyField;
        if (
            def?.i18n ||
            def?.type === 'date' ||
            def?.type === 'number'
        ) {
            this._applyValue();
        }
    }

    private _applyField(): void {
        const def = this.field as PropertyField;
        if (!def) return;

        if (def.span && def.span > 1) {
            this.gridColumn = `span ${def.span}`;
        }

        if (def.labelCls) {
            const labelEl = this.getNodeEl('label');
            if (labelEl) labelEl.classList.add(...def.labelCls.split(/\s+/));
        }
        if (def.cls) {
            const valueEl = this.getNodeEl('value');
            if (valueEl) valueEl.classList.add(...def.cls.split(/\s+/));
        }

        this._applyLabel();
        this._applyValue();
    }

    private _applyLabel(): void {
        const def = this.field as PropertyField;
        if (!def) return;
        const labelKey = def.labelKey ?? def.key;
        const labelText = def.i18n !== false ? resolveI18nValue(`@${labelKey}`) : labelKey;
        this.setNodeText(labelText, 'label');
    }

    private _applyValue(): void {
        const def = this.field as PropertyField;
        if (!def) return;
        const raw = (this.data as Record<string, any>)?.[def.key];
        const valueEl = this.getNodeEl('value');
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
                result = def.i18n ? resolveI18nValue(`@${mapped}`) : mapped;
            }
        } else if (def.i18n && type === 'text') {
            result = resolveI18nValue(`@${result}`);
        }

        if (def.transform) {
            result = def.transform(result, this.data as Record<string, any>);
        }

        valueEl.textContent = result;
    }

    private _formatNumber(raw: any): string {
        const num = Number(raw);
        if (!isFinite(num)) return String(raw);
        const fmt = (this.field as PropertyField)?.format ?? '#,##0.##';
        return formatNumber(num, fmt);
    }

    private _formatDate(raw: any): string {
        const fmt = (this.field as PropertyField)?.format ?? 'YYYY-MM-DD';
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
        const def = this.field as PropertyField;
        const arr = Array.isArray(value) ? value : [value];

        for (const item of arr) {
            const chip = document.createElement('span');
            chip.className = 'q-pgrid__chip';

            let text = String(item);
            if (def.enums) {
                const mapped = def.enums[text];
                if (mapped !== undefined) {
                    text = def.i18n ? resolveI18nValue(`@${mapped}`) : mapped;
                }
            } else if (def.i18n) {
                text = resolveI18nValue(`@${text}`);
            }

            chip.textContent = text;
            container.appendChild(chip);
        }
    }

    private _renderNestedGrid(container: HTMLElement, data: Record<string, any>): void {
        const PropertyGridComponent = ComponentRegistrar.getInstance().get('property-grid');
        if (!PropertyGridComponent) {
            container.textContent = JSON.stringify(data);
            return;
        }
        this._nestedGrid = new PropertyGridComponent({
            fields: (this.field as PropertyField)?.fields,
            data,
            cols: 2,
        });
        container.appendChild(this._nestedGrid.el);
    }

    onBeforeDispose(): void {
        if (this._nestedGrid?.dispose) this._nestedGrid.dispose();
    }
}

PropertyFieldComponent.define(PropertyFieldComponentDefs);

export { PropertyFieldComponent };
export type PropertyFieldComponentInstance = InstanceType<typeof PropertyFieldComponent>;
