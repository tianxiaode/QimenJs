import type { TplNode } from '@/component-core';

/** 评分模板定义 */
export const RATING_TPL: TplNode = {
    tag: 'div',
    name: 'stars',
    cls: 'q-rating',
    attrs: { role: 'slider' },
};
