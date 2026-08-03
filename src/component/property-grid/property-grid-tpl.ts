/**
 * PropertyGrid 模板定义
 *
 * 结构：grid 容器（CSS Grid 驱动行列布局）
 * 字段行由 PropertyFieldComponent 动态创建
 */

import type { TplNode } from '@/component-core';

export const PROPERTY_GRID_TPL: TplNode = {
    tag: 'div',
    cls: 'q-pgrid',
    children: [{ tag: 'div', name: 'grid', cls: 'q-pgrid__grid' }],
};
