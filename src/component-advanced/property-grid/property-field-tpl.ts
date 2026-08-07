import type { TplNode } from '@/component-core';

/** 属性字段模板定义 */
export const PROPERTY_FIELD_TPL: TplNode = {
    tag: 'div',
    cls: 'q-pgrid__field',
    children: [
        { tag: 'div', name: 'label', cls: 'q-pgrid__label' },
        { tag: 'div', name: 'value', cls: 'q-pgrid__value' },
    ],
};
