/**
 * ColumnManageAbility 列管理能力
 *
 * 提供列的增删移隐操作，由 Table 等容器组件使用。
 * 与 ColumnAbility（列定义数据）配合，ColumnManageAbility 管理列组件的生命周期。
 *
 * @example
 * ```js
 * table.addColumn({ field: 'name', label: '姓名' });
 * table.removeColumn('name');
 * table.hideColumn('amount');
 * table.showColumn('amount');
 * table.moveColumn('name', 2);
 * ```
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import type { ColumnDefinition } from './ColumnAbility';
import { COLUMN_EVENTS } from '../events';

export const ColumnManageAbility: AbilityDefinition = {
    /**
     * 添加列
     *
     * @param colDef - 列定义
     * @param index - 可选的插入位置
     * @returns 组件自身，支持链式调用
     */
    addColumn(colDef: ColumnDefinition, index?: number): any {
        const cols = this.columns;
        if (index !== undefined && index >= 0 && index <= cols.length) {
            cols.splice(index, 0, colDef);
        } else {
            cols.push(colDef);
        }
        this.columns = [...cols]; // 触发 setter → markDirty
        this.emit?.(COLUMN_EVENTS.ADD, { column: colDef, index });
        return this;
    },

    /**
     * 批量添加列
     *
     * @param colDefs - 列定义数组
     * @param startIndex - 可选的起始位置
     * @returns 组件自身，支持链式调用
     */
    addColumns(colDefs: ColumnDefinition[], startIndex?: number): any {
        let idx = startIndex ?? this.columns.length;
        for (const colDef of colDefs) {
            this.addColumn(colDef, idx);
            idx++;
        }
        return this;
    },

    /**
     * 移除列
     *
     * @param field - 列字段名
     * @returns 组件自身，支持链式调用
     */
    removeColumn(field: string): any {
        const cols = this.columns;
        const idx = cols.findIndex((c: ColumnDefinition) => c.field === field);
        if (idx !== -1) {
            const removed = cols.splice(idx, 1)[0];
            this.columns = [...cols]; // 触发 setter → markDirty
            this.emit?.(COLUMN_EVENTS.REMOVE, { column: removed, index: idx });
        }
        return this;
    },

    /**
     * 按索引移除列
     *
     * @param index - 列索引
     * @returns 被移除的列定义，或 undefined
     */
    removeColumnAt(index: number): ColumnDefinition | undefined {
        const cols = this.columns;
        if (index < 0 || index >= cols.length) return undefined;
        const removed = cols.splice(index, 1)[0];
        this.columns = [...cols];
        this.emit?.(COLUMN_EVENTS.REMOVE, { column: removed, index });
        return removed;
    },

    /**
     * 隐藏列
     *
     * @param field - 列字段名
     * @returns 组件自身，支持链式调用
     */
    hideColumn(field: string): any {
        const col = this.columns.find((c: ColumnDefinition) => c.field === field);
        if (col) {
            col.hidden = true;
            this.columns = [...this.columns]; // 触发重新渲染
            this.emit?.(COLUMN_EVENTS.HIDE, { column: col });
        }
        return this;
    },

    /**
     * 显示列
     *
     * @param field - 列字段名
     * @returns 组件自身，支持链式调用
     */
    showColumn(field: string): any {
        const col = this.columns.find((c: ColumnDefinition) => c.field === field);
        if (col) {
            col.hidden = false;
            this.columns = [...this.columns]; // 触发重新渲染
            this.emit?.(COLUMN_EVENTS.SHOW, { column: col });
        }
        return this;
    },

    /**
     * 移动列到新位置
     *
     * @param field - 列字段名
     * @param newIndex - 新的索引位置
     * @returns 组件自身，支持链式调用
     */
    moveColumn(field: string, newIndex: number): any {
        const cols = this.columns;
        const oldIndex = cols.findIndex((c: ColumnDefinition) => c.field === field);
        if (oldIndex === -1 || oldIndex === newIndex) return this;

        const [col] = cols.splice(oldIndex, 1);
        const targetIndex = newIndex > oldIndex ? newIndex - 1 : newIndex;
        cols.splice(targetIndex, 0, col);
        this.columns = [...cols];
        this.emit?.(COLUMN_EVENTS.MOVE, { column: col, oldIndex, newIndex: targetIndex });
        return this;
    },

    /**
     * 替换列
     *
     * @param field - 被替换的列字段名
     * @param newColDef - 新的列定义
     * @returns 组件自身，支持链式调用
     */
    replaceColumn(field: string, newColDef: ColumnDefinition): any {
        const cols = this.columns;
        const idx = cols.findIndex((c: ColumnDefinition) => c.field === field);
        if (idx === -1) return this;
        const oldCol = cols[idx];
        cols[idx] = newColDef;
        this.columns = [...cols];
        this.emit?.(COLUMN_EVENTS.REPLACE, { oldColumn: oldCol, newColumn: newColDef, index: idx });
        return this;
    },

    /**
     * 获取列定义
     *
     * @param field - 列字段名
     * @returns 列定义，或 undefined
     */
    getColumn(field: string): ColumnDefinition | undefined {
        return this.columns.find((c: ColumnDefinition) => c.field === field);
    },

    /**
     * 按索引获取列定义
     *
     * @param index - 列索引
     * @returns 列定义，或 undefined
     */
    getColumnAt(index: number): ColumnDefinition | undefined {
        return this.columns[index];
    },

    /**
     * 列数量
     */
    columnCount: {
        get(): number {
            return this.columns.length;
        },
    },
};
