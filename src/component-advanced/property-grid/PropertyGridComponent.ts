/**
 * PropertyGridComponent 属性网格组件
 *
 * 将 JSON 数据按 fields 定义展示为 key-value 网格。
 * CSS Grid 驱动行列布局，fields[].span 控制跨列。
 *
 * 不从 ItemGroupPooledComponent 派生——字段数量由 fields 固定，
 * 无需池化/回收。直接创建 PropertyFieldComponent 子项。
 *
 * @example
 * ```ts
 * new PropertyGridComponent({
 *     fields: [
 *         { key: 'userName' },
 *         { key: 'status', enums: STATUS_ENUMS, i18n: true },
 *         { key: 'createdAt', type: 'date', format: 'YYYY-MM-DD' },
 *         { key: 'amount', type: 'number', format: '#,##0.00' },
 *         { key: 'isAdmin', type: 'boolean' },
 *         { key: 'tags', type: 'array', i18n: true },
 *         { key: 'address', type: 'json', format: 'grid', span: 2, fields: [...] },
 *     ],
 *     data: { userName: '张三', status: 'active', ... },
 *     cols: 2,
 * })
 * ```
 */

import { Component } from '@qimenjs/component-core';
import { Definitions } from '@/composable';
import { PROPERTY_GRID_TPL } from './property-grid-tpl';
import type { PropertyField, PropertyFieldType } from './PropertyFieldComponent';
import './propertygrid.css';

export type { PropertyField, PropertyFieldType };

const PropertyGridComponentDefs: Definitions = {
    options: {
        cols: 2,
        gap: '8px 16px',
        fields: null,
        data: null,
    },
} as const;

class PropertyGridComponent extends Component {
    _fieldComponents: any[] = [];

    _onColsOptionChange(): void {
        this._applyGrid();
    }

    _onGapOptionChange(): void {
        this._applyGrid();
    }

    _onFieldsOptionChange(value: PropertyField[]): void {
        if (!value) return;
        this._rebuildFields();
    }

    _onDataOptionChange(value: Record<string, any>): void {
        if (!value) return;
        this._updateFieldData();
    }

    onAfterInit(): void {
        this.addCls('q-pgrid');
        this._applyGrid();
        this._createFields();
    }

    onLocaleChange(): void {
        for (const fc of this._fieldComponents) {
            if (typeof fc.onLocaleChange === 'function') {
                fc.onLocaleChange();
            }
        }
    }

    update(props?: Record<string, any>): void {
        if (props?.fields !== undefined) this.fields = props.fields;
        if (props?.data !== undefined) this.data = props.data;
        if (props?.cols !== undefined) this.cols = props.cols;
        if (props?.gap !== undefined) this.gap = props.gap;
    }

    private _applyGrid(): void {
        const gridEl = this._resolveNodeEl('grid');
        if (!gridEl) return;
        gridEl.style.setProperty('--q-pgrid-cols', String(this.cols * 2));
        gridEl.style.gap = this.gap;
    }

    private _createFields(): void {
        const gridEl = this._resolveNodeEl('grid');
        if (!gridEl) return;

        const PropertyFieldComponent = (globalThis as any).__QimenComponentRegistrar?.get(
            'PropertyField'
        );
        if (!PropertyFieldComponent) return;

        this._fieldComponents = [];

        const fields = this.fields;
        if (!fields) return;

        for (const field of fields) {
            const fc = new PropertyFieldComponent({
                field,
                data: this.data,
            });
            gridEl.appendChild(fc.el);
            this._fieldComponents.push(fc);
        }
    }

    private _rebuildFields(): void {
        for (const fc of this._fieldComponents) {
            if (typeof fc.dispose === 'function') fc.dispose();
        }
        this._fieldComponents = [];
        const gridEl = this._resolveNodeEl('grid');
        if (gridEl) gridEl.innerHTML = '';
        this._createFields();
    }

    private _updateFieldData(): void {
        for (const fc of this._fieldComponents) {
            fc.update({ data: this.data });
        }
    }

    onBeforeDispose(): void {
        for (const fc of this._fieldComponents) {
            if (typeof fc.dispose === 'function') fc.dispose();
        }
        this._fieldComponents = [];
    }
}

PropertyGridComponent.useTemplate(PROPERTY_GRID_TPL);
PropertyGridComponent.define(PropertyGridComponentDefs);
export { PropertyGridComponent };
/** 属性网格实例类型 */
export type PropertyGridComponentInstance = InstanceType<typeof PropertyGridComponent>;
