import type { TplNode } from '@/component-core';

/** 分割线模板定义 */
export const DIVIDER_TPL: TplNode = {
    tag: 'div',
    cls: 'q-divider',
    attrs: { role: 'separator' },
    children: [{ tag: 'span', name: 'text', cls: 'q-divider__text', hidden: true }],
};
