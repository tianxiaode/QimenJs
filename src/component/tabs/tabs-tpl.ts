/**
 * Tabs 标签页容器模板
 *
 * 结构：tabBar（标签栏） + content（内容区）
 * 位置通过 position 属性控制（top/bottom/left/right）
 */

import type { TplNode } from '@/component-core';

/** 标签页集模板定义 */
export const TABS_TPL: TplNode = {
    tag: 'div',
    cls: 'q-tabs',
    children: [
        { tag: 'div', name: 'tabBar', cls: 'q-tabs__bar' },
        { tag: 'div', name: 'content', cls: 'q-tabs__content' },
    ],
};
