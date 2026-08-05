import type { TplNode } from '@/component-core';
import { HeaderFragment } from '../header/HeaderFragment';

/** 卡片模板定义 */
export const CARD_TPL: TplNode = {
    tag: 'div',
    cls: 'q-card',
    children: [
        { tag: 'div', cls: 'q-card__header', fragment: HeaderFragment },
        { tag: 'div', name: 'body', cls: 'q-card__body' },
        { tag: 'div', name: 'footer', cls: 'q-card__footer', hidden: true },
    ],
};
