/**
 * SelectionAbility 类型定义
 *
 * 数据维度的选中状态管理。选中状态以 key → data 存储，
 * 与 UI 无关，可被 Table、List、Grid 等组件复用。
 */

/** 选择模式 — single 单选（互斥），multiple 多选（累加） */
export type SelectionMode = 'single' | 'multiple';

/** 选择配置 */
export interface SelectionConfig {
    /** 选择模式，默认 'single' */
    mode: SelectionMode;
}

/** 选择条目 — key + 关联数据 */
export interface SelectionEntry {
    /** 唯一标识 */
    key: string;
    /** 关联数据（行数据等） */
    data?: any;
}

/** 选择能力内部状态 */
export interface SelectionState {
    /** 选择模式 */
    mode: SelectionMode;
    /** 选中集合：key → 关联数据 */
    selected: Map<string, any>;
    /** 禁选 key 集合 — toggle/select/selectAll 均排除 */
    disabled: Set<string>;
}

/** selectionChange 事件数据 */
export interface SelectionChangeData {
    /** 当前选中 key 数组 */
    keys: string[];
    /** 当前选中关联数据数组 */
    data: any[];
    /** 最近一次操作的 key — 全选/清空时为 null */
    lastKey: string | null;
}
