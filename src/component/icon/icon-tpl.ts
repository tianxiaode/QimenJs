import type { TemplateDecl } from '@/component-core';

/** 图标模板定义 */
export const ICON_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-icon-wrap',
    children: [
        {
            tag: 'i',
            name: 'content',
            classes: 'q-icon',
        },
    ],
};