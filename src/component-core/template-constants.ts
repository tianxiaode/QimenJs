/**
 * HTML 模板常量
 *
 * 规范化 data-content 的 prefix:name 命名，避免拼写错误。
 * 模板编写和组件代码都应通过常量引用，而非硬编码字符串。
 *
 * 命名规则：prefix:name
 * - prefix = 功能区域/组件区域（如 input, header, body, footer）
 * - name = 具体内容项（如 label, close, confirm, cancel）
 *
 * @example
 * ```typescript
 * import { Slot } from '@qimenjs/component-core';
 *
 * // 模板中
 * `<span data-content="${Slot.INPUT_LABEL}"></span>`
 * `<input data-content="${Slot.INPUT_FIELD}" />`
 *
 * // 组件中
 * const el = this.el.querySelector(`[data-content="${Slot.INPUT_FIELD}"]`);
 * ```
 */

// ─── 区域前缀（prefix） ───

/** 区域前缀常量 */
export const Area = {
    /** 按钮区 */
    BUTTON: 'button',
    /** 输入框区 */
    INPUT: 'input',
    /** 选择框区 */
    SELECT: 'select',
    /** 标题区 */
    HEADER: 'header',
    /** 内容区 */
    BODY: 'body',
    /** 底部区 */
    FOOTER: 'footer',
    /** 提示浮层 */
    TIPS: 'tips',
    /** 下拉菜单浮层 */
    DROPDOWN: 'dropdown',
    /** 弹出框浮层 */
    POPOVER: 'popover',
    /** Toast */
    TOAST: 'toast',
    /** 消息框 */
    MSGBOX: 'msgbox',
    /** 表格 */
    TABLE: 'table',
    /** 弹窗 */
    DIALOG: 'dialog',
    /** 子组件挂载区 */
    CHILDREN: 'children',
} as const;

export type AreaType = (typeof Area)[keyof typeof Area];

// ─── 内容名称（name） ───

/** 内容名称常量 */
export const Name = {
    /** 默认（单项内容） */
    DEFAULT: 'default',
    /** 标签 */
    LABEL: 'label',
    /** 前缀（如货币符号） */
    PREFIX: 'prefix',
    /** 后缀（如单位） */
    SUFFIX: 'suffix',
    /** 错误提示 */
    ERROR: 'error',
    /** 提示文本 */
    HINT: 'hint',
    /** 文本 */
    TEXT: 'text',
    /** 图标 */
    ICON: 'icon',
    /** 消息 */
    MESSAGE: 'message',
    /** 内容 */
    CONTENT: 'content',
    /** 关闭按钮 */
    CLOSE: 'close',
    /** 确认按钮 */
    CONFIRM: 'confirm',
    /** 取消按钮 */
    CANCEL: 'cancel',
    /** 输入字段 */
    FIELD: 'field',
    /** 表头 */
    HEADER_ROW: 'headerRow',
    /** 表体 */
    BODY_SCROLL: 'bodyScroll',
} as const;

export type NameType = (typeof Name)[keyof typeof Name];

// ─── DOM 事件类型（data-event / data-emit） ───

/** DOM 事件常量 — 用于 data-event（内部事件）和 data-emit（外部事件）属性声明 */
export const Event = {
    /** 点击 */
    CLICK: 'click',
    /** 输入 */
    INPUT: 'input',
    /** 值变更 */
    CHANGE: 'change',
    /** 滚动 */
    SCROLL: 'scroll',
    /** 提交 */
    SUBMIT: 'submit',
    /** 获得焦点 */
    FOCUS: 'focus',
    /** 失去焦点 */
    BLUR: 'blur',
    /** 按键按下 */
    KEYDOWN: 'keydown',
    /** 按键抬起 */
    KEYUP: 'keyup',
    /** 鼠标进入 */
    MOUSEENTER: 'mouseenter',
    /** 鼠标离开 */
    MOUSELEAVE: 'mouseleave',
} as const;

export type EventType = (typeof Event)[keyof typeof Event];

// ─── 组合插槽常量（prefix:name） ───

/**
 * 插槽常量 — prefix:name 组合
 *
 * 所有 data-content 值都应通过此常量引用。
 * 格式：`Area_X_NAME` → `"area:name"`
 */
export const Slot = {
    // ─── Button ───
    BUTTON_ICON: `${Area.BUTTON}:${Name.ICON}`,
    BUTTON_TEXT: `${Area.BUTTON}:${Name.TEXT}`,

    // ─── Input ───
    INPUT_LABEL: `${Area.INPUT}:${Name.LABEL}`,
    INPUT_PREFIX: `${Area.INPUT}:${Name.PREFIX}`,
    INPUT_FIELD: `${Area.INPUT}:${Name.FIELD}`,
    INPUT_SUFFIX: `${Area.INPUT}:${Name.SUFFIX}`,
    INPUT_ERROR: `${Area.INPUT}:${Name.ERROR}`,
    INPUT_HINT: `${Area.INPUT}:${Name.HINT}`,

    // ─── Select ───
    SELECT_LABEL: `${Area.SELECT}:${Name.LABEL}`,
    SELECT_FIELD: `${Area.SELECT}:${Name.FIELD}`,

    // ─── Header ───
    HEADER_TEXT: `${Area.HEADER}:${Name.TEXT}`,
    HEADER_ICON: `${Area.HEADER}:${Name.ICON}`,
    HEADER_CLOSE: `${Area.HEADER}:${Name.CLOSE}`,

    // ─── Body ───
    BODY_DEFAULT: `${Area.BODY}:${Name.DEFAULT}`,

    // ─── Footer ───
    FOOTER_CONFIRM: `${Area.FOOTER}:${Name.CONFIRM}`,
    FOOTER_CANCEL: `${Area.FOOTER}:${Name.CANCEL}`,

    // ─── Tips ───
    TIPS_DEFAULT: `${Area.TIPS}:${Name.DEFAULT}`,

    // ─── Dropdown ───
    DROPDOWN_DEFAULT: `${Area.DROPDOWN}:${Name.DEFAULT}`,

    // ─── Popover ───
    POPOVER_DEFAULT: `${Area.POPOVER}:${Name.DEFAULT}`,

    // ─── Toast ───
    TOAST_ICON: `${Area.TOAST}:${Name.ICON}`,
    TOAST_MESSAGE: `${Area.TOAST}:${Name.MESSAGE}`,
    TOAST_TEXT: `${Area.TOAST}:${Name.TEXT}`,
    TOAST_CLOSE: `${Area.TOAST}:${Name.CLOSE}`,

    // ─── Msgbox ───
    MSGBOX_TEXT: `${Area.MSGBOX}:${Name.TEXT}`,
    MSGBOX_CONTENT: `${Area.MSGBOX}:${Name.CONTENT}`,
    MSGBOX_FIELD: `${Area.MSGBOX}:${Name.FIELD}`,
    MSGBOX_CONFIRM: `${Area.MSGBOX}:${Name.CONFIRM}`,
    MSGBOX_CANCEL: `${Area.MSGBOX}:${Name.CANCEL}`,

    // ─── Table ───
    TABLE_HEADER: `${Area.TABLE}:${Name.HEADER_ROW}`,
    TABLE_BODY: `${Area.TABLE}:${Name.BODY_SCROLL}`,

    // ─── Dialog ───
    DIALOG_TEXT: `${Area.DIALOG}:${Name.TEXT}`,
    DIALOG_CLOSE: `${Area.DIALOG}:${Name.CLOSE}`,
    DIALOG_BODY: `${Area.DIALOG}:body`,
    DIALOG_FOOTER: `${Area.DIALOG}:footer`,

    // ─── Children（子组件挂载点） ───
    CHILDREN_DEFAULT: `${Area.CHILDREN}:${Name.DEFAULT}`,
} as const;

export type SlotType = (typeof Slot)[keyof typeof Slot];
