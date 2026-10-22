import type { TemplateDecl } from '@/component-core';

export const SEARCH_BAR_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-list__search',
    children: [
        { tag: 'i', name: 'icon', classes: 'q-icon-search q-list__search-icon' },
        { tag: 'input', name: 'input', classes: 'q-list__search-input', attributes: { type: 'text', placeholder: '搜索...' } },
    ],
};
