/**
 * 组件 HTML 模板预设
 *
 * 定义各组件的 HTML 模板片段（不含外层根元素，外层由 ComponentBase.initElement 创建）。
 * ContentManager 在运行时通过 data-content 查找元素并生成属性。
 *
 * 模板片段由 ComponentBase.initElement() 注入到 this.el.innerHTML 中。
 * 支持多模板注册（如 Input:top），通过 static templateId 或 reinitElement() 切换。
 *
 * 命名规则：
 * - data-content="prefix:name" — 元素身份标识（必须）
 * - data-event="event[?modifier][, event]" — 内部事件声明（附属，可选）
 *   方法名从 data-content 自动推导：单 group → onName，多 group → onGroupName
 *   修饰符：?once（只触发一次）、?delegate（事件委托）
 * - data-emit="event[?modifier][, event]" — 外部事件声明（附属，可选）
 *   触发时 this.emit('group:event', event)
 * - data-target="selector" — 事件委托目标选择器（配合 ?delegate 使用）
 */

/**
 * 按钮模板
 *
 * 内容项：
 * - button:icon — 图标
 * - button:text — 文本
 */
export const BUTTON_TEMPLATE = `
    <span data-content="button:icon"></span>
    <span data-content="button:text"></span>
`;

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
export const INPUT_TEMPLATE = `
    <span data-content="input:label" class="q-input__text q-input__text--label"></span>
    <span data-content="input:prefix" class="q-input__text q-input__text--prefix"></span>
    <input data-content="input:field" data-event="input" class="q-input__field" />
    <span data-content="input:suffix" class="q-input__text q-input__text--suffix"></span>
    <span data-content="input:error" class="q-input__text q-input__text--error"></span>
    <span data-content="input:hint" class="q-input__text q-input__text--hint"></span>
`;

/**
 * 输入框模板（label 在上方）
 */
export const INPUT_TOP_TEMPLATE = `
    <span data-content="input:label" class="q-input__text q-input__text--label"></span>
    <div class="q-input__field-wrap">
        <span data-content="input:prefix" class="q-input__text q-input__text--prefix"></span>
        <input data-content="input:field" data-event="input" class="q-input__field" />
        <span data-content="input:suffix" class="q-input__text q-input__text--suffix"></span>
    </div>
    <span data-content="input:error" class="q-input__text q-input__text--error"></span>
    <span data-content="input:hint" class="q-input__text q-input__text--hint"></span>
`;

/**
 * 下拉选择模板
 *
 * 内容项：
 * - select:label — 标签文本
 * - select:field — 下拉框（事件：change → handleChange）
 */
export const SELECT_TEMPLATE = `
    <span data-content="select:label"></span>
    <select data-content="select:field" data-event="change" class="q-select__field"></select>
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
 * 内容项：
 * - table:headerRow — 表头容器
 * - table:bodyScroll — 表体容器（虚拟列表滚动容器，事件：scroll → handleScroll）
 */
export const TABLE_TEMPLATE = `
    <div class="q-table__header" data-content="table:headerRow"></div>
    <div class="q-table__body" data-content="table:bodyScroll" data-event="scroll" style="overflow-y: auto;"></div>
`;

/**
 * 弹窗模板
 *
 * 内容项：
 * - dialog:text — 标题文本
 * - dialog:close — 关闭按钮（事件：click → handleClose）
 * - dialog:body — 内容区域
 * - dialog:footer — 底部区域
 */
export const DIALOG_TEMPLATE = `
    <div class="q-dialog__header" data-content="dialog:header">
        <span data-content="dialog:text" class="q-dialog__title"></span>
        <button class="q-dialog__close" data-content="dialog:close" data-event="click">&times;</button>
    </div>
    <div class="q-dialog__body" data-content="dialog:body"></div>
    <div class="q-dialog__footer" data-content="dialog:footer"></div>
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
 * 内容项：
 * - toast:icon — 类型图标
 * - toast:message — 消息文本
 */
export const TOAST_TEMPLATE = `
    <div class="q-toast__icon" data-content="toast:icon"></div>
    <span class="q-toast__message" data-content="toast:message"></span>
`;

/**
 * ToastNotification 增强模板（有标题，覆盖 notification 场景）
 *
 * 内容项：
 * - toast:text — 标题文本
 * - toast:close — 关闭按钮（事件：click → handleClose）
 * - toast:icon — 类型图标
 * - toast:message — 消息文本
 */
export const TOAST_NOTIFICATION_TEMPLATE = `
    <div class="q-toast__header">
        <span class="q-toast__title" data-content="toast:text"></span>
        <button class="q-toast__close" data-content="toast:close" data-event="click">&times;</button>
    </div>
    <div class="q-toast__icon" data-content="toast:icon"></div>
    <span class="q-toast__message" data-content="toast:message"></span>
`;

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
export const MSGBOX_TEMPLATE = `
    <div class="q-msgbox__header">
        <span class="q-msgbox__title" data-content="msgbox:text"></span>
    </div>
    <div class="q-msgbox__body">
        <span class="q-msgbox__content" data-content="msgbox:content"></span>
        <input class="q-msgbox__input" data-content="msgbox:field" data-event="input" style="display:none;" />
    </div>
    <div class="q-msgbox__footer">
        <button class="q-msgbox__btn q-msgbox__btn--cancel" data-content="msgbox:cancel" data-event="click">取消</button>
        <button class="q-msgbox__btn q-msgbox__btn--confirm" data-content="msgbox:confirm" data-event="click">确定</button>
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
