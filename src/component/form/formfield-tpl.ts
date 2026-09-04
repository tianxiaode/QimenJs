import type { TemplateDecl } from '@/component-core';
import { InputInfoGroupComponent } from './InputInfoGroupComponent';
import { InputFieldBodyComponent } from './InputFieldBodyComponent';

export function createFormFieldTpl(fieldBodyType: new (...args: any[]) => any): TemplateDecl {
    return {
        tag: 'div',
        classes: 'q-formfield',
        children: [
            {
                tag: 'div',
                name: 'labelGroup',
                classes: 'q-formfield__label-group hidden',
                children: [
                    { tag: 'label', name: 'label', classes: 'q-formfield__label' },
                    { tag: 'span', name: 'requiredMark', classes: 'q-formfield__required-mark hidden' },
                    { tag: 'span', name: 'separator', classes: 'q-formfield__separator' },
                ],
            },
            { name: 'fieldBody', type: fieldBodyType, classes: 'q-formfield__wrapper' },
            { name: 'infoGroup', type: InputInfoGroupComponent },
        ],
    };
}

export const FORMFIELD_TPL: TemplateDecl = createFormFieldTpl(InputFieldBodyComponent);
