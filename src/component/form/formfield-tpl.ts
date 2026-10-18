import type { TemplateDecl } from '@/component-core';
import { InputInfoGroupComponent } from './InputInfoGroupComponent';
import { ItemGroupStaticComponent } from '../itemgroup/ItemGroupStaticComponent';

export function createFormFieldTpl(
    fieldBodyType: new (...args: any[]) => any,
    fieldBodyClasses?: string,
    fieldBodyOptions?: Record<string, any>
): TemplateDecl {
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
                type: fieldBodyType,
                classes: fieldBodyClasses ?? 'q-formfield__wrapper',
                options: fieldBodyOptions,
            },
            { name: 'infoGroup', type: InputInfoGroupComponent },
        ],
    };
}

export const FORMFIELD_TPL: TemplateDecl = createFormFieldTpl(ItemGroupStaticComponent);
