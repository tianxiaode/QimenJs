import type { TemplateDecl } from '@/component-core';

/** 属性字段模板定义 */
export const PROPERTY_FIELD_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-pgrid__field',
    children: [
        { tag: 'div', name: 'label', classes: 'q-pgrid__label' },
        { tag: 'div', name: 'value', classes: 'q-pgrid__value' },
    ],
};
