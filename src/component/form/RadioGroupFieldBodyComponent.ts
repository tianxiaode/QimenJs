/**
 * RadioGroupFieldBodyComponent 单选框组字段体组件
 *
 * 作为 FormFieldComponent 的 fieldBody 子组件，
 * 使用 ItemGroupStatic 管理单选选项。
 *
 * 包含节点：
 * - options  选项容器（ItemGroupStatic）
 *
 * @example
 * ```ts
 * const RadioGroupComponent = FormFieldComponent.replace({
 *     nodeOverrides: { fieldBody: { type: RadioGroupFieldBodyComponent } },
 * });
 * ```
 */

import { Component } from '@qimenjs/component-core';

export let RadioGroupFieldBodyComponent = Component.withTemplate({
    tpl: {
        tag: 'div',
        cls: 'q-radio-group__wrapper',
        children: [
            {
                name: 'options',
                type: 'ItemGroupStatic',
                cls: 'q-radio-group__options',
                initConfig: {
                    direction: 'vertical',
                    gap: '8px',
                },
            },
        ],
    },
    body: {
        type: 'RadioGroupFieldBody',
    },
});

export type RadioGroupFieldBodyComponent = InstanceType<typeof RadioGroupFieldBodyComponent>;
