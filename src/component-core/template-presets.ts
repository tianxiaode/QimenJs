/**
 * 组件模板预设（新格式�? *
 * 所有模板使�?ComponentTemplate 格式定义�? * - tpl: 根节点定义，包含 children
 * - body: 复制到组件实例的属性和方法
 *
 * 新格式特性：
 * - name 替代 content 作为 nodeMap 索引�? * - content 作为语义描述（title/text/icon�? * - events/forwards/bridges 三类事件分离
 * - style 支持字符串和对象
 */

import type { ComponentTemplate } from './types/template';

/**
 * 按钮模板
 *
 * 节点�? * - button:icon �?图标
 * - button:text �?文本
 * - button:expand �?下拉展开箭头（默认隐藏，配置下拉时显示）
 */
export const BUTTON_TEMPLATE: ComponentTemplate = {
    tpl: {
        tag: 'div',
        children: [
            { tag: 'span', name: 'button:icon' },
            { tag: 'span', name: 'button:text' },
            {
                tag: 'div',
                name: 'button:expand',
                cls: 'q-expand-arrow q-expand-arrow--collapsed',
                hidden: true,
                children: [{ tag: 'i' }],
            },
        ],
    },
};

/**
 * Ã¨Â¾ÂÃ¥ÂÂ¥Ã¦Â¡ÂÃ¦Â¨Â¡Ã¦ÂÂ¿Ã¯Â¼Âlabel Ã¥ÂÂ¨Ã¥Â·Â¦Ã¤Â¾Â§Ã¯Â¼ÂÃ©Â»ÂÃ¨Â®Â¤Ã¥Â¸ÂÃ¥Â±ÂÃ¯Â¿Â½? *
 * Ã¨ÂÂÃ§ÂÂ¹Ã¯Â¿Â½? * - input:label Ã¯Â¿Â½?Ã¦Â ÂÃ§Â­Â¾Ã¦ÂÂÃ¦ÂÂ¬
 * - input:prefix Ã¯Â¿Â½?Ã¥ÂÂÃ§Â¼ÂÃ¦ÂÂÃ¦ÂÂ¬
 * - input:field Ã¯Â¿Â½?Ã¨Â¾ÂÃ¥ÂÂ¥Ã¦Â¡ÂÃ¯Â¼ÂÃ¥ÂÂÃ©ÂÂ¨Ã¤ÂºÂÃ¤Â»Â¶Ã¯Â¼ÂinputÃ¯Â¿Â½? * - input:suffix Ã¯Â¿Â½?Ã¥ÂÂÃ§Â¼ÂÃ¦ÂÂÃ¦ÂÂ¬
 * - input:error Ã¯Â¿Â½?Ã©ÂÂÃ¨Â¯Â¯Ã¦ÂÂÃ§Â¤Âº
 * - input:hint Ã¯Â¿Â½?Ã¦ÂÂÃ§Â¤ÂºÃ¦ÂÂÃ¦ÂÂ¬
 */
export const INPUT_TEMPLATE: ComponentTemplate = {
    tpl: {
        tag: 'div',
        children: [
            {
                tag: 'span',
                name: 'input:label',
                cls: 'q-input__text q-input__text--label',
            },
            {
                tag: 'span',
                name: 'input:prefix',
                cls: 'q-input__text q-input__text--prefix',
            },
            {
                tag: 'input',
                name: 'input:field',
                cls: 'q-input__field',
            },
            {
                tag: 'span',
                name: 'input:suffix',
                cls: 'q-input__text q-input__text--suffix',
            },
            {
                tag: 'span',
                name: 'input:error',
                cls: 'q-input__text q-input__text--error',
            },
            {
                tag: 'span',
                name: 'input:hint',
                cls: 'q-input__text q-input__text--hint',
            },
        ],
    },
    tplEvents: {
        'input:field': { input: { handler: true } },
    },
};

/**
 * ÃÂÃÂ¨ÃÂÃÂ¾ÃÂÃÂÃÂÃÂ¥ÃÂÃÂÃÂÃÂ¥ÃÂÃÂ¦ÃÂÃÂ¡ÃÂÃÂÃÂÃÂ¦ÃÂÃÂ¨ÃÂÃÂ¡ÃÂÃÂ¦ÃÂÃÂÃÂÃÂ¿ÃÂÃÂ¯ÃÂÃÂ¼ÃÂÃÂlabel ÃÂÃÂ¥ÃÂÃÂÃÂÃÂ¨ÃÂÃÂ¤ÃÂÃÂ¸ÃÂÃÂÃÂÃÂ¦ÃÂÃÂÃÂÃÂ¹ÃÂÃÂ¯ÃÂÃÂ¼ÃÂÃÂ
 */
export const INPUT_TOP_TEMPLATE: ComponentTemplate = {
    tpl: {
        tag: 'div',
        children: [
            {
                tag: 'span',
                name: 'input:label',
                cls: 'q-input__text q-input__text--label',
            },
            {
                tag: 'div',
                cls: 'q-input__field-wrap',
                children: [
                    {
                        tag: 'span',
                        name: 'input:prefix',
                        cls: 'q-input__text q-input__text--prefix',
                    },
                    {
                        tag: 'input',
                        name: 'input:field',
                        cls: 'q-input__field',
                    },
                    {
                        tag: 'span',
                        name: 'input:suffix',
                        cls: 'q-input__text q-input__text--suffix',
                    },
                ],
            },
            {
                tag: 'span',
                name: 'input:error',
                cls: 'q-input__text q-input__text--error',
            },
            {
                tag: 'span',
                name: 'input:hint',
                cls: 'q-input__text q-input__text--hint',
            },
        ],
    },
    tplEvents: {
        'input:field': { input: { handler: true } },
    },
};

/**
 * ÃÂÃÂ¤ÃÂÃÂ¸ÃÂÃÂÃÂÃÂ¦ÃÂÃÂÃÂÃÂÃÂÃÂ©ÃÂÃÂÃÂÃÂÃÂÃÂ¦ÃÂÃÂÃÂÃÂ©ÃÂÃÂ¦ÃÂÃÂ¨ÃÂÃÂ¡ÃÂÃÂ¦ÃÂÃÂÃÂÃÂ¿
 *
 * ÃÂÃÂ¨ÃÂÃÂÃÂÃÂÃÂÃÂ§ÃÂÃÂÃÂÃÂ¹ÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½? * - select:label ÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½?ÃÂÃÂ¦ÃÂÃÂ ÃÂÃÂÃÂÃÂ§ÃÂÃÂ­ÃÂÃÂ¾ÃÂÃÂ¦ÃÂÃÂÃÂÃÂÃÂÃÂ¦ÃÂÃÂÃÂÃÂ¬
 * - select:field ÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½?ÃÂÃÂ¤ÃÂÃÂ¸ÃÂÃÂÃÂÃÂ¦ÃÂÃÂÃÂÃÂÃÂÃÂ¦ÃÂÃÂ¡ÃÂÃÂÃÂÃÂ¯ÃÂÃÂ¼ÃÂÃÂÃÂÃÂ¥ÃÂÃÂÃÂÃÂÃÂÃÂ©ÃÂÃÂÃÂÃÂ¨ÃÂÃÂ¤ÃÂÃÂºÃÂÃÂÃÂÃÂ¤ÃÂÃÂ»ÃÂÃÂ¶ÃÂÃÂ¯ÃÂÃÂ¼ÃÂÃÂchangeÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½? * - select:expand ÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½?ÃÂÃÂ¤ÃÂÃÂ¸ÃÂÃÂÃÂÃÂ¦ÃÂÃÂÃÂÃÂÃÂÃÂ¥ÃÂÃÂ±ÃÂÃÂÃÂÃÂ¥ÃÂÃÂ¼ÃÂÃÂÃÂÃÂ§ÃÂÃÂ®ÃÂÃÂ­ÃÂÃÂ¥ÃÂÃÂ¤ÃÂÃÂ´ÃÂÃÂ¯ÃÂÃÂ¼ÃÂÃÂÃÂÃÂ©ÃÂÃÂ»ÃÂÃÂÃÂÃÂ¨ÃÂÃÂ®ÃÂÃÂ¤ÃÂÃÂ©ÃÂÃÂÃÂÃÂÃÂÃÂ¨ÃÂÃÂÃÂÃÂÃÂÃÂ¯ÃÂÃÂ¼ÃÂÃÂ
 */
export const SELECT_TEMPLATE: ComponentTemplate = {
    tpl: {
        tag: 'div',
        children: [
            { tag: 'span', name: 'select:label' },
            {
                tag: 'select',
                name: 'select:field',
                cls: 'q-select__field',
            },
            {
                tag: 'div',
                name: 'select:expand',
                cls: 'q-expand-arrow q-expand-arrow--collapsed',
                hidden: true,
                children: [{ tag: 'i' }],
            },
        ],
    },
    tplEvents: {
        'select:field': { change: { handler: true } },
    },
};

/**
 * ÃÂÃÂ¥ÃÂÃÂ·ÃÂÃÂ¥ÃÂÃÂ¥ÃÂÃÂÃÂÃÂ·ÃÂÃÂ¦ÃÂÃÂ ÃÂÃÂÃÂÃÂ¦ÃÂÃÂ¨ÃÂÃÂ¡ÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½? *
 * ÃÂÃÂ¨ÃÂÃÂÃÂÃÂÃÂÃÂ§ÃÂÃÂÃÂÃÂ¹ÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½? * - toolbar:prevBtn ÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½?ÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½?ÃÂÃÂ¤ÃÂÃÂ¸ÃÂÃÂÃÂÃÂ§ÃÂÃÂ®ÃÂÃÂ­ÃÂÃÂ¥ÃÂÃÂ¤ÃÂÃÂ´ÃÂÃÂ¦ÃÂÃÂÃÂÃÂÃÂÃÂ©ÃÂÃÂÃÂÃÂ®ÃÂÃÂ¯ÃÂÃÂ¼ÃÂÃÂÃÂÃÂ©ÃÂÃÂ»ÃÂÃÂÃÂÃÂ¨ÃÂÃÂ®ÃÂÃÂ¤ÃÂÃÂ©ÃÂÃÂÃÂÃÂÃÂÃÂ¨ÃÂÃÂÃÂÃÂÃÂÃÂ¯ÃÂÃÂ¼ÃÂÃÂÃÂÃÂ¥ÃÂÃÂÃÂÃÂÃÂÃÂ©ÃÂÃÂÃÂÃÂ¨ÃÂÃÂ¤ÃÂÃÂºÃÂÃÂÃÂÃÂ¤ÃÂÃÂ»ÃÂÃÂ¶ÃÂÃÂ¯ÃÂÃÂ¼ÃÂÃÂclickÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½? * - toolbar:contentArea ÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½?ÃÂÃÂ¥ÃÂÃÂ­ÃÂÃÂÃÂÃÂ©ÃÂÃÂ¡ÃÂÃÂ¹ÃÂÃÂ¥ÃÂÃÂ®ÃÂÃÂ¹ÃÂÃÂ¥ÃÂÃÂÃÂÃÂ¨
 * - toolbar:nextBtn ÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½?ÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½?ÃÂÃÂ¤ÃÂÃÂ¸ÃÂÃÂÃÂÃÂ§ÃÂÃÂ®ÃÂÃÂ­ÃÂÃÂ¥ÃÂÃÂ¤ÃÂÃÂ´ÃÂÃÂ¦ÃÂÃÂÃÂÃÂÃÂÃÂ©ÃÂÃÂÃÂÃÂ®ÃÂÃÂ¯ÃÂÃÂ¼ÃÂÃÂÃÂÃÂ©ÃÂÃÂ»ÃÂÃÂÃÂÃÂ¨ÃÂÃÂ®ÃÂÃÂ¤ÃÂÃÂ©ÃÂÃÂÃÂÃÂÃÂÃÂ¨ÃÂÃÂÃÂÃÂÃÂÃÂ¯ÃÂÃÂ¼ÃÂÃÂÃÂÃÂ¥ÃÂÃÂÃÂÃÂÃÂÃÂ©ÃÂÃÂÃÂÃÂ¨ÃÂÃÂ¤ÃÂÃÂºÃÂÃÂÃÂÃÂ¤ÃÂÃÂ»ÃÂÃÂ¶ÃÂÃÂ¯ÃÂÃÂ¼ÃÂÃÂclickÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½? * - toolbar:triggerBtn ÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½?ÃÂÃÂ¤ÃÂÃÂ¸ÃÂÃÂÃÂÃÂ¦ÃÂÃÂÃÂÃÂÃÂÃÂ¨ÃÂÃÂ§ÃÂÃÂ¦ÃÂÃÂ¥ÃÂÃÂÃÂÃÂÃÂÃÂ¦ÃÂÃÂÃÂÃÂÃÂÃÂ©ÃÂÃÂÃÂÃÂ®ÃÂÃÂ¯ÃÂÃÂ¼ÃÂÃÂÃÂÃÂ©ÃÂÃÂ»ÃÂÃÂÃÂÃÂ¨ÃÂÃÂ®ÃÂÃÂ¤ÃÂÃÂ©ÃÂÃÂÃÂÃÂÃÂÃÂ¨ÃÂÃÂÃÂÃÂÃÂÃÂ¯ÃÂÃÂ¼ÃÂÃÂÃÂÃÂ¥ÃÂÃÂÃÂÃÂÃÂÃÂ©ÃÂÃÂÃÂÃÂ¨ÃÂÃÂ¤ÃÂÃÂºÃÂÃÂÃÂÃÂ¤ÃÂÃÂ»ÃÂÃÂ¶ÃÂÃÂ¯ÃÂÃÂ¼ÃÂÃÂclickÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½? * - toolbar:menuPanel ÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½?ÃÂÃÂ¤ÃÂÃÂ¸ÃÂÃÂÃÂÃÂ¦ÃÂÃÂÃÂÃÂÃÂÃÂ¨ÃÂÃÂÃÂÃÂÃÂÃÂ¥ÃÂÃÂÃÂÃÂÃÂÃÂ©ÃÂÃÂÃÂÃÂ¢ÃÂÃÂ¦ÃÂÃÂÃÂÃÂ¿ÃÂÃÂ¯ÃÂÃÂ¼ÃÂÃÂÃÂÃÂ©ÃÂÃÂ»ÃÂÃÂÃÂÃÂ¨ÃÂÃÂ®ÃÂÃÂ¤ÃÂÃÂ©ÃÂÃÂÃÂÃÂÃÂÃÂ¨ÃÂÃÂÃÂÃÂÃÂÃÂ¯ÃÂÃÂ¼ÃÂÃÂ
 */
export const TOOLBAR_TEMPLATE: ComponentTemplate = {
    tpl: {
        tag: 'div',
        children: [
            {
                tag: 'div',
                name: 'toolbar:prevBtn',
                cls: 'q-overflow-arrow q-overflow-arrow--prev',
                hidden: true,
                children: [{ tag: 'i' }],
            },
            {
                tag: 'div',
                name: 'toolbar:contentArea',
                cls: 'q-toolbar__content',
                style: 'display:flex;',
            },
            {
                tag: 'div',
                name: 'toolbar:nextBtn',
                cls: 'q-overflow-arrow q-overflow-arrow--next',
                hidden: true,
                children: [{ tag: 'i' }],
            },
            {
                tag: 'button',
                name: 'toolbar:triggerBtn',
                cls: 'q-overflow-menu__trigger',
                hidden: true,
            },
            {
                tag: 'div',
                name: 'toolbar:menuPanel',
                cls: 'q-overflow-menu__panel',
                hidden: true,
                style: 'position:absolute;',
            },
        ],
    },
    tplEvents: {
        'toolbar:prevBtn': { click: { handler: 'onPrev' } },
        'toolbar:nextBtn': { click: { handler: 'onNext' } },
        'toolbar:triggerBtn': { click: { handler: 'onTrigger' } },
    },
};

/**
 * ÃÂÃÂ¥ÃÂÃÂÃÂÃÂ¾ÃÂÃÂ¦ÃÂÃÂ ÃÂÃÂÃÂÃÂ¦ÃÂÃÂ¨ÃÂÃÂ¡ÃÂÃÂ¦ÃÂÃÂÃÂÃÂ¿ÃÂÃÂ¯ÃÂÃÂ¼ÃÂÃÂÃÂÃÂ§ÃÂÃÂ»ÃÂÃÂÃÂÃÂ¤ÃÂÃÂ»ÃÂÃÂ¶ÃÂÃÂ§ÃÂÃÂÃÂÃÂ´ÃÂÃÂ¦ÃÂÃÂÃÂÃÂ¥ÃÂÃÂ§ÃÂÃÂ®ÃÂÃÂ¡ÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½?DOMÃÂÃÂ¯ÃÂÃÂ¼ÃÂÃÂÃÂÃÂ¦ÃÂÃÂÃÂÃÂ ÃÂÃÂ©ÃÂÃÂÃÂÃÂÃÂÃÂ¨ÃÂÃÂÃÂÃÂÃÂÃÂ§ÃÂÃÂÃÂÃÂ¹ÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½? */
export const ICON_TEMPLATE: ComponentTemplate = {
    tpl: { tag: 'div' },
};

/**
 * ÃÂÃÂ¦ÃÂÃÂÃÂÃÂÃÂÃÂ¦ÃÂÃÂÃÂÃÂ¬ÃÂÃÂ¦ÃÂÃÂ¨ÃÂÃÂ¡ÃÂÃÂ¦ÃÂÃÂÃÂÃÂ¿ÃÂÃÂ¯ÃÂÃÂ¼ÃÂÃÂÃÂÃÂ§ÃÂÃÂ»ÃÂÃÂÃÂÃÂ¤ÃÂÃÂ»ÃÂÃÂ¶ÃÂÃÂ§ÃÂÃÂÃÂÃÂ´ÃÂÃÂ¦ÃÂÃÂÃÂÃÂ¥ÃÂÃÂ§ÃÂÃÂ®ÃÂÃÂ¡ÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½?DOMÃÂÃÂ¯ÃÂÃÂ¼ÃÂÃÂÃÂÃÂ¦ÃÂÃÂÃÂÃÂ ÃÂÃÂ©ÃÂÃÂÃÂÃÂÃÂÃÂ¨ÃÂÃÂÃÂÃÂÃÂÃÂ§ÃÂÃÂÃÂÃÂ¹ÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½? */
export const TEXT_TEMPLATE: ComponentTemplate = {
    tpl: { tag: 'span' },
};

/**
 * ÃÂÃÂ¨ÃÂÃÂ¡ÃÂÃÂ¨ÃÂÃÂ¦ÃÂÃÂ ÃÂÃÂ¼ÃÂÃÂ¦ÃÂÃÂ¨ÃÂÃÂ¡ÃÂÃÂ¦ÃÂÃÂÃÂÃÂ¿
 *
 * ÃÂÃÂ¨ÃÂÃÂÃÂÃÂÃÂÃÂ§ÃÂÃÂÃÂÃÂ¹ÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½? * - table:headerRow ÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½?ÃÂÃÂ¨ÃÂÃÂ¡ÃÂÃÂ¨ÃÂÃÂ¥ÃÂÃÂ¤ÃÂÃÂ´ÃÂÃÂ¥ÃÂÃÂ®ÃÂÃÂ¹ÃÂÃÂ¥ÃÂÃÂÃÂÃÂ¨
 * - table:bodyScroll ÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½?ÃÂÃÂ¨ÃÂÃÂ¡ÃÂÃÂ¨ÃÂÃÂ¤ÃÂÃÂ½ÃÂÃÂÃÂÃÂ¥ÃÂÃÂ®ÃÂÃÂ¹ÃÂÃÂ¥ÃÂÃÂÃÂÃÂ¨ÃÂÃÂ¯ÃÂÃÂ¼ÃÂÃÂÃÂÃÂ¥ÃÂÃÂÃÂÃÂÃÂÃÂ©ÃÂÃÂÃÂÃÂ¨ÃÂÃÂ¤ÃÂÃÂºÃÂÃÂÃÂÃÂ¤ÃÂÃÂ»ÃÂÃÂ¶ÃÂÃÂ¯ÃÂÃÂ¼ÃÂÃÂscrollÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½? */
export const TABLE_TEMPLATE: ComponentTemplate = {
    tpl: {
        tag: 'div',
        children: [
            { tag: 'div', name: 'table:headerRow', cls: 'q-table__header' },
            {
                tag: 'div',
                name: 'table:bodyScroll',
                cls: 'q-table__body',
                style: 'overflow-y: auto;',
            },
        ],
    },
    tplEvents: {
        'table:bodyScroll': { scroll: { handler: true } },
    },
};

/**
 * ÃÂÃÂ¥ÃÂÃÂ¼ÃÂÃÂ¹ÃÂÃÂ§ÃÂÃÂªÃÂÃÂÃÂÃÂ¦ÃÂÃÂ¨ÃÂÃÂ¡ÃÂÃÂ¦ÃÂÃÂÃÂÃÂ¿
 *
 * ÃÂÃÂ¨ÃÂÃÂÃÂÃÂÃÂÃÂ§ÃÂÃÂÃÂÃÂ¹ÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½? * - dialog:header ÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½?ÃÂÃÂ¥ÃÂÃÂ¤ÃÂÃÂ´ÃÂÃÂ©ÃÂÃÂÃÂÃÂ¨ÃÂÃÂ¥ÃÂÃÂÃÂÃÂºÃÂÃÂ¥ÃÂÃÂÃÂÃÂ
 * - dialog:text ÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½?ÃÂÃÂ¦ÃÂÃÂ ÃÂÃÂÃÂÃÂ©ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ¦ÃÂÃÂÃÂÃÂÃÂÃÂ¦ÃÂÃÂÃÂÃÂ¬
 * - dialog:close ÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½?ÃÂÃÂ¥ÃÂÃÂÃÂÃÂ³ÃÂÃÂ©ÃÂÃÂÃÂÃÂ­ÃÂÃÂ¦ÃÂÃÂÃÂÃÂÃÂÃÂ©ÃÂÃÂÃÂÃÂ®ÃÂÃÂ¯ÃÂÃÂ¼ÃÂÃÂÃÂÃÂ¥ÃÂÃÂÃÂÃÂÃÂÃÂ©ÃÂÃÂÃÂÃÂ¨ÃÂÃÂ¤ÃÂÃÂºÃÂÃÂÃÂÃÂ¤ÃÂÃÂ»ÃÂÃÂ¶ÃÂÃÂ¯ÃÂÃÂ¼ÃÂÃÂclickÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½? * - dialog:body ÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½?ÃÂÃÂ¥ÃÂÃÂÃÂÃÂÃÂÃÂ¥ÃÂÃÂ®ÃÂÃÂ¹ÃÂÃÂ¥ÃÂÃÂÃÂÃÂºÃÂÃÂ¥ÃÂÃÂÃÂÃÂ
 * - dialog:footer ÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½?ÃÂÃÂ¥ÃÂÃÂºÃÂÃÂÃÂÃÂ©ÃÂÃÂÃÂÃÂ¨ÃÂÃÂ¥ÃÂÃÂÃÂÃÂºÃÂÃÂ¥ÃÂÃÂÃÂÃÂ
 */
export const DIALOG_TEMPLATE: ComponentTemplate = {
    tpl: {
        tag: 'div',
        children: [
            {
                tag: 'div',
                name: 'dialog:header',
                cls: 'q-dialog__header',
                children: [
                    {
                        tag: 'span',
                        name: 'dialog:text',
                        cls: 'q-dialog__title',
                    },
                    {
                        tag: 'button',
                        name: 'dialog:close',
                        cls: 'q-dialog__close',
                        text: '\u00d7',
                    },
                ],
            },
            { tag: 'div', name: 'dialog:body', cls: 'q-dialog__body' },
            { tag: 'div', name: 'dialog:footer', cls: 'q-dialog__footer' },
        ],
    },
    tplEvents: {
        'dialog:close': { click: { handler: true } },
    },
};

/**
 * ÃÂÃÂ¦ÃÂÃÂÃÂÃÂÃÂÃÂ§ÃÂÃÂ¤ÃÂÃÂºÃÂÃÂ¦ÃÂÃÂµÃÂÃÂ®ÃÂÃÂ¥ÃÂÃÂ±ÃÂÃÂÃÂÃÂ¦ÃÂÃÂ¨ÃÂÃÂ¡ÃÂÃÂ¦ÃÂÃÂÃÂÃÂ¿
 *
 * ÃÂÃÂ¨ÃÂÃÂÃÂÃÂÃÂÃÂ§ÃÂÃÂÃÂÃÂ¹ÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½? * - tips:default ÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½?ÃÂÃÂ¦ÃÂÃÂÃÂÃÂÃÂÃÂ§ÃÂÃÂ¤ÃÂÃÂºÃÂÃÂ¦ÃÂÃÂÃÂÃÂÃÂÃÂ¦ÃÂÃÂÃÂÃÂ¬
 * - tips:arrow ÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½?ÃÂÃÂ¦ÃÂÃÂµÃÂÃÂ®ÃÂÃÂ¥ÃÂÃÂ±ÃÂÃÂÃÂÃÂ¥ÃÂÃÂ®ÃÂÃÂÃÂÃÂ¤ÃÂÃÂ½ÃÂÃÂÃÂÃÂ§ÃÂÃÂ®ÃÂÃÂ­ÃÂÃÂ¥ÃÂÃÂ¤ÃÂÃÂ´
 */
export const TIPS_TEMPLATE: ComponentTemplate = {
    tpl: {
        tag: 'div',
        children: [
            { tag: 'span', name: 'tips:default', cls: 'q-tips__content' },
            { tag: 'div', name: 'tips:arrow', cls: 'q-arrow' },
        ],
    },
};

/**
 * ÃÂÃÂ¤ÃÂÃÂ¸ÃÂÃÂÃÂÃÂ¦ÃÂÃÂÃÂÃÂÃÂÃÂ¨ÃÂÃÂÃÂÃÂÃÂÃÂ¥ÃÂÃÂÃÂÃÂÃÂÃÂ¦ÃÂÃÂµÃÂÃÂ®ÃÂÃÂ¥ÃÂÃÂ±ÃÂÃÂÃÂÃÂ¦ÃÂÃÂ¨ÃÂÃÂ¡ÃÂÃÂ¦ÃÂÃÂÃÂÃÂ¿
 *
 * ÃÂÃÂ¨ÃÂÃÂÃÂÃÂÃÂÃÂ§ÃÂÃÂÃÂÃÂ¹ÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½? * - dropdown:default ÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½?ÃÂÃÂ¤ÃÂÃÂ¸ÃÂÃÂÃÂÃÂ¦ÃÂÃÂÃÂÃÂÃÂÃÂ¥ÃÂÃÂÃÂÃÂÃÂÃÂ¥ÃÂÃÂ®ÃÂÃÂ¹
 * - dropdown:arrow ÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½?ÃÂÃÂ¦ÃÂÃÂµÃÂÃÂ®ÃÂÃÂ¥ÃÂÃÂ±ÃÂÃÂÃÂÃÂ¥ÃÂÃÂ®ÃÂÃÂÃÂÃÂ¤ÃÂÃÂ½ÃÂÃÂÃÂÃÂ§ÃÂÃÂ®ÃÂÃÂ­ÃÂÃÂ¥ÃÂÃÂ¤ÃÂÃÂ´
 */
export const DROPDOWN_TEMPLATE: ComponentTemplate = {
    tpl: {
        tag: 'div',
        children: [
            { tag: 'div', name: 'dropdown:default', cls: 'q-dropdown__content' },
            { tag: 'div', name: 'dropdown:arrow', cls: 'q-arrow' },
        ],
    },
};

/**
 * ÃÂÃÂ¥ÃÂÃÂ¼ÃÂÃÂ¹ÃÂÃÂ¥ÃÂÃÂÃÂÃÂºÃÂÃÂ¦ÃÂÃÂ¡ÃÂÃÂÃÂÃÂ¦ÃÂÃÂµÃÂÃÂ®ÃÂÃÂ¥ÃÂÃÂ±ÃÂÃÂÃÂÃÂ¦ÃÂÃÂ¨ÃÂÃÂ¡ÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½? *
 * ÃÂÃÂ¨ÃÂÃÂÃÂÃÂÃÂÃÂ§ÃÂÃÂÃÂÃÂ¹ÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½? * - popover:default ÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½?ÃÂÃÂ¥ÃÂÃÂ¼ÃÂÃÂ¹ÃÂÃÂ¥ÃÂÃÂÃÂÃÂºÃÂÃÂ¥ÃÂÃÂÃÂÃÂÃÂÃÂ¥ÃÂÃÂ®ÃÂÃÂ¹
 * - popover:arrow ÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½?ÃÂÃÂ¦ÃÂÃÂµÃÂÃÂ®ÃÂÃÂ¥ÃÂÃÂ±ÃÂÃÂÃÂÃÂ¥ÃÂÃÂ®ÃÂÃÂÃÂÃÂ¤ÃÂÃÂ½ÃÂÃÂÃÂÃÂ§ÃÂÃÂ®ÃÂÃÂ­ÃÂÃÂ¥ÃÂÃÂ¤ÃÂÃÂ´
 */
export const POPOVER_TEMPLATE: ComponentTemplate = {
    tpl: {
        tag: 'div',
        children: [
            { tag: 'div', name: 'popover:default', cls: 'q-popover__content' },
            { tag: 'div', name: 'popover:arrow', cls: 'q-arrow' },
        ],
    },
};

/**
 * Toast ÃÂÃÂ¨ÃÂÃÂ½ÃÂÃÂ»ÃÂÃÂ©ÃÂÃÂÃÂÃÂÃÂÃÂ¦ÃÂÃÂ¨ÃÂÃÂ¡ÃÂÃÂ¦ÃÂÃÂÃÂÃÂ¿ÃÂÃÂ¯ÃÂÃÂ¼ÃÂÃÂÃÂÃÂ¦ÃÂÃÂÃÂÃÂ ÃÂÃÂ¦ÃÂÃÂ ÃÂÃÂÃÂÃÂ©ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½? *
 * ÃÂÃÂ¨ÃÂÃÂÃÂÃÂÃÂÃÂ§ÃÂÃÂÃÂÃÂ¹ÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½? * - toast:icon ÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½?ÃÂÃÂ§ÃÂÃÂ±ÃÂÃÂ»ÃÂÃÂ¥ÃÂÃÂÃÂÃÂÃÂÃÂ¥ÃÂÃÂÃÂÃÂ¾ÃÂÃÂ¦ÃÂÃÂ ÃÂÃÂ
 * - toast:message ÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½?ÃÂÃÂ¦ÃÂÃÂ¶ÃÂÃÂÃÂÃÂ¦ÃÂÃÂÃÂÃÂ¯ÃÂÃÂ¦ÃÂÃÂÃÂÃÂÃÂÃÂ¦ÃÂÃÂÃÂÃÂ¬
 */
export const TOAST_TEMPLATE: ComponentTemplate = {
    tpl: {
        tag: 'div',
        children: [
            { tag: 'div', name: 'toast:icon', cls: 'q-toast__icon' },
            { tag: 'span', name: 'toast:message', cls: 'q-toast__message' },
        ],
    },
};

/**
 * ToastNotification ÃÂÃÂ¥ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ¥ÃÂÃÂ¼ÃÂÃÂºÃÂÃÂ¦ÃÂÃÂ¨ÃÂÃÂ¡ÃÂÃÂ¦ÃÂÃÂÃÂÃÂ¿ÃÂÃÂ¯ÃÂÃÂ¼ÃÂÃÂÃÂÃÂ¦ÃÂÃÂÃÂÃÂÃÂÃÂ¦ÃÂÃÂ ÃÂÃÂÃÂÃÂ©ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½? *
 * ÃÂÃÂ¨ÃÂÃÂÃÂÃÂÃÂÃÂ§ÃÂÃÂÃÂÃÂ¹ÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½? * - toast:text ÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½?ÃÂÃÂ¦ÃÂÃÂ ÃÂÃÂÃÂÃÂ©ÃÂÃÂ¢ÃÂÃÂÃÂÃÂ¦ÃÂÃÂÃÂÃÂÃÂÃÂ¦ÃÂÃÂÃÂÃÂ¬
 * - toast:close ÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½?ÃÂÃÂ¥ÃÂÃÂÃÂÃÂ³ÃÂÃÂ©ÃÂÃÂÃÂÃÂ­ÃÂÃÂ¦ÃÂÃÂÃÂÃÂÃÂÃÂ©ÃÂÃÂÃÂÃÂ®ÃÂÃÂ¯ÃÂÃÂ¼ÃÂÃÂÃÂÃÂ¥ÃÂÃÂÃÂÃÂÃÂÃÂ©ÃÂÃÂÃÂÃÂ¨ÃÂÃÂ¤ÃÂÃÂºÃÂÃÂÃÂÃÂ¤ÃÂÃÂ»ÃÂÃÂ¶ÃÂÃÂ¯ÃÂÃÂ¼ÃÂÃÂclickÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½? * - toast:icon ÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½?ÃÂÃÂ§ÃÂÃÂ±ÃÂÃÂ»ÃÂÃÂ¥ÃÂÃÂÃÂÃÂÃÂÃÂ¥ÃÂÃÂÃÂÃÂ¾ÃÂÃÂ¦ÃÂÃÂ ÃÂÃÂ
 * - toast:message ÃÂÃÂ¯ÃÂÃÂ¿ÃÂÃÂ½?ÃÂÃÂ¦ÃÂÃÂ¶ÃÂÃÂÃÂÃÂ¦ÃÂÃÂÃÂÃÂ¯ÃÂÃÂ¦ÃÂÃÂÃÂÃÂÃÂÃÂ¦ÃÂÃÂÃÂÃÂ¬
 */
export const TOAST_NOTIFICATION_TEMPLATE: ComponentTemplate = {
    tpl: {
        tag: 'div',
        children: [
            {
                tag: 'div',
                cls: 'q-toast__header',
                children: [
                    {
                        tag: 'span',
                        name: 'toast:text',
                        cls: 'q-toast__title',
                    },
                    {
                        tag: 'button',
                        name: 'toast:close',
                        cls: 'q-toast__close',
                        text: '\u00d7',
                    },
                ],
            },
            { tag: 'div', name: 'toast:icon', cls: 'q-toast__icon' },
            { tag: 'span', name: 'toast:message', cls: 'q-toast__message' },
        ],
    },
    tplEvents: {
        'toast:close': { click: { handler: true } },
    },
};

/**
 * ÃÂÃÂ¦ÃÂÃÂ¨ÃÂÃÂ¡ÃÂÃÂ¦ÃÂÃÂÃÂÃÂÃÂÃÂ¦ÃÂÃÂ¶ÃÂÃÂÃÂÃÂ¦ÃÂÃÂÃÂÃÂ¯ÃÂÃÂ¦ÃÂÃÂ¡ÃÂÃÂÃÂÃÂ¦ÃÂÃÂ¨ÃÂÃÂ¡ÃÂÃÂ¦ÃÂÃÂÃÂÃÂ¿
 *
 * ÃÂ¨ÃÂÃÂÃÂ§ÃÂÃÂ¹ÃÂ¯ÃÂ¿ÃÂ½? * - msgbox:text ÃÂ¯ÃÂ¿ÃÂ½?ÃÂ¦ÃÂ ÃÂÃÂ©ÃÂ¢ÃÂÃÂ¦ÃÂÃÂÃÂ¦ÃÂÃÂ¬
 * - msgbox:content ÃÂ¯ÃÂ¿ÃÂ½?ÃÂ¥ÃÂÃÂÃÂ¥ÃÂ®ÃÂ¹ÃÂ¦ÃÂÃÂÃÂ¦ÃÂÃÂ¬
 * - msgbox:field ÃÂ¯ÃÂ¿ÃÂ½?prompt ÃÂ¨ÃÂ¾ÃÂÃÂ¥ÃÂÃÂ¥ÃÂ¦ÃÂ¡ÃÂÃÂ¯ÃÂ¼ÃÂÃÂ¥ÃÂÃÂÃÂ©ÃÂÃÂ¨ÃÂ¤ÃÂºÃÂÃÂ¤ÃÂ»ÃÂ¶ÃÂ¯ÃÂ¼ÃÂinputÃÂ¯ÃÂ¿ÃÂ½? * - msgbox:cancel ÃÂ¯ÃÂ¿ÃÂ½?ÃÂ¥ÃÂÃÂÃÂ¦ÃÂ¶ÃÂÃÂ¦ÃÂÃÂÃÂ©ÃÂÃÂ®ÃÂ¯ÃÂ¼ÃÂÃÂ¥ÃÂÃÂÃÂ©ÃÂÃÂ¨ÃÂ¤ÃÂºÃÂÃÂ¤ÃÂ»ÃÂ¶ÃÂ¯ÃÂ¼ÃÂclickÃÂ¯ÃÂ¿ÃÂ½? * - msgbox:confirm ÃÂ¯ÃÂ¿ÃÂ½?ÃÂ§ÃÂ¡ÃÂ®ÃÂ¨ÃÂ®ÃÂ¤ÃÂ¦ÃÂÃÂÃÂ©ÃÂÃÂ®ÃÂ¯ÃÂ¼ÃÂÃÂ¥ÃÂÃÂÃÂ©ÃÂÃÂ¨ÃÂ¤ÃÂºÃÂÃÂ¤ÃÂ»ÃÂ¶ÃÂ¯ÃÂ¼ÃÂclickÃÂ¯ÃÂ¿ÃÂ½? */
export const MSGBOX_TEMPLATE: ComponentTemplate = {
    tpl: {
        tag: 'div',
        children: [
            {
                tag: 'div',
                cls: 'q-msgbox__header',
                children: [
                    {
                        tag: 'span',
                        name: 'msgbox:text',
                        cls: 'q-msgbox__title',
                    },
                ],
            },
            {
                tag: 'div',
                cls: 'q-msgbox__body',
                children: [
                    {
                        tag: 'span',
                        name: 'msgbox:content',
                        cls: 'q-msgbox__content',
                    },
                    {
                        tag: 'input',
                        name: 'msgbox:field',
                        cls: 'q-msgbox__input',
                        style: 'display:none;',
                    },
                ],
            },
            {
                tag: 'div',
                cls: 'q-msgbox__footer',
                children: [
                    {
                        tag: 'button',
                        name: 'msgbox:cancel',
                        cls: 'q-msgbox__btn q-msgbox__btn--cancel',
                        text: '\u53d6\u6d88',
                    },
                    {
                        tag: 'button',
                        name: 'msgbox:confirm',
                        cls: 'q-msgbox__btn q-msgbox__btn--confirm',
                        text: '\u786e\u5b9a',
                    },
                ],
            },
        ],
    },
    tplEvents: {
        'msgbox:field': { input: { handler: true } },
        'msgbox:cancel': { click: { handler: 'onCancel' } },
        'msgbox:confirm': { click: { handler: 'onConfirm' } },
    },
};

/**
 * Badge Ã¨Â§ÂÃ¦Â ÂÃ¦Â¨Â¡Ã¦ÂÂ¿
 *
 * Ã¨ÂÂÃ§ÂÂ¹Ã¯Â¿Â½? * - badge:default Ã¯Â¿Â½?Ã¨Â§ÂÃ¦Â ÂÃ¦ÂÂÃ¦ÂÂ¬
 */
export const BADGE_TEMPLATE: ComponentTemplate = {
    tpl: {
        tag: 'div',
        children: [{ tag: 'span', name: 'badge:default', cls: 'q-badge__content' }],
    },
};

/**
 * èåé¡¹æ¨¡ï¿½? *
 * èç¹ï¿½? * - menuItem:content ï¿½?æ´è¡å¯ç¹å»åºåï¼åé¨äºä»¶ï¼clickï¿½? * - menuItem:icon ï¿½?å¾æ 
 * - menuItem:text ï¿½?ææ¬
 * - menuItem:shortcut ï¿½?å¿«æ·é®æï¿½? * - menuItem:expand ï¿½?å­èåå±å¼ç®­å¤´ï¼é»è®¤éèï¼
 */
export const MENU_ITEM_TEMPLATE: ComponentTemplate = {
    tpl: {
        tag: 'div',
        children: [
            {
                tag: 'div',
                name: 'menuItem:content',
                cls: 'q-menu-item__content',
                children: [
                    {
                        tag: 'span',
                        name: 'menuItem:icon',
                        cls: 'q-menu-item__icon',
                    },
                    {
                        tag: 'span',
                        name: 'menuItem:text',
                        cls: 'q-menu-item__text',
                    },
                    {
                        tag: 'span',
                        name: 'menuItem:shortcut',
                        cls: 'q-menu-item__shortcut',
                    },
                    {
                        tag: 'div',
                        name: 'menuItem:expand',
                        cls: 'q-expand-arrow q-expand-arrow--collapsed',
                        hidden: true,
                        children: [{ tag: 'i' }],
                    },
                ],
            },
        ],
    },
    tplEvents: {
        'menuItem:content': { click: { handler: true } },
    },
};

/**
 * Ã¨ÂÂÃ¥ÂÂÃ¦Â¨Â¡Ã¦ÂÂ¿
 *
 * Ã¨ÂÂÃ§ÂÂ¹Ã¯Â¿Â½? * - menu:content Ã¯Â¿Â½?Ã¨ÂÂÃ¥ÂÂÃ©Â¡Â¹Ã¥Â®Â¹Ã¯Â¿Â½? */
export const MENU_TEMPLATE: ComponentTemplate = {
    tpl: {
        tag: 'div',
        children: [{ tag: 'div', name: 'menu:content', cls: 'q-menu__content' }],
    },
};

/**
 * Ã©ÂÂ¢Ã¦ÂÂ¿Ã¦Â¨Â¡Ã¦ÂÂ¿
 *
 * Ã¨ÂÂÃ§ÂÂ¹Ã¯Â¿Â½? * - panel:header Ã¯Â¿Â½?Ã¦Â ÂÃ©Â¢ÂÃ¦Â ÂÃ¥Â®Â¹Ã¯Â¿Â½? * - panel:toolsLeft Ã¯Â¿Â½?Ã¥Â·Â¦Ã¤Â¾Â§Ã¥Â·Â¥Ã¥ÂÂ·Ã¥ÂÂ¾Ã¦Â ÂÃ¯Â¿Â½? * - panel:expand Ã¯Â¿Â½?Ã¦ÂÂÃ¥ÂÂ Ã§Â®Â­Ã¥Â¤Â´Ã¯Â¼ÂÃ©Â»ÂÃ¨Â®Â¤Ã©ÂÂÃ¨ÂÂÃ¯Â¼Â
 * - panel:title Ã¯Â¿Â½?Ã¦Â ÂÃ©Â¢ÂÃ¦ÂÂÃ¦ÂÂ¬
 * - panel:toolsRight Ã¯Â¿Â½?Ã¥ÂÂ³Ã¤Â¾Â§Ã¥Â·Â¥Ã¥ÂÂ·Ã¥ÂÂ¾Ã¦Â ÂÃ¯Â¿Â½? * - panel:body Ã¯Â¿Â½?Ã¥ÂÂÃ¥Â®Â¹Ã¥ÂÂºÃ¥ÂÂ
 */
export const PANEL_TEMPLATE: ComponentTemplate = {
    tpl: {
        tag: 'div',
        children: [
            {
                tag: 'div',
                name: 'panel:header',
                cls: 'q-panel__header',
                children: [
                    {
                        tag: 'div',
                        name: 'panel:toolsLeft',
                        cls: 'q-panel__tools q-panel__tools--left',
                    },
                    {
                        tag: 'div',
                        name: 'panel:expand',
                        cls: 'q-expand-arrow q-expand-arrow--collapsed',
                        hidden: true,
                        children: [{ tag: 'i' }],
                    },
                    {
                        tag: 'span',
                        name: 'panel:title',
                        cls: 'q-panel__title',
                    },
                    {
                        tag: 'div',
                        name: 'panel:toolsRight',
                        cls: 'q-panel__tools q-panel__tools--right',
                    },
                ],
            },
            { tag: 'div', name: 'panel:body', cls: 'q-panel__body' },
        ],
    },
};

/**
 * Ã¥Â¯Â¼Ã¨ÂÂªÃ©Â¡Â¹Ã¦Â¨Â¡Ã¯Â¿Â½? *
 * Ã¨ÂÂÃ§ÂÂ¹Ã¯Â¿Â½? * - navItem:content Ã¯Â¿Â½?Ã¥ÂÂ¯Ã§ÂÂ¹Ã¥ÂÂ»Ã¥ÂÂºÃ¥ÂÂÃ¯Â¼ÂÃ¥ÂÂÃ©ÂÂ¨Ã¤ÂºÂÃ¤Â»Â¶Ã¯Â¼ÂclickÃ¯Â¿Â½? * - navItem:icon Ã¯Â¿Â½?Ã¥ÂÂ¾Ã¦Â Â
 * - navItem:text Ã¯Â¿Â½?Ã¦ÂÂÃ¦ÂÂ¬
 */
export const NAVITEM_TEMPLATE: ComponentTemplate = {
    tpl: {
        tag: 'div',
        children: [
            {
                tag: 'div',
                name: 'navItem:content',
                cls: 'q-nav-item__content',
                children: [
                    {
                        tag: 'span',
                        name: 'navItem:icon',
                        cls: 'q-nav-item__icon',
                    },
                    {
                        tag: 'span',
                        name: 'navItem:text',
                        cls: 'q-nav-item__text',
                    },
                ],
            },
        ],
    },
    tplEvents: {
        'navItem:content': { click: { handler: true } },
    },
};

/**
 * 项组模板
 *
 * 节点�? * - items �?子项挂载�? */
export const ITEMGROUP_TEMPLATE: ComponentTemplate = {
    tpl: {
        tag: 'div',
        children: [{ tag: 'div', name: 'items', cls: 'q-itemgroup__items' }],
    },
};

/**
 * 所有组件模板预�? *
 * key 为组件类型或模板 ID，value �?ComponentTemplate
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
