import type { TemplateDecl } from '@/component-core';

/** 评分模板定义 */
export const RATING_TPL: TemplateDecl = {
    tag: 'div',
    name: 'stars',
    classes: 'q-rating',
    options: { role: 'slider' },
};
