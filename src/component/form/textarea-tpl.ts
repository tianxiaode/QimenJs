import type { TemplateDecl } from '@/component-core';
import { ItemGroupStaticComponent } from '../itemgroup/ItemGroupStaticComponent';
import { createFormFieldTpl } from './formfield-tpl';

export const TEXTAREA_TPL: TemplateDecl = createFormFieldTpl(ItemGroupStaticComponent);
