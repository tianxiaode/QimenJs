import type { TplNode } from '@/component-core';
import { HeaderComponent } from '../header/HeaderComponent';

/** 卡片模板定义 */
export const CARD_TPL: TplNode = {
    tag: 'div',
    cls: 'q-card',
    children: [
        { type: HeaderComponent, cls: 'q-card__header' },
        { tag: 'div', name: 'body', cls: 'q-card__body' },
        { tag: 'div', name: 'footer', cls: 'q-card__footer', hidden: true },
    ],
};
