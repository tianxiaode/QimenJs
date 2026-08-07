import type { TplNode } from '@/component-core';
import { InputInfoGroupComponent } from './InputInfoGroupComponent';
import { InputFieldBodyComponent } from './InputFieldBodyComponent';

/**
 * 创建表单字段模板
 *
 * 基于 FormField 三封装结构（labelGroup + fieldBody + infoGroup），
 * 仅 fieldBody 子组件类型可变，其余节点固定，避免在各字段组件模板中重复定义。
 *
 * @param fieldBodyType - fieldBody 子组件类（如 InputFieldBodyComponent、TextareaFieldBodyComponent）
 */
export function createFormFieldTpl(fieldBodyType: new (...args: any[]) => any): TplNode {
    return {
        tag: 'div',
        cls: 'q-formfield',
        children: [
            {
                tag: 'div',
                name: 'labelGroup',
                cls: 'q-formfield__label-group',
                hidden: true,
                children: [
                    { tag: 'label', name: 'label', cls: 'q-formfield__label', i18n: 'label' },
                    {
                        tag: 'span',
                        name: 'requiredMark',
                        cls: 'q-formfield__required-mark',
                        hidden: true,
                    },
                    { tag: 'span', name: 'separator', cls: 'q-formfield__separator' },
                ],
            },
            {
                name: 'fieldBody',
                type: fieldBodyType,
                cls: 'q-formfield__wrapper',
            },
            {
                name: 'infoGroup',
                type: InputInfoGroupComponent,
            },
        ],
    };
}

export const FORMFIELD_TPL: TplNode = createFormFieldTpl(InputFieldBodyComponent);
