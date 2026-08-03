import type { TplNode } from '@/component-core';

export const INDICATOR_DOT_TPL: TplNode = {
    tag: 'span',
    cls: 'q-indicator__dot',
    children: [{ tag: 'span', name: 'text', cls: 'q-indicator__dot-text' }],
};
