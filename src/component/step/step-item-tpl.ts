/**
 * StepItem 模板定义
 *
 * 结构：head（圆圈 + 连接线） + body（标题 + 描述）
 * tail 由 CSS :last-child 控制显示
 */

import type { TplNode } from '@/component-core/types/tpl-node-types';

export const STEP_ITEM_TPL: TplNode = {
    tag: 'div',
    cls: 'q-step__item',
    attrs: { role: 'listitem' },
    children: [
        {
            tag: 'div',
            name: 'head',
            cls: 'q-step__head',
            children: [
                {
                    tag: 'div',
                    name: 'circle',
                    cls: 'q-step__circle',
                    children: [{ tag: 'span', name: 'number', cls: 'q-step__number' }],
                },
                { tag: 'div', name: 'tail', cls: 'q-step__tail' },
            ],
        },
        {
            tag: 'div',
            name: 'body',
            cls: 'q-step__body',
            children: [
                { tag: 'div', name: 'title', cls: 'q-step__title' },
                { tag: 'div', name: 'desc', cls: 'q-step__description', hidden: true },
            ],
        },
    ],
};