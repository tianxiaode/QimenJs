/**
 * PropertyField 模板定义
 *
 * 结构：label（key 标签） + value（值容器）
 * value 内根据 type 动态渲染：text/number/date/boolean/json/array
 * boolean 渲染为只读 checkbox，array 渲染为 chip 列表
 */

import type { TplNode } from '@/component-core/types/tpl-node-types';

export const PROPERTY_FIELD_TPL: TplNode = {
    tag: 'div',
    cls: 'q-pgrid__field',
    children: [
        { tag: 'div', name: 'label', cls: 'q-pgrid__label' },
        { tag: 'div', name: 'value', cls: 'q-pgrid__value' },
    ],
};
