import type { TemplateDecl } from '@/component-core';
import { createHeaderCellTpl } from './base-header-cell-tpl';

export const LEAF_HEADER_CELL_TPL: TemplateDecl = createHeaderCellTpl({
    tag: 'div',
    name: 'content',
    classes: 'q-header-cell__content',
    children: [
        { tag: 'span', name: 'title', classes: 'q-header-cell__title' },
        { tag: 'span', name: 'sortIcon', classes: 'q-header-cell__sort' },
        { tag: 'span', name: 'menuIcon', classes: 'q-header-cell__menu-icon' },
    ],
}, [
    {
        tag: 'div',
        name: 'menu',
        classes: 'q-header-cell__menu',
        children: [
            { tag: 'div', name: 'sortAscItem', classes: 'q-header-cell__menu-item' },
            { tag: 'div', name: 'sortDescItem', classes: 'q-header-cell__menu-item' },
            { tag: 'div', name: 'hideColumnItem', classes: 'q-header-cell__menu-item' },
        ],
    },
]);
