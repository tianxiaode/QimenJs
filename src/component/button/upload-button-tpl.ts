import type { TemplateDecl } from '@/component-core';

/** 上传按钮模板定义 */
export const UPLOAD_BUTTON_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-button q-upload-btn',
    children: [
        {
            tag: 'i',
            name: 'icon',
            classes: 'q-button__icon',
        },
        {
            tag: 'span',
            name: 'text',
            classes: 'q-button__text',
        },
        {
            tag: 'div',
            name: 'list',
            classes: 'q-upload-btn__list',
        },
    ],
};
