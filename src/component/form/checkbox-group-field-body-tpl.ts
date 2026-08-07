import type { TplNode } from '@/component-core';
import { ItemGroupStaticComponent } from '../itemgroup/ItemGroupStaticComponent';

export const CHECKBOX_GROUP_FIELD_BODY_TPL: TplNode = {
    tag: 'div',
    cls: 'q-checkbox-group__wrapper',
    children: [
        {
            name: 'options',
            type: ItemGroupStaticComponent,
            cls: 'q-checkbox-group__options',
            initConfig: {
                direction: 'vertical',
                gap: '8px',
            },
        },
    ],
};
