/**
 * 组件模板预设（新格式）
 *
 * 所有模板使用 ComponentTemplate 格式定义：
 * - tpl: 根节点定义，包含 children
 * - body: 复制到组件实例的属性和方法
 *
 * 新格式特性：
 * - name 替代 content 作为 nodeMap 索引键
 * - content 作为语义描述（title/text/icon）
 * - events/forwards/bridges 三类事件分离
 * - style 支持字符串和对象
 */

import type { ComponentTemplate } from './template-types';

/**
 * 按钮模板
 *
 * 节点：
 * - button:icon — 图标
 * - button:text — 文本
 * - button:expand — 下拉展开箭头（默认隐藏，配置下拉时显示）
 */
export const BUTTON_TEMPLATE: ComponentTemplate = {
    tpl: {
        tag: 'div',
        children: [
            { tag: 'span', name: 'button:icon', content: 'icon' },
            { tag: 'span', name: 'button:text', content: 'text' },
            { tag: 'div', name: 'button:expand', className: 'q-expand-arrow q-expand-arrow--collapsed', hidden: true, children: [
                { tag: 'i' },
            ]},
        ]
    },
};

/**
 * 输入框模板（label 在左侧，默认布局）
 *
 * 节点：
 * - input:label — 标签文本
 * - input:prefix — 前缀文本
 * - input:field — 输入框（内部事件：input）
 * - input:suffix — 后缀文本
 * - input:error — 错误提示
 * - input:hint — 提示文本
 */
export const INPUT_TEMPLATE: ComponentTemplate = {
    tpl: {
        tag: 'div',
        children: [
            { tag: 'span', name: 'input:label', content: 'text', className: 'q-input__text q-input__text--label' },
            { tag: 'span', name: 'input:prefix', content: 'text', className: 'q-input__text q-input__text--prefix' },
            { tag: 'input', name: 'input:field', content: 'value', events: { input: { handler: true } }, className: 'q-input__field' },
            { tag: 'span', name: 'input:suffix', content: 'text', className: 'q-input__text q-input__text--suffix' },
            { tag: 'span', name: 'input:error', content: 'text', className: 'q-input__text q-input__text--error' },
            { tag: 'span', name: 'input:hint', content: 'text', className: 'q-input__text q-input__text--hint' },
        ]
    },
};

/**
 * 输入框模板（label 在上方）
 */
export const INPUT_TOP_TEMPLATE: ComponentTemplate = {
    tpl: {
        tag: 'div',
        children: [
            { tag: 'span', name: 'input:label', content: 'text', className: 'q-input__text q-input__text--label' },
            { tag: 'div', className: 'q-input__field-wrap', children: [
                { tag: 'span', name: 'input:prefix', content: 'text', className: 'q-input__text q-input__text--prefix' },
                { tag: 'input', name: 'input:field', content: 'value', events: { input: { handler: true } }, className: 'q-input__field' },
                { tag: 'span', name: 'input:suffix', content: 'text', className: 'q-input__text q-input__text--suffix' },
            ]},
            { tag: 'span', name: 'input:error', content: 'text', className: 'q-input__text q-input__text--error' },
            { tag: 'span', name: 'input:hint', content: 'text', className: 'q-input__text q-input__text--hint' },
        ]
    },
};

/**
 * 下拉选择模板
 *
 * 节点：
 * - select:label — 标签文本
 * - select:field — 下拉框（内部事件：change）
 * - select:expand — 下拉展开箭头（默认隐藏）
 */
export const SELECT_TEMPLATE: ComponentTemplate = {
    tpl: {
        tag: 'div',
        children: [
            { tag: 'span', name: 'select:label', content: 'text' },
            { tag: 'select', name: 'select:field', content: 'value', events: { change: { handler: true } }, className: 'q-select__field' },
            { tag: 'div', name: 'select:expand', className: 'q-expand-arrow q-expand-arrow--collapsed', hidden: true, children: [
                { tag: 'i' },
            ]},
        ]
    },
};

/**
 * 工具栏模板
 *
 * 节点：
 * - toolbar:prevBtn — 左/上箭头按钮（默认隐藏，内部事件：click）
 * - toolbar:contentArea — 子项容器
 * - toolbar:nextBtn — 右/下箭头按钮（默认隐藏，内部事件：click）
 * - toolbar:triggerBtn — 下拉触发按钮（默认隐藏，内部事件：click）
 * - toolbar:menuPanel — 下拉菜单面板（默认隐藏）
 */
export const TOOLBAR_TEMPLATE: ComponentTemplate = {
    tpl: {
        tag: 'div',
        children: [
            { tag: 'div', name: 'toolbar:prevBtn', events: { click: { handler: 'onPrev' } }, className: 'q-overflow-arrow q-overflow-arrow--prev', hidden: true, children: [
                { tag: 'i' },
            ]},
            { tag: 'div', name: 'toolbar:contentArea', className: 'q-toolbar__content', style: 'display:flex;' },
            { tag: 'div', name: 'toolbar:nextBtn', events: { click: { handler: 'onNext' } }, className: 'q-overflow-arrow q-overflow-arrow--next', hidden: true, children: [
                { tag: 'i' },
            ]},
            { tag: 'button', name: 'toolbar:triggerBtn', events: { click: { handler: 'onTrigger' } }, className: 'q-overflow-menu__trigger', hidden: true },
            { tag: 'div', name: 'toolbar:menuPanel', className: 'q-overflow-menu__panel', hidden: true, style: 'position:absolute;' },
        ]
    },
};

/**
 * 图标模板（组件直接管理 DOM，无需节点）
 */
export const ICON_TEMPLATE: ComponentTemplate = {
    tpl: { tag: 'div' },
};

/**
 * 文本模板（组件直接管理 DOM，无需节点）
 */
export const TEXT_TEMPLATE: ComponentTemplate = {
    tpl: { tag: 'span' },
};

/**
 * 表格模板
 *
 * 节点：
 * - table:headerRow — 表头容器
 * - table:bodyScroll — 表体容器（内部事件：scroll）
 */
export const TABLE_TEMPLATE: ComponentTemplate = {
    tpl: {
        tag: 'div',
        children: [
            { tag: 'div', name: 'table:headerRow', className: 'q-table__header' },
            { tag: 'div', name: 'table:bodyScroll', events: { scroll: { handler: true } }, className: 'q-table__body', style: 'overflow-y: auto;' },
        ]
    },
};

/**
 * 弹窗模板
 *
 * 节点：
 * - dialog:header — 头部区域
 * - dialog:text — 标题文本
 * - dialog:close — 关闭按钮（内部事件：click）
 * - dialog:body — 内容区域
 * - dialog:footer — 底部区域
 */
export const DIALOG_TEMPLATE: ComponentTemplate = {
    tpl: {
        tag: 'div',
        children: [
            { tag: 'div', name: 'dialog:header', className: 'q-dialog__header', children: [
                { tag: 'span', name: 'dialog:text', content: 'text', className: 'q-dialog__title' },
                { tag: 'button', name: 'dialog:close', events: { click: { handler: true } }, className: 'q-dialog__close', text: '\u00d7' },
            ]},
            { tag: 'div', name: 'dialog:body', className: 'q-dialog__body' },
            { tag: 'div', name: 'dialog:footer', className: 'q-dialog__footer' },
        ]
    },
};

/**
 * 提示浮层模板
 *
 * 节点：
 * - tips:default — 提示文本
 * - tips:arrow — 浮层定位箭头
 */
export const TIPS_TEMPLATE: ComponentTemplate = {
    tpl: {
        tag: 'div',
        children: [
            { tag: 'span', name: 'tips:default', content: 'text', className: 'q-tips__content' },
            { tag: 'div', name: 'tips:arrow', className: 'q-arrow' },
        ]
    },
};

/**
 * 下拉菜单浮层模板
 *
 * 节点：
 * - dropdown:default — 下拉内容
 * - dropdown:arrow — 浮层定位箭头
 */
export const DROPDOWN_TEMPLATE: ComponentTemplate = {
    tpl: {
        tag: 'div',
        children: [
            { tag: 'div', name: 'dropdown:default', className: 'q-dropdown__content' },
            { tag: 'div', name: 'dropdown:arrow', className: 'q-arrow' },
        ]
    },
};

/**
 * 弹出框浮层模板
 *
 * 节点：
 * - popover:default — 弹出内容
 * - popover:arrow — 浮层定位箭头
 */
export const POPOVER_TEMPLATE: ComponentTemplate = {
    tpl: {
        tag: 'div',
        children: [
            { tag: 'div', name: 'popover:default', className: 'q-popover__content' },
            { tag: 'div', name: 'popover:arrow', className: 'q-arrow' },
        ]
    },
};

/**
 * Toast 轻量模板（无标题）
 *
 * 节点：
 * - toast:icon — 类型图标
 * - toast:message — 消息文本
 */
export const TOAST_TEMPLATE: ComponentTemplate = {
    tpl: {
        tag: 'div',
        children: [
            { tag: 'div', name: 'toast:icon', content: 'icon', className: 'q-toast__icon' },
            { tag: 'span', name: 'toast:message', content: 'text', className: 'q-toast__message' },
        ]
    },
};

/**
 * ToastNotification 增强模板（有标题）
 *
 * 节点：
 * - toast:text — 标题文本
 * - toast:close — 关闭按钮（内部事件：click）
 * - toast:icon — 类型图标
 * - toast:message — 消息文本
 */
export const TOAST_NOTIFICATION_TEMPLATE: ComponentTemplate = {
    tpl: {
        tag: 'div',
        children: [
            { tag: 'div', className: 'q-toast__header', children: [
                { tag: 'span', name: 'toast:text', content: 'text', className: 'q-toast__title' },
                { tag: 'button', name: 'toast:close', events: { click: { handler: true } }, className: 'q-toast__close', text: '\u00d7' },
            ]},
            { tag: 'div', name: 'toast:icon', content: 'icon', className: 'q-toast__icon' },
            { tag: 'span', name: 'toast:message', content: 'text', className: 'q-toast__message' },
        ]
    },
};

/**
 * Msgbox 模态消息框模板
 *
 * 节点：
 * - msgbox:text — 标题文本
 * - msgbox:content — 内容文本
 * - msgbox:field — prompt 输入框（内部事件：input）
 * - msgbox:cancel — 取消按钮（内部事件：click）
 * - msgbox:confirm — 确认按钮（内部事件：click）
 */
export const MSGBOX_TEMPLATE: ComponentTemplate = {
    tpl: {
        tag: 'div',
        children: [
            { tag: 'div', className: 'q-msgbox__header', children: [
                { tag: 'span', name: 'msgbox:text', content: 'text', className: 'q-msgbox__title' },
            ]},
            { tag: 'div', className: 'q-msgbox__body', children: [
                { tag: 'span', name: 'msgbox:content', content: 'text', className: 'q-msgbox__content' },
                { tag: 'input', name: 'msgbox:field', content: 'value', events: { input: { handler: true } }, className: 'q-msgbox__input', style: 'display:none;' },
            ]},
            { tag: 'div', className: 'q-msgbox__footer', children: [
                { tag: 'button', name: 'msgbox:cancel', events: { click: { handler: 'onCancel' } }, className: 'q-msgbox__btn q-msgbox__btn--cancel', text: '\u53d6\u6d88' },
                { tag: 'button', name: 'msgbox:confirm', events: { click: { handler: 'onConfirm' } }, className: 'q-msgbox__btn q-msgbox__btn--confirm', text: '\u786e\u5b9a' },
            ]},
        ]
    },
};

/**
 * Badge 角标模板
 *
 * 节点：
 * - badge:default — 角标文本
 */
export const BADGE_TEMPLATE: ComponentTemplate = {
    tpl: {
        tag: 'div',
        children: [
            { tag: 'span', name: 'badge:default', content: 'text', className: 'q-badge__content' },
        ]
    },
};

/**
 * 菜单项模板
 *
 * 节点：
 * - menuItem:content — 整行可点击区域（内部事件：click）
 * - menuItem:icon — 图标
 * - menuItem:text — 文本
 * - menuItem:shortcut — 快捷键文本
 * - menuItem:expand — 子菜单展开箭头（默认隐藏）
 */
export const MENU_ITEM_TEMPLATE: ComponentTemplate = {
    tpl: {
        tag: 'div',
        children: [
            { tag: 'div', name: 'menuItem:content', events: { click: { handler: true } }, className: 'q-menu-item__content', children: [
                { tag: 'span', name: 'menuItem:icon', content: 'icon', className: 'q-menu-item__icon' },
                { tag: 'span', name: 'menuItem:text', content: 'text', className: 'q-menu-item__text' },
                { tag: 'span', name: 'menuItem:shortcut', content: 'text', className: 'q-menu-item__shortcut' },
                { tag: 'div', name: 'menuItem:expand', className: 'q-expand-arrow q-expand-arrow--collapsed', hidden: true, children: [
                    { tag: 'i' },
                ]},
            ]},
        ]
    },
};

/**
 * 菜单模板
 *
 * 节点：
 * - menu:content — 菜单项容器
 */
export const MENU_TEMPLATE: ComponentTemplate = {
    tpl: {
        tag: 'div',
        children: [
            { tag: 'div', name: 'menu:content', className: 'q-menu__content' },
        ]
    },
};

/**
 * 面板模板
 *
 * 节点：
 * - panel:header — 标题栏容器
 * - panel:toolsLeft — 左侧工具图标区
 * - panel:expand — 折叠箭头（默认隐藏）
 * - panel:title — 标题文本
 * - panel:toolsRight — 右侧工具图标区
 * - panel:body — 内容区域
 */
export const PANEL_TEMPLATE: ComponentTemplate = {
    tpl: {
        tag: 'div',
        children: [
            { tag: 'div', name: 'panel:header', className: 'q-panel__header', children: [
                { tag: 'div', name: 'panel:toolsLeft', className: 'q-panel__tools q-panel__tools--left' },
                { tag: 'div', name: 'panel:expand', className: 'q-expand-arrow q-expand-arrow--collapsed', hidden: true, children: [
                    { tag: 'i' },
                ]},
                { tag: 'span', name: 'panel:title', content: 'text', className: 'q-panel__title' },
                { tag: 'div', name: 'panel:toolsRight', className: 'q-panel__tools q-panel__tools--right' },
            ]},
            { tag: 'div', name: 'panel:body', className: 'q-panel__body' },
        ]
    },
};

/**
 * 导航项模板
 *
 * 节点：
 * - navItem:content — 可点击区域（内部事件：click）
 * - navItem:icon — 图标
 * - navItem:text — 文本
 */
export const NAVITEM_TEMPLATE: ComponentTemplate = {
    tpl: {
        tag: 'div',
        children: [
            { tag: 'div', name: 'navItem:content', events: { click: { handler: true } }, className: 'q-nav-item__content', children: [
                { tag: 'span', name: 'navItem:icon', content: 'icon', className: 'q-nav-item__icon' },
                { tag: 'span', name: 'navItem:text', content: 'text', className: 'q-nav-item__text' },
            ]},
        ]
    },
};

/**
 * 项组模板
 *
 * 节点：
 * - itemgroup:default — 子项挂载区
 */
export const ITEMGROUP_TEMPLATE: ComponentTemplate = {
    tpl: {
        tag: 'div',
        children: [
            { tag: 'div', name: 'itemgroup:default', className: 'q-itemgroup__items' },
        ]
    },
};

/**
 * 所有组件模板预设
 *
 * key 为组件类型或模板 ID，value 为 ComponentTemplate
 */
export const COMPONENT_TEMPLATES: Record<string, ComponentTemplate> = {
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
    MenuItem: MENU_ITEM_TEMPLATE,
    Menu: MENU_TEMPLATE,
    Panel: PANEL_TEMPLATE,
    NavItem: NAVITEM_TEMPLATE,
    ItemGroup: ITEMGROUP_TEMPLATE,
};
