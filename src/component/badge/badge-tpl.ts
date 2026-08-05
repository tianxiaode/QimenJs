import type { TplNode } from '@/component-core';

/** 徽标模板定义 */
export const BADGE_TPL: TplNode = {
    tag: 'div',
    children: [{ tag: 'span', name: 'text', cls: 'q-badge__content' }],
};
