import type { TplNode } from '@/component-core';

/** 进度条模板定义 */
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
