import type { TemplateDecl } from '@/component-core';
import { ItemGroupStaticComponent } from '../itemgroup/ItemGroupStaticComponent';
import { createFormFieldTpl } from './formfield-tpl';

export const RADIO_GROUP_TPL: TemplateDecl = createFormFieldTpl(
    ItemGroupStaticComponent,
    'q-formfield__wrapper q-radio-group__wrapper',
    { direction: 'vertical', gap: '8px' }
);
