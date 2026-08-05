import type { TplNode } from '@/component-core';

/** 图标模板定义 */
export const ICON_TPL: TplNode = {
    tag: 'div',
    cls: 'q-icon-wrap',
    children: [
        {
            tag: 'i',
            name: 'content',
            cls: 'q-icon',
        },
    ],
};
