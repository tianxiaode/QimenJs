/**
 * UI 组件事件枚举
 *
 * 规范化事件名，配合 EventBridgeAbility 使用。
 * 所有组件事件统一在此定义，避免硬编码字符串。
 *
 * 命名规则：
 * - 能力事件：{能力名}:{动作}（如 pagination:change, crud:action）
 * - 组件事件：{组件名}:{动作}（如 table:create, form:save）
 * - 选择事件：selection:{动作}（如 selection:change, selection:rowSelect）
 *
 * 注意：能力级事件常量已迁移到 @qimenjs/events 包，
 * 此处重新导出以保持向后兼容。
 */

// ============================================
// 从 events 包重新导出能力级事件（向后兼容）
// ============================================
export {
    PAGINATION_EVENTS,
    CRUD_EVENTS,
    CRUD_ACTIONS,
    SELECTION_EVENTS,
    SEARCH_EVENTS,
    CHILDREN_EVENTS,
    COLUMN_EVENTS,
    TOOLBAR_EVENTS,
    ENTITY_EVENTS,
} from '@qimenjs/events';

// ============================================
// 表格事件（TableComponent 发射）
// ============================================
export const TABLE_EVENTS = {
    PAGE_CHANGE: 'table:pagechange',
    CREATE: 'table:create',
    EDIT: 'table:edit',
    DELETE: 'table:delete',
    REFRESH: 'table:refresh',
    IMPORT: 'table:import',
    EXPORT: 'table:export',
    SAVE: 'table:save',
    SELECTION_CHANGE: 'table:selectionchange',
    ROW_SELECT: 'table:rowselect',
} as const;

// ============================================
// 表单事件（FormComponent 发射）
// ============================================
export const FORM_EVENTS = {
    SAVE: 'form:save',
    CREATE: 'form:create',
    EDIT: 'form:edit',
    DELETE: 'form:delete',
    REFRESH: 'form:refresh',
} as const;
