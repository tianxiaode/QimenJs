/**
 * 组件类型常量
 *
 * 集中定义所有内置组件的 type 标识，避免硬编码字符串导致拼写错误和不一致。
 * Layout 定义和组件注册时统一使用这些常量。
 *
 * @example
 * ```typescript
 * import { ComponentTypes } from '@qimenjs/component-core';
 *
 * // 组件注册
 * registrar.register({ type: ComponentTypes.BUTTON, component: ButtonComponent });
 *
 * // Layout 定义
 * const layout = { type: ComponentTypes.TABLE, ... };
 * ```
 */
export const ComponentTypes = {
    // ---- 基础组件 ----
    /** 按钮 */
    BUTTON: 'Button',
    /** 输入框 */
    INPUT: 'Input',
    /** 下拉选择 */
    SELECT: 'Select',
    /** 图标 */
    ICON: 'Icon',
    /** 文本 */
    TEXT: 'Text',

    // ---- 布局组件 ----
    /** 水平布局 */
    HBOX: 'HBox',
    /** 垂直布局 */
    VBOX: 'VBox',
    /** 网格布局 */
    GRID: 'Grid',
    /** 弹性空间 */
    SPACE: 'Space',

    // ---- 工具栏组件 ----
    /** 工具栏 */
    TOOLBAR: 'Toolbar',
    /** 按钮组 */
    BUTTON_GROUP: 'ButtonGroup',
    /** 分隔符 */
    SEPARATOR: 'Separator',

    // ---- 高级组件 ----
    /** 表格 */
    TABLE: 'Table',
    /** 表单 */
    FORM: 'Form',
    /** 对话框 */
    DIALOG: 'Dialog',
    /** 面板 */
    PANEL: 'Panel',

    // ---- 菜单组件 ----
    /** 菜单 */
    MENU: 'Menu',
    /** 菜单项 */
    MENU_ITEM: 'MenuItem',

    // ---- 列组件 ----
    /** 基础列 */
    COLUMN: 'Column',
    /** ID 列 */
    ID_COLUMN: 'IdColumn',
    /** 数字列 */
    NUMBER_COLUMN: 'NumberColumn',
    /** 复选框列 */
    CHECKBOX_COLUMN: 'CheckboxColumn',

    // ---- 单元格 ----
    /** 基础单元格 */
    CELL: 'Cell',
} as const;
