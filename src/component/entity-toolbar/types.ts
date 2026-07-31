/**
 * EntityToolbar 共享类型定义
 *
 * 从 EntityToolbarComponent 提取，供工厂函数/能力/组件共用，避免循环依赖。
 */

// ── 工厂函数 + 声明式 props 共用 ──

/**
 * 工具栏按钮覆盖定义
 *
 * 用于：
 *   - 工厂函数的 config 参数：`true` 使用默认，对象则合并覆盖
 *   - EntityToolbarProps.pagination / crud 声明式字段
 */
export interface EntityToolbarItemDef {
    type?: string;
    name?: string;
    order?: number;
    cls?: string;
    iconCls?: string;
    text?: string;
    variant?: string;
    [key: string]: any;
}

/**
 * 内置按钮定义（工厂函数内部使用）
 */
export interface BuiltinItemDef {
    name: string;
    type: string;
    order: number;
    iconCls: string;
    text: string;
    variant: string;
}

// ── 状态能力共用 ──

/**
 * 工具栏整体状态（update() 参数）
 */
export interface EntityToolbarState {
    /** 当前页码 */
    page?: number;
    /** 总页数 */
    totalPages?: number;
    /** 总记录数 */
    totalRecords?: number;
    /** 每页条数 */
    pageSize?: number;
}

/**
 * 单个按钮状态（updateItemStates() 参数）
 */
export interface EntityToolbarItemState {
    enabled?: boolean;
    hidden?: boolean;
    cls?: string;
    iconCls?: string;
}
