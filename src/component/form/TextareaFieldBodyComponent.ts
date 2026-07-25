/**
 * TextareaFieldBodyComponent 多行文本字段体组件
 *
 * 作为 FormFieldComponent 的 fieldBody 子组件，
 * 使用 textarea 替代 InputFieldBody 的 input。
 *
 * 包含节点：
 * - field   文本域
 *
 * @example
 * ```ts
 * const TextareaComponent = FormFieldComponent.replace({
 *     nodeOverrides: { fieldBody: { type: TextareaFieldBodyComponent } },
 * });
 * ```
 */

import { Component } from '@qimenjs/component-core';

export let TextareaFieldBodyComponent = Component.withTemplate({
    tpl: {
        tag: 'div',
        cls: 'q-textarea__wrapper',
        children: [
            {
                tag: 'textarea',
                name: 'field',
                cls: 'q-textarea__field',
            },
        ],
    },
    tplEvents: {
        field: {
            input: { emits: ['input'], debounce: 150 },
            focus: { emits: ['focus'] },
            blur: { emits: ['blur'] },
            change: { emits: ['change'], debounce: 150 },
        },
    },
    body: {
        type: 'TextareaFieldBody',
    },
});

export type TextareaFieldBodyComponent = InstanceType<typeof TextareaFieldBodyComponent>;
