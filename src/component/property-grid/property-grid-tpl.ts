import type { TplNode } from '@/component-core';

/** 属性网格模板定义 */
export const PROPERTY_GRID_TPL: TplNode = {
    tag: 'div',
    cls: 'q-pgrid',
    children: [{ tag: 'div', name: 'grid', cls: 'q-pgrid__grid' }],
};
