/**
 * 组件 HTML 模板预设
 *
 * 定义各组件的 HTML 模板片段（不含外层根元素，外层由 ComponentBase.initElement 创建）。
 * ContentManager 在运行时通过 data-content 查找元素并生成属性。
 *
 * 模板片段由 ComponentBase.initElement() 注入到 this.el.innerHTML 中。
 * 支持多模板注册（如 Input:top），通过 static templateId 或 reinitElement() 切换。
 */

/**
 * 按钮模板
 *
 * 内容项：
 * - icon:default — 图标
 * - text:default — 文本
 */
export const BUTTON_TEMPLATE = `
    <span data-content="icon:default"></span>
    <span data-content="text:default"></span>
`;

/**
 * 输入框模板（label 在左侧，默认布局）
 *
 * 内容项：
 * - text:label — 标签文本
 * - text:prefix — 前缀文本（货币符号等）
 * - text:suffix — 后缀文本（单位等）
 * - text:error — 错误提示
 * - text:hint — 提示文本
 *
 * ref 元素：
 * - input — 输入框
 */
export const INPUT_TEMPLATE = `
    <span data-content="text:label" class="q-input__text q-input__text--label"></span>
    <span data-content="text:prefix" class="q-input__text q-input__text--prefix"></span>
    <input data-ref="input" class="q-input__field" />
    <span data-content="text:suffix" class="q-input__text q-input__text--suffix"></span>
    <span data-content="text:error" class="q-input__text q-input__text--error"></span>
    <span data-content="text:hint" class="q-input__text q-input__text--hint"></span>
`;

/**
 * 输入框模板（label 在上方）
 */
export const INPUT_TOP_TEMPLATE = `
    <span data-content="text:label" class="q-input__text q-input__text--label"></span>
    <div class="q-input__field-wrap">
        <span data-content="text:prefix" class="q-input__text q-input__text--prefix"></span>
        <input data-ref="input" class="q-input__field" />
        <span data-content="text:suffix" class="q-input__text q-input__text--suffix"></span>
    </div>
    <span data-content="text:error" class="q-input__text q-input__text--error"></span>
    <span data-content="text:hint" class="q-input__text q-input__text--hint"></span>
`;

/**
 * 下拉选择模板
 *
 * 内容项：
 * - text:default — 标签文本
 *
 * ref 元素：
 * - select — 下拉框
 */
export const SELECT_TEMPLATE = `
    <span data-content="text:default"></span>
    <select data-ref="select" class="q-select__field"></select>
`;

/**
 * 工具栏模板（子项由 ChildrenAbility 动态添加）
 */
export const TOOLBAR_TEMPLATE = '';

/**
 * 图标模板（组件直接管理 DOM，无需内容项）
 */
export const ICON_TEMPLATE = '';

/**
 * 文本模板（组件直接管理 DOM，无需内容项）
 */
export const TEXT_TEMPLATE = '';

/**
 * 表格模板
 *
 * ref 元素：
 * - header — 表头容器
 * - body — 表体容器（虚拟列表滚动容器）
 */
export const TABLE_TEMPLATE = `
    <div class="q-table__header" data-ref="header"></div>
    <div class="q-table__body" data-ref="body" style="overflow-y: auto;"></div>
`;

/**
 * 弹窗模板
 *
 * 内容项：
 * - text:title — 标题文本
 *
 * ref 元素：
 * - header — 头部区域
 * - body — 内容区域
 * - footer — 底部区域
 * - closeBtn — 关闭按钮
 */
export const DIALOG_TEMPLATE = `
    <div class="q-dialog__header" data-ref="header">
        <span data-content="text:title" class="q-dialog__title"></span>
        <button class="q-dialog__close" data-ref="closeBtn">&times;</button>
    </div>
    <div class="q-dialog__body" data-ref="body"></div>
    <div class="q-dialog__footer" data-ref="footer"></div>
`;

/**
 * 提示浮层模板
 *
 * 内容项：
 * - tips:default — 提示文本
 */
export const TIPS_TEMPLATE = `
    <span data-content="tips:default" class="q-tips__content"></span>
`;

/**
 * 下拉菜单浮层模板
 *
 * 内容项：
 * - dropdown:default — 下拉内容
 */
export const DROPDOWN_TEMPLATE = `
    <div data-content="dropdown:default" class="q-dropdown__content"></div>
`;

/**
 * 弹出框浮层模板
 *
 * 内容项：
 * - popover:default — 弹出内容
 */
export const POPOVER_TEMPLATE = `
    <div data-content="popover:default" class="q-popover__content"></div>
`;

/**
 * Toast 轻量模板（无标题）
 *
 * ref 元素：
 * - icon — 类型图标
 * - message — 消息文本
 */
export const TOAST_TEMPLATE = `
    <div class="q-toast__icon" data-ref="icon"></div>
    <span class="q-toast__message" data-ref="message"></span>
`;

/**
 * ToastNotification 增强模板（有标题，覆盖 notification 场景）
 *
 * ref 元素：
 * - title — 标题文本
 * - closeBtn — 关闭按钮
 * - icon — 类型图标
 * - message — 消息文本
 */
export const TOAST_NOTIFICATION_TEMPLATE = `
    <div class="q-toast__header">
        <span class="q-toast__title" data-ref="title"></span>
        <button class="q-toast__close" data-ref="closeBtn">&times;</button>
    </div>
    <div class="q-toast__icon" data-ref="icon"></div>
    <span class="q-toast__message" data-ref="message"></span>
`;

/**
 * Msgbox 模态消息框模板
 *
 * ref 元素：
 * - title — 标题文本
 * - content — 内容文本
 * - input — prompt 输入框
 * - cancelBtn — 取消按钮
 * - confirmBtn — 确认按钮
 */
export const MSGBOX_TEMPLATE = `
    <div class="q-msgbox__header">
        <span class="q-msgbox__title" data-ref="title"></span>
    </div>
    <div class="q-msgbox__body">
        <span class="q-msgbox__content" data-ref="content"></span>
        <input class="q-msgbox__input" data-ref="input" style="display:none;" />
    </div>
    <div class="q-msgbox__footer">
        <button class="q-msgbox__btn q-msgbox__btn--cancel" data-ref="cancelBtn">取消</button>
        <button class="q-msgbox__btn q-msgbox__btn--confirm" data-ref="confirmBtn">确定</button>
    </div>
`;

/**
 * 所有组件模板预设
 *
 * key 为组件类型或模板 ID（对应 ComponentTypes / templateId），value 为 HTML 模板字符串
 */
export const COMPONENT_TEMPLATES: Record<string, string> = {
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
};
