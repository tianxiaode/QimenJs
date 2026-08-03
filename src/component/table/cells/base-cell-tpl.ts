import type { TplNode } from '@/component-core';

export function createCellTpl(contentNode: TplNode): TplNode {
    return {
        tag: 'div',
        cls: 'q_cell',
        children: [contentNode],
    };
}

export const BASE_CELL_TPL: TplNode = createCellTpl({
    tag: 'span',
    name: 'content',
    cls: 'q_cell__text',
});
