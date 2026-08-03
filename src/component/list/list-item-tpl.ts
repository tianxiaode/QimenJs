/**
 * ListItem 模板定义
 *
 * 结构：mark（状态标记） + content（label + description）
 * mark 由 CSS ::before 渲染，status 驱动颜色，markForm 驱动形状
 */

import type { TplNode } from '@/component-core';

export const LIST_ITEM_TPL: TplNode = {
    tag: 'div',
    cls: 'q-list__item',
    attrs: { role: 'listitem' },
    children: [
        { tag: 'div', name: 'mark', cls: 'q-list__mark' },
        {
            tag: 'div',
            name: 'content',
            cls: 'q-list__content',
            children: [
                { tag: 'div', name: 'label', cls: 'q-list__label' },
                { tag: 'div', name: 'desc', cls: 'q-list__desc', hidden: true },
            ],
        },
    ],
};
