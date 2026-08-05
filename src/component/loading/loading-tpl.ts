import type { TplNode } from '@/component-core';

/** 加载模板定义 */
export const LOADING_TPL: TplNode = {
    tag: 'div',
    cls: 'q-loading',
    children: [
        { tag: 'div', name: 'spinner', cls: 'q-loading-spinner' },
        { tag: 'div', name: 'text', cls: 'q-loading-text' },
    ],
};
