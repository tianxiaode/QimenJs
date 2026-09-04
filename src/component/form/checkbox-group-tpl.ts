import type { TemplateDecl } from '@/component-core';
import { createFormFieldTpl } from './formfield-tpl';
import { CheckboxGroupFieldBodyComponent } from './CheckboxGroupFieldBodyComponent';

export const CHECKBOX_GROUP_TPL: TemplateDecl = createFormFieldTpl(CheckboxGroupFieldBodyComponent);
