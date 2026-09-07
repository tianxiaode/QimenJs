import type { TemplateDecl } from '@/component-core';

/** 属性网格模板定义 */
export const PROPERTY_GRID_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-pgrid',
    children: [{ tag: 'div', name: 'grid', classes: 'q-pgrid__grid' }],
};
