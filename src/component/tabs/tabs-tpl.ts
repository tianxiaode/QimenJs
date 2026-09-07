/**
 * Tabs 标签页容器模板
 *
 * 结构：tabBar（标签栏） + content（内容区）
 * 位置通过 position 属性控制（top/bottom/left/right）
 */

import type { TemplateDecl } from '@/component-core';

/** 标签页集模板定义 */
export const TABS_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-tabs',
    children: [
        { tag: 'div', name: 'tabBar', classes: 'q-tabs__bar' },
        { tag: 'div', name: 'content', classes: 'q-tabs__content' },
    ],
};
