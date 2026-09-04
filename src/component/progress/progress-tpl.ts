import type { TemplateDecl } from '@/component-core';

/** 进度条模板定义 */
export const PROGRESS_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-progress',
    attributes: { role: 'progressbar' },
    children: [
        {
            tag: 'div',
            classes: 'q-progress__track',
            children: [{ tag: 'div', name: 'bar', classes: 'q-progress__bar' }],
        },
        { tag: 'span', name: 'text', classes: 'q-progress__text hidden' },
    ],
};