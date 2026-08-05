import type { TplNode } from '@/component-core';

/** 创建表头单元格模板 */
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

/** 基础表头单元格模板定义 */
export const BASE_HEADER_CELL_TPL: TplNode = createHeaderCellTpl({
    tag: 'div',
    name: 'content',
    cls: 'q-header-cell__content',
    children: [{ tag: 'span', name: 'title', cls: 'q-header-cell__title' }],
});
