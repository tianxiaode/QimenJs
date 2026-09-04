import type { TemplateDecl } from '@/component-core';

/** 卡片模板定义 */
export const CARD_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-card',
    children: [
        {
            tag: 'div',
            classes: 'q-card__header',
            children: [
                { tag: 'i', name: 'headerIcon', classes: 'q-card__header-icon hidden' },
                { tag: 'div', name: 'headerTitle', classes: 'q-card__header-title' },
                { tag: 'i', name: 'headerAction', classes: 'q-card__header-action hidden' },
            ],
        },
        { tag: 'div', name: 'body', classes: 'q-card__body' },
        { tag: 'div', name: 'footer', classes: 'q-card__footer hidden' },
    ],
};
