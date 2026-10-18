import type { TemplateDecl } from '@/component-core';
import { ItemGroupStaticComponent } from '../itemgroup/ItemGroupStaticComponent';
import { createFormFieldTpl } from './formfield-tpl';

export const CHECKBOX_GROUP_TPL: TemplateDecl = createFormFieldTpl(
    ItemGroupStaticComponent,
    'q-formfield__wrapper q-checkbox-group__wrapper',
    { direction: 'vertical', gap: '8px' }
);
