import type { TplNode } from '@/component-core';

/** 指示器圆点模板定义 */
export const INDICATOR_DOT_TPL: TplNode = {
    tag: 'span',
    cls: 'q-indicator__dot',
    children: [{ tag: 'span', name: 'text', cls: 'q-indicator__dot-text' }],
};
