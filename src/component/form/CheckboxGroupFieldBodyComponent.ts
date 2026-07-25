/**
 * CheckboxGroupFieldBodyComponent 复选框组字段体组件
 *
 * 作为 FormFieldComponent 的 fieldBody 子组件，
 * 使用 ItemGroupStatic 管理复选框选项。
 *
 * 包含节点：
 * - options  选项容器（ItemGroupStatic）
 *
 * @example
 * ```ts
 * const CheckboxGroupComponent = FormFieldComponent.replace({
 *     nodeOverrides: { fieldBody: { type: CheckboxGroupFieldBodyComponent } },
 * });
 * ```
 */

import { Component } from '@qimenjs/component-core';

export let CheckboxGroupFieldBodyComponent = Component.withTemplate({
    tpl: {
        tag: 'div',
        cls: 'q-checkbox-group__wrapper',
        children: [
            {
                name: 'options',
                type: 'ItemGroupStatic',
                cls: 'q-checkbox-group__options',
                initConfig: {
                    direction: 'vertical',
                    gap: '8px',
                },
            },
        ],
    },
    body: {
        type: 'CheckboxGroupFieldBody',
    },
});

export type CheckboxGroupFieldBodyComponent = InstanceType<typeof CheckboxGroupFieldBodyComponent>;
