/**
 * SwitchFieldBodyComponent 开关字段体组件
 *
 * 作为 FormFieldComponent 的 fieldBody 子组件，
 * 实现开关轨道 + 滑块的视觉结构。
 *
 * 包含节点：
 * - track   开关轨道（含 thumb 滑块）
 *
 * @example
 * ```ts
 * const SwitchComponent = FormFieldComponent.replace({
 *     nodeOverrides: { fieldBody: { type: SwitchFieldBodyComponent } },
 * });
 * ```
 */

import { Component } from '@qimenjs/component-core';

export let SwitchFieldBodyComponent = Component.withTemplate({
    tpl: {
        tag: 'div',
        cls: 'q-switch__wrapper',
        children: [
            {
                tag: 'div',
                name: 'track',
                cls: 'q-switch__track',
                children: [
                    {
                        tag: 'div',
                        name: 'thumb',
                        cls: 'q-switch__thumb',
                    },
                ],
            },
        ],
    },
    tplEvents: {
        track: {
            click: { handler: true, emits: ['switchToggle'] },
        },
    },
    body: {
        type: 'SwitchFieldBody',
    },
});

export type SwitchFieldBodyComponent = InstanceType<typeof SwitchFieldBodyComponent>;
