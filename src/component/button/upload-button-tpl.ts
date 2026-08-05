import type { TplNode } from '@/component-core';

/** 上传按钮模板定义 */
export const UPLOAD_BUTTON_TPL: TplNode = {
    tag: 'div',
    cls: 'q-button q-upload-btn',
    children: [
        {
            tag: 'i',
            name: 'icon',
            cls: 'q-button__icon',
        },
        {
            tag: 'span',
            name: 'text',
            cls: 'q-button__text',
        },
        {
            tag: 'div',
            name: 'list',
            cls: 'q-upload-btn__list',
        },
    ],
};
