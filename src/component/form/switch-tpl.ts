import type { TplNode } from '@/component-core';
import { createFormFieldTpl } from './formfield-tpl';
import { SwitchFieldBodyComponent } from './SwitchFieldBodyComponent';

export const SWITCH_TPL: TplNode = createFormFieldTpl(SwitchFieldBodyComponent);
