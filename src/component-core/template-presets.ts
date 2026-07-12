/**
 * 组件模板预设
 *
 * 定义各组件的 JSON 模板片段（不含外层根元素，外层由 ComponentBase.initElement 创建）。
 * ContentManager 在运行时通过 data-content 查找元素并生成属性。
 *
 * 模板片段由 ComponentBase.initElement() 注入到 this.el.innerHTML 中。
 * 支持多模板注册（如 Input:top），通过 static templateId 或 reinitElement() 切换。
 *
 * JSON 模板字段与 data-* 属性的对应关系：
 * - content  → data-content="group:name" — 元素身份标识（必须）
 * - event    → data-event="event[?modifier]" — 内部事件声明（可选）
 *   方法名从 content 自动推导：单 group → onName，多 group → onGroupName
 *   修饰符：?once（只触发一次）、?delegate（事件委托）
 * - emit     → data-emit="event[?modifier]" — 外部事件声明（可选）
 * - target   → data-target="selector" — 事件委托目标选择器（配合 ?delegate 使用）
 * - json     → data-json="refId" — JSON 组件定义引用
 * - jsonMode → data-json-mode="replace|child" — JSON 渲染模式
 * - template → data-template="refId" — 嵌套模板引用
 * - i18n     → data-i18n="key" — 国际化翻译 key
 */

import type { JsonTemplateNode } from './template-json';

/**
 * 按钮模板
 *
 * 内容项：
 * - button:icon — 图标
 * - button:text — 文本
 */
export const BUTTON_TEMPLATE: JsonTemplateNode[] = [
    { tag: 'span', content: 'button:icon' },
    { tag: 'span', content: 'button:text' },
];

/**
 * 输入框模板（label 在左侧，默认布局）
 *
 * 内容项：
 * - input:label — 标签文本
 * - input:prefix — 前缀文本（货币符号等）
 * - input:field — 输入框（事件：input → handleInput）
 * - input:suffix — 后缀文本（单位等）
 * - input:error — 错误提示
 * - input:hint — 提示文本
 */
export const INPUT_TEMPLATE: JsonTemplateNode[] = [
    { tag: 'span', content: 'input:label', class: 'q-input__text q-input__text--label' },
    { tag: 'span', content: 'input:prefix', class: 'q-input__text q-input__text--prefix' },
    { tag: 'input', content: 'input:field', event: 'input', class: 'q-input__field' },
    { tag: 'span', content: 'input:suffix', class: 'q-input__text q-input__text--suffix' },
    { tag: 'span', content: 'input:error', class: 'q-input__text q-input__text--error' },
    { tag: 'span', content: 'input:hint', class: 'q-input__text q-input__text--hint' },
];

/**
 * 输入框模板（label 在上方）
 */
export const INPUT_TOP_TEMPLATE: JsonTemplateNode[] = [
    { tag: 'span', content: 'input:label', class: 'q-input__text q-input__text--label' },
    { tag: 'div', class: 'q-input__field-wrap', children: [
        { tag: 'span', content: 'input:prefix', class: 'q-input__text q-input__text--prefix' },
        { tag: 'input', content: 'input:field', event: 'input', class: 'q-input__field' },
        { tag: 'span', content: 'input:suffix', class: 'q-input__text q-input__text--suffix' },
    ]},
    { tag: 'span', content: 'input:error', class: 'q-input__text q-input__text--error' },
    { tag: 'span', content: 'input:hint', class: 'q-input__text q-input__text--hint' },
];

/**
 * 下拉选择模板
 *
 * 内容项：
 * - select:label — 标签文本
 * - select:field — 下拉框（事件：change → handleChange）
 */
export const SELECT_TEMPLATE: JsonTemplateNode[] = [
    { tag: 'span', content: 'select:label' },
    { tag: 'select', content: 'select:field', event: 'change', class: 'q-select__field' },
];

/**
 * 工具栏模板
 *
 * 统一模板包含所有溢出模式的节点，通过显隐切换：
 * - toolbar:contentArea — 子项容器（所有模式共用）
 * - toolbar:prevBtn — 左/上箭头按钮（scroll 模式，默认隐藏）
 * - toolbar:nextBtn — 右/下箭头按钮（scroll 模式，默认隐藏）
 * - toolbar:triggerBtn — 下拉触发按钮（menu 模式，默认隐藏）
 * - toolbar:menuPanel — 下拉菜单面板（menu 模式，默认隐藏）
 *
 * 子项由外部动态添加到 contentArea 中。
 */
export const TOOLBAR_TEMPLATE: JsonTemplateNode[] = [
    { tag: 'button', content: 'toolbar:prevBtn', event: 'click', class: 'q-overflow-arrow q-overflow-arrow--prev', style: 'display:none;' },
    { tag: 'div', content: 'toolbar:contentArea', class: 'q-toolbar__content', style: 'display:flex;' },
    { tag: 'button', content: 'toolbar:nextBtn', event: 'click', class: 'q-overflow-arrow q-overflow-arrow--next', style: 'display:none;' },
    { tag: 'button', content: 'toolbar:triggerBtn', event: 'click', class: 'q-overflow-menu__trigger', style: 'display:none;' },
    { tag: 'div', content: 'toolbar:menuPanel', class: 'q-overflow-menu__panel', style: 'display:none;position:absolute;' },
];

/**
 * 图标模板（组件直接管理 DOM，无需内容项）
 */
export const ICON_TEMPLATE: JsonTemplateNode[] = [];

/**
 * 文本模板（组件直接管理 DOM，无需内容项）
 */
export const TEXT_TEMPLATE: JsonTemplateNode[] = [];

/**
 * 表格模板
 *
 * 内容项：
 * - table:headerRow — 表头容器
 * - table:bodyScroll — 表体容器（虚拟列表滚动容器，事件：scroll → handleScroll）
 */
export const TABLE_TEMPLATE: JsonTemplateNode[] = [
    { tag: 'div', content: 'table:headerRow', class: 'q-table__header' },
    { tag: 'div', content: 'table:bodyScroll', event: 'scroll', class: 'q-table__body', style: 'overflow-y: auto;' },
];

/**
 * 弹窗模板
 *
 * 内容项：
 * - dialog:header — 头部区域
 * - dialog:text — 标题文本
 * - dialog:close — 关闭按钮（事件：click → handleClose）
 * - dialog:body — 内容区域
 * - dialog:footer — 底部区域
 */
export const DIALOG_TEMPLATE: JsonTemplateNode[] = [
    { tag: 'div', content: 'dialog:header', class: 'q-dialog__header', children: [
        { tag: 'span', content: 'dialog:text', class: 'q-dialog__title' },
        { tag: 'button', content: 'dialog:close', event: 'click', class: 'q-dialog__close', text: '\u00d7' },
    ]},
    { tag: 'div', content: 'dialog:body', class: 'q-dialog__body' },
    { tag: 'div', content: 'dialog:footer', class: 'q-dialog__footer' },
];

/**
 * 提示浮层模板
 *
 * 内容项：
 * - tips:default — 提示文本
 */
export const TIPS_TEMPLATE: JsonTemplateNode[] = [
    { tag: 'span', content: 'tips:default', class: 'q-tips__content' },
];

/**
 * 下拉菜单浮层模板
 *
 * 内容项：
 * - dropdown:default — 下拉内容
 */
export const DROPDOWN_TEMPLATE: JsonTemplateNode[] = [
    { tag: 'div', content: 'dropdown:default', class: 'q-dropdown__content' },
];

/**
 * 弹出框浮层模板
 *
 * 内容项：
 * - popover:default — 弹出内容
 */
export const POPOVER_TEMPLATE: JsonTemplateNode[] = [
    { tag: 'div', content: 'popover:default', class: 'q-popover__content' },
];

/**
 * Toast 轻量模板（无标题）
 *
 * 内容项：
 * - toast:icon — 类型图标
 * - toast:message — 消息文本
 */
export const TOAST_TEMPLATE: JsonTemplateNode[] = [
    { tag: 'div', content: 'toast:icon', class: 'q-toast__icon' },
    { tag: 'span', content: 'toast:message', class: 'q-toast__message' },
];

/**
 * ToastNotification 增强模板（有标题，覆盖 notification 场景）
 *
 * 内容项：
 * - toast:text — 标题文本
 * - toast:close — 关闭按钮（事件：click → handleClose）
 * - toast:icon — 类型图标
 * - toast:message — 消息文本
 */
export const TOAST_NOTIFICATION_TEMPLATE: JsonTemplateNode[] = [
    { tag: 'div', class: 'q-toast__header', children: [
        { tag: 'span', content: 'toast:text', class: 'q-toast__title' },
        { tag: 'button', content: 'toast:close', event: 'click', class: 'q-toast__close', text: '\u00d7' },
    ]},
    { tag: 'div', content: 'toast:icon', class: 'q-toast__icon' },
    { tag: 'span', content: 'toast:message', class: 'q-toast__message' },
];

/**
 * Msgbox 模态消息框模板
 *
 * 内容项：
 * - msgbox:text — 标题文本
 * - msgbox:content — 内容文本
 * - msgbox:field — prompt 输入框（事件：input → handleInput）
 * - msgbox:cancel — 取消按钮（事件：click → handleCancel）
 * - msgbox:confirm — 确认按钮（事件：click → handleConfirm）
 */
export const MSGBOX_TEMPLATE: JsonTemplateNode[] = [
    { tag: 'div', class: 'q-msgbox__header', children: [
        { tag: 'span', content: 'msgbox:text', class: 'q-msgbox__title' },
    ]},
    { tag: 'div', class: 'q-msgbox__body', children: [
        { tag: 'span', content: 'msgbox:content', class: 'q-msgbox__content' },
        { tag: 'input', content: 'msgbox:field', event: 'input', class: 'q-msgbox__input', style: 'display:none;' },
    ]},
    { tag: 'div', class: 'q-msgbox__footer', children: [
        { tag: 'button', content: 'msgbox:cancel', event: 'click', class: 'q-msgbox__btn q-msgbox__btn--cancel', text: '\u53d6\u6d88' },
        { tag: 'button', content: 'msgbox:confirm', event: 'click', class: 'q-msgbox__btn q-msgbox__btn--confirm', text: '\u786e\u5b9a' },
    ]},
];

/**
 * Badge 角标模板
 *
 * 内容项：
 * - badge:default — 角标文本
 */
export const BADGE_TEMPLATE: JsonTemplateNode[] = [
    { tag: 'span', content: 'badge:default', class: 'q-badge__content' },
];

/**
 * 所有组件模板预设
 *
 * key 为组件类型或模板 ID（对应 ComponentTypes / templateId），value 为 JSON 模板数组
 */
export const COMPONENT_TEMPLATES: Record<string, JsonTemplateNode[]> = {
    Button: BUTTON_TEMPLATE,
    Input: INPUT_TEMPLATE,
    'Input:top': INPUT_TOP_TEMPLATE,
    Select: SELECT_TEMPLATE,
    Toolbar: TOOLBAR_TEMPLATE,
    Icon: ICON_TEMPLATE,
    Text: TEXT_TEMPLATE,
    Table: TABLE_TEMPLATE,
    Dialog: DIALOG_TEMPLATE,
    Tips: TIPS_TEMPLATE,
    Dropdown: DROPDOWN_TEMPLATE,
    Popover: POPOVER_TEMPLATE,
    Toast: TOAST_TEMPLATE,
    ToastNotification: TOAST_NOTIFICATION_TEMPLATE,
    Msgbox: MSGBOX_TEMPLATE,
    Badge: BADGE_TEMPLATE,
};
