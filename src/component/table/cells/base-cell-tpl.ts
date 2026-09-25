import type { TemplateDecl } from '@/component-core';

/** 创建单元格模板 */
export function createCellTpl(contentNode: TemplateDecl): TemplateDecl {
    return {
        tag: 'div',
        classes: 'q_cell',
        children: [contentNode],
    };
}

/** 基础单元格模板定义 */
export const BASE_CELL_TPL: TemplateDecl = createCellTpl({
    tag: 'span',
    name: 'content',
    classes: 'q_cell__text',
});
