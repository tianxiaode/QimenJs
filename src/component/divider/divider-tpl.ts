import type { TemplateDecl } from '@/component-core';

/** 分割线模板定义 */
export const DIVIDER_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-divider',
    attributes: { role: 'separator' },
    children: [{ tag: 'span', name: 'text', classes: 'q-divider__text hidden' }],
};