/**
 * ColumnAbility 列定义能力
 *
 * 提供列定义管理，支持丰富的列配置：
 * - 基础：field, label, width, align, sortable
 * - 格式化：format (预设格式) / renderer (自定义渲染函数)
 * - 条件显隐：hidden / hiddenWhen(row, col)
 * - 条件禁用：cellDisabled / disabledWhen(row, col)
 * - 样式：cellClass / cellStyle / cellClassWhen(row, col, value)
 *
 * @example
 * ```js
 * table.columns = [
 *     { field: 'name', label: '姓名', width: 120 },
 *     { field: 'amount', label: '金额', format: 'currency', align: 'right' },
 *     { field: 'status', label: '状态', renderer: (val) => val === 1 ? '启用' : '禁用' },
 *     { field: 'secret', label: '密钥', hidden: true },
 *     { field: 'action', label: '操作', cellDisabled: (val, row) => row.locked },
 * ]
 * ```
 */

import type { AbilityDefinition } from '@qimenjs/composable';

/**
 * 列定义接口
 */
export interface ColumnDefinition {
    /** 字段名（对应数据对象的 key） */
    field: string;
    /** 显示标签 */
    label?: string;
    /** 列宽（px 或 CSS 值） */
    width?: number | string;
    /** 对齐方式：left / center / right */
    align?: 'left' | 'center' | 'right';
    /** 是否可排序 */
    sortable?: boolean;
    /** 是否隐藏 */
    hidden?: boolean;
    /** 条件隐藏：返回 true 则该列隐藏 */
    hiddenWhen?: (row: Record<string, any>, col: ColumnDefinition) => boolean;
    /** 预设格式：currency / percent / date / number */
    format?: string;
    /** 自定义渲染函数：返回显示文本 */
    renderer?: (value: any, row: Record<string, any>, col: ColumnDefinition) => string;
    /** 单元格是否禁用 */
    cellDisabled?: boolean;
    /** 条件禁用：返回 true 则该单元格禁用 */
    disabledWhen?: (value: any, row: Record<string, any>, col: ColumnDefinition) => boolean;
    /** 单元格 CSS class */
    cellClass?: string;
    /** 条件 class：返回要添加的 class 名 */
    cellClassWhen?: (value: any, row: Record<string, any>, col: ColumnDefinition) => string;
    /** 单元格内联样式 */
    cellStyle?: Record<string, string>;
    /** 列头 CSS class */
    headerClass?: string;
    /** 列头内联样式 */
    headerStyle?: Record<string, string>;
    /** 自定义扩展属性 */
    [key: string]: any;
}

/**
 * 预设格式化器
 */
const FORMAT_RENDERERS: Record<string, (value: any) => string> = {
    currency: (v) => {
        const n = Number(v);
        return isNaN(n) ? String(v) : `¥${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
    },
    percent: (v) => {
        const n = Number(v);
        return isNaN(n) ? String(v) : `${(n * 100).toFixed(2)}%`;
    },
    number: (v) => {
        const n = Number(v);
        return isNaN(n) ? String(v) : n.toLocaleString();
    },
    date: (v) => {
        if (!v) return '';
        const d = new Date(v);
        return isNaN(d.getTime()) ? String(v) : d.toLocaleDateString();
    },
    boolean: (v) => v ? '是' : '否',
};

export const ColumnAbility: AbilityDefinition = {
    /**
     * columns getter/setter
     */
    columns: {
        get(): ColumnDefinition[] {
            return this.abilityState('ColumnAbility:columns', () => []);
        },
        set(value: ColumnDefinition[]): void {
            this.setAbilityState('ColumnAbility:columns', value);
            this.markDirty();
        },
    },

    /**
     * 获取可见列（过滤 hidden 和 hiddenWhen）
     *
     * @param row - 可选，传入行数据用于 hiddenWhen 判断
     * @returns 可见列数组
     */
    getVisibleColumns(row?: Record<string, any>): ColumnDefinition[] {
        return this.columns.filter((col: ColumnDefinition) => {
            if (col.hidden) return false;
            if (col.hiddenWhen && row) return !col.hiddenWhen(row, col);
            return true;
        });
    },

    /**
     * 格式化单元格值
     *
     * 优先使用 renderer，其次使用 format 预设，最后返回原始值
     *
     * @param col - 列定义
     * @param row - 行数据
     * @returns 格式化后的显示文本
     */
    formatCellValue(col: ColumnDefinition, row: Record<string, any>): string {
        const value = row[col.field];

        // 1. 自定义渲染函数优先
        if (typeof col.renderer === 'function') {
            return col.renderer(value, row, col);
        }

        // 2. 预设格式
        if (col.format && FORMAT_RENDERERS[col.format]) {
            return FORMAT_RENDERERS[col.format](value);
        }

        // 3. 原始值
        return value ?? '';
    },

    /**
     * 判断单元格是否禁用
     *
     * @param col - 列定义
     * @param row - 行数据
     * @returns 是否禁用
     */
    isCellDisabled(col: ColumnDefinition, row: Record<string, any>): boolean {
        if (col.cellDisabled === true) return true;
        if (typeof col.disabledWhen === 'function') {
            return col.disabledWhen(row[col.field], row, col);
        }
        return false;
    },

    /**
     * 获取单元格 CSS class
     *
     * @param col - 列定义
     * @param row - 行数据
     * @returns class 字符串
     */
    getCellClass(col: ColumnDefinition, row: Record<string, any>): string {
        const classes: string[] = [];
        if (col.cellClass) classes.push(col.cellClass);
        if (typeof col.cellClassWhen === 'function') {
            const extra = col.cellClassWhen(row[col.field], row, col);
            if (extra) classes.push(extra);
        }
        if (this.isCellDisabled(col, row)) {
            classes.push('q-cell--disabled');
        }
        return classes.join(' ');
    },
};
