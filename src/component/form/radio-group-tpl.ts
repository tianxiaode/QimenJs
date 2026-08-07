import type { TplNode } from '@/component-core';
import { createFormFieldTpl } from './formfield-tpl';
import { RadioGroupFieldBodyComponent } from './RadioGroupFieldBodyComponent';

export const RADIO_GROUP_TPL: TplNode = createFormFieldTpl(RadioGroupFieldBodyComponent);
