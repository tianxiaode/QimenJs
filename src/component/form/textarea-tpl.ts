import type { TemplateDecl } from '@/component-core';
import { createFormFieldTpl } from './formfield-tpl';
import { TextareaFieldBodyComponent } from './TextareaFieldBodyComponent';

export const TEXTAREA_TPL: TemplateDecl = createFormFieldTpl(TextareaFieldBodyComponent);
