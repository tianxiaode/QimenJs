import type { TemplateDecl } from '@/component-core';
import { ItemGroupStaticComponent } from '../itemgroup/ItemGroupStaticComponent';

export const RADIO_GROUP_FIELD_BODY_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-radio-group__wrapper',
    children: [
        {
            name: 'options',
            type: ItemGroupStaticComponent,
            classes: 'q-radio-group__options',
            options: {
                direction: 'vertical',
                gap: '8px',
            },
        },
    ],
};
