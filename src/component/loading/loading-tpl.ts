/**
 * Loading 模板定义 — 独立于组件类
 */

import type { TplNode } from '@/component-core';

export const LOADING_TPL: TplNode = {
    tag: 'div',
    cls: 'q-loading',
    children: [
        { tag: 'div', name: 'spinner', cls: 'q-loading-spinner' },
        { tag: 'div', name: 'text', cls: 'q-loading-text' },
    ],
};
