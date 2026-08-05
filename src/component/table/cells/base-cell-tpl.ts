import type { TplNode } from '@/component-core';

/** 创建单元格模板 */
export function createCellTpl(contentNode: TplNode): TplNode {
    return {
        tag: 'div',
        cls: 'q_cell',
        children: [contentNode],
    };
}

/** 基础单元格模板定义 */
export const BASE_CELL_TPL: TplNode = createCellTpl({
    tag: 'span',
    name: 'content',
    cls: 'q_cell__text',
});
