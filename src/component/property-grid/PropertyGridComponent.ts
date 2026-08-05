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
import { PROPERTY_GRID_TPL } from './property-grid-tpl';
import type { PropertyField, PropertyFieldType } from './PropertyFieldComponent';

export type { PropertyField, PropertyFieldType };

/** 属性网格属性接口 */
export interface PropertyGridProps {
    fields: PropertyField[];
    data?: Record<string, any>;
    cols?: number;
    gap?: string;
}

class PropertyGridComponent extends Component {
    _fields: PropertyField[] = [];
    _data: Record<string, any> = {};
    _cols: number = 2;
    _gap: string = '8px 16px';
    _fieldComponents: any[] = [];

    onAfterInit(props?: PropertyGridProps): void {
        this.addCls('q-pgrid');

        if (props?.cols) this._cols = props.cols;
        if (props?.gap) this._gap = props.gap;
        if (props?.fields) this._fields = props.fields;
        if (props?.data) this._data = props.data;

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

    get fields(): PropertyField[] {
        return this._fields;
    }
    set fields(value: PropertyField[]) {
        this._fields = value;
        this._rebuildFields();
    }

    get data(): Record<string, any> {
        return this._data;
    }
    set data(value: Record<string, any>) {
        this._data = value;
        this._updateFieldData();
    }

    get cols(): number {
        return this._cols;
    }
    set cols(value: number) {
        this._cols = value;
        this._applyGrid();
    }

    get gap(): string {
        return this._gap;
    }
    set gap(value: string) {
        this._gap = value;
        this._applyGrid();
    }

    update(props?: Partial<PropertyGridProps>): void {
        if (props?.fields !== undefined) {
            this._fields = props.fields;
            this._rebuildFields();
        }
        if (props?.data !== undefined) {
            this._data = props.data;
            this._updateFieldData();
        }
        if (props?.cols !== undefined) {
            this._cols = props.cols;
            this._applyGrid();
        }
        if (props?.gap !== undefined) {
            this._gap = props.gap;
            this._applyGrid();
        }
    }

    private _applyGrid(): void {
        const gridEl = this._resolveNodeEl('grid');
        if (!gridEl) return;
        gridEl.style.setProperty('--q-pgrid-cols', String(this._cols * 2));
        gridEl.style.gap = this._gap;
    }

    private _createFields(): void {
        const gridEl = this._resolveNodeEl('grid');
        if (!gridEl) return;

        const PropertyFieldComponent = (globalThis as any).__QimenComponentRegistrar?.get(
            'PropertyField'
        );
        if (!PropertyFieldComponent) return;

        this._fieldComponents = [];

        for (const field of this._fields) {
            const fc = new PropertyFieldComponent({
                field,
                data: this._data,
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
            fc.update({ data: this._data });
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
PropertyGridComponent.register();
export { PropertyGridComponent };
/** 属性网格实例类型 */
export type PropertyGridComponentInstance = InstanceType<typeof PropertyGridComponent>;
