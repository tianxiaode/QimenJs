/**
 * TimelineItem 模板定义
 *
 * 结构：tail（连接线） + dot（节点） + content（title + description + timestamp）
 * tail 由 CSS :last-child 控制隐藏，pending 态由容器 .q-timeline--pending 驱动显示虚线
 */

import type { TemplateDecl } from '@/component-core';

/** 时间线项模板定义 */
export const TIMELINE_ITEM_TPL: TemplateDecl = {
    tag: 'div',
    cls: 'q-timeline__item',
    attrs: { role: 'listitem' },
    children: [
        { tag: 'div', name: 'tail', classes: 'q-timeline__tail' },
        { tag: 'div', name: 'dot', classes: 'q-timeline__dot' },
        {
            tag: 'div',
            name: 'content',
            cls: 'q-timeline__content',
            children: [
                { tag: 'div', name: 'title', classes: 'q-timeline__title' },
                { tag: 'div', name: 'desc', classes: 'q-timeline__description', hidden: true },
                { tag: 'div', name: 'timestamp', classes: 'q-timeline__timestamp', hidden: true },
            ],
        },
    ],
};
