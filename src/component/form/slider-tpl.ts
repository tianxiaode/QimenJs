import type { TemplateDecl } from '@/component-core';
import { createFormFieldTpl } from './formfield-tpl';
import { SliderFieldBodyComponent } from './SliderFieldBodyComponent';

export const SLIDER_TPL: TemplateDecl = createFormFieldTpl(SliderFieldBodyComponent);
