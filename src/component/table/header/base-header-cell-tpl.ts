import type { TplNode } from '@/component-core';

export function createHeaderCellTpl(contentNode: TplNode): TplNode {
    return {
        tag: 'div',
        cls: 'q-header-cell',
        children: [
            contentNode,
            { tag: 'span', name: 'resizeHandle', cls: 'q-header-cell__resize' },
        ],
    };
}

export const BASE_HEADER_CELL_TPL: TplNode = createHeaderCellTpl({
    tag: 'div',
    name: 'content',
    cls: 'q-header-cell__content',
    children: [{ tag: 'span', name: 'title', cls: 'q-header-cell__title' }],
});
