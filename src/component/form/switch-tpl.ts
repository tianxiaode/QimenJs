import type { TemplateDecl } from '@/component-core';
import { SwitchFieldBodyComponent } from './SwitchFieldBodyComponent';
import { InputInfoGroupComponent } from './InputInfoGroupComponent';

export const SWITCH_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-formfield',
    children: [
        {
            tag: 'div',
            name: 'labelGroup',
            classes: 'q-formfield__label-group hidden',
            children: [
                { tag: 'label', name: 'label', classes: 'q-formfield__label' },
                {
                    tag: 'span',
                    name: 'requiredMark',
                    classes: 'q-formfield__required-mark hidden',
                },
                { tag: 'span', name: 'separator', classes: 'q-formfield__separator' },
            ],
        },
        {
            name: 'fieldBody',
            type: SwitchFieldBodyComponent,
            classes: 'q-formfield__wrapper',
        },
        { name: 'infoGroup', type: InputInfoGroupComponent },
    ],
};
