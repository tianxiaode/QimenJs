/**
 * UploadButton 模板定义 — 独立于组件类
 *
 * 基于 Button 模板，将 dropIcon 替换为文件列表容器 list
 */

import type { TplNode } from '@/component-core';

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
