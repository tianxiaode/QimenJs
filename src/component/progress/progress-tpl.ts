/**
 * Progress 模板定义 — 独立于组件类
 */

import type { TplNode } from '@/component-core';

export const PROGRESS_TPL: TplNode = {
    tag: 'div',
    cls: 'q-progress',
    attrs: { role: 'progressbar' },
    children: [
        {
            tag: 'div',
            cls: 'q-progress__track',
            children: [{ tag: 'div', name: 'bar', cls: 'q-progress__bar' }],
        },
        { tag: 'span', name: 'text', cls: 'q-progress__text', hidden: true },
    ],
};
