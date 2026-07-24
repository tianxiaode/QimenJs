/**
 * InputFieldBodyComponent 输入框字段体组件
 *
 * 作为 FormFieldComponent 的 fieldBody 子组件，
 * el 直接充当 wrapper 层（q-input__wrapper），避免多套一层 div。
 *
 * 包含节点：
 * - prefix        前缀区域
 * - field         输入框
 * - actions       操作按钮区域（ItemGroupStatic）
 * - suffix        右侧装饰区域
 * - dropdownIcon  下拉箭头图标区域
 *
 * @example
 * ```ts
 * // 通过 FormFieldComponent.replace() 的 nodeOverrides 使用：
 * const InputComponent = FormFieldComponent.replace({
 *     nodeOverrides: { fieldBody: { type: 'InputFieldBody' } },
 * });
 * ```
 */

import { Component } from '@qimenjs/component-core';

export let InputFieldBodyComponent = Component.withTemplate({
    tpl: {
        tag: 'div',
        cls: 'q-input__wrapper',
        children: [
            {
                tag: 'span',
                name: 'prefix',
                cls: 'q-input__prefix',
                hidden: true,
            },
            {
                tag: 'input',
                name: 'field',
                cls: 'q-input__field',
                events: {
                    input: { emits: ['input'], debounce: 150 },
                    focus: { emits: ['focus'] },
                    blur: { emits: ['blur'] },
                    change: { emits: ['change'], debounce: 150 },
                    keydown: { emits: ['keydown'] },
                },
            },
            {
                name: 'actions',
                type: 'ItemGroupStatic',
                cls: 'q-input__actions',
                hidden: true,
                initConfig: {
                    direction: 'horizontal',
                    gap: '4px',
                    defaultItem: {
                        Icon: { events: { click: { emits: ['actionClick'] } } },
                    },
                },
            },
            {
                tag: 'div',
                name: 'suffix',
                cls: 'q-input__slot q-input__slot--suffix',
                hidden: true,
            },
            {
                tag: 'div',
                name: 'dropdownIcon',
                cls: 'q-input__slot q-input__slot--dropdown',
                hidden: true,
            },
        ],
    },
    body: {
        type: 'InputFieldBody',

        bindDomEventBindings(): void {},

        onAfterInit(): void {
            const actionsCmp = this.nodeMap?.actions?.component;
            if (actionsCmp) {
                actionsCmp.on('actionClick', (data: any) => {
                    this.emit('actionClick', data);
                });
            }
        },
    },
});

export type InputFieldBodyComponent = InstanceType<typeof InputFieldBodyComponent>;
