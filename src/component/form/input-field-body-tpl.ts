import type { TemplateDecl } from '@/component-core';
import { ItemGroupStaticComponent } from '../itemgroup/ItemGroupStaticComponent';

export const INPUT_FIELD_BODY_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-input__wrapper',
    children: [
        {
            tag: 'span',
            name: 'prefix',
            classes: 'q-input__prefix hidden',
        },
        {
            tag: 'input',
            name: 'field',
            classes: 'q-input__field',
        },
        {
            name: 'actions',
            type: ItemGroupStaticComponent,
            classes: 'q-input__actions hidden',
            options: {
                direction: 'horizontal',
                gap: '4px',
            },
        },
        {
            tag: 'div',
            name: 'suffix',
            classes: 'q-input__slot q-input__slot--suffix hidden',
        },
        {
            tag: 'div',
            name: 'dropdownIcon',
            classes: 'q-input__slot q-input__slot--dropdown hidden',
        },
    ],
};
