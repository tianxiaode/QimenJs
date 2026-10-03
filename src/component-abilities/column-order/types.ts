/**
 * ColumnOrderAbility 类型定义
 *
 * 列顺序映射表能力的类型系统。映射表记录每列的组件引用、
 * order 值和 items 索引，支持通过修改 order 值实现重排，
 * 无需 update 任何组件。
 */

/**
 * 列顺序映射表条目 — 每列一条记录
 *
 * 通过 colName 可直接获取组件、order 值和索引；
 * 通过 index 可从 items 数组获取组件；
 * 可扩展记录更多列相关信息。
 */
export interface ColumnOrderEntry {
    /** 列名 — 唯一标识 */
    colName: string;

    /** 组件引用 — 直接映射到组件实例 */
    component: any;

    /** CSS order 值 — 控制视觉排列顺序 */
    order: number;

    /** 在 items 数组中的索引 — 可按索引从 items 获取组件 */
    index: number;

    /** 父分组列名 — 子列才有，顶层列为 undefined */
    parentGroup?: string;

    /** 是否叶子列 — 分组列为 false，普通列为 true */
    isLeaf: boolean;
}

/**
 * ColumnOrderAbility 内部状态
 */
export interface ColumnOrderState {
    /** colName → 条目映射 */
    entries: Map<string, ColumnOrderEntry>;

    /** order → colName 反向映射，用于查找相邻列 */
    orderToName: Map<number, string>;

    /** order 值步长 — 初始分配间隔（如 100） */
    step: number;

    /** CSS 变量前缀 — 如 '--q-table-col-' */
    cssVarPrefix: string;

    /** 是否通过 CSS 变量控制 order（row cells 用 true，header cells 用 false） */
    useCssVar: boolean;
}

/**
 * ColumnOrderAbility 初始化配置
 */
export interface ColumnOrderConfig {
    /** order 值步长，默认 100 */
    step?: number;

    /** CSS 变量前缀，默认 '--q-table-col-' */
    cssVarPrefix?: string;

    /** 是否通过 CSS 变量控制 order，默认 true */
    useCssVar?: boolean;
}
