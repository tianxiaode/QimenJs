import type { TemplateDecl } from '@/component-core';

/** 标签组件模板 — 容器 + items 节点（标签通过 HTML 注入） */
export const TAG_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-tags',
    children: [
        { tag: 'div', name: 'items', classes: 'q-tags__items' },
    ],
};
