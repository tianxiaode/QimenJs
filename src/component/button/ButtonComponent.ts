/**
 * ButtonComponent 按钮组件
 *
 * 模板节点：
 * - icon — 图标（DOM 节点），通过 this.icon 设置内容
 * - text — 文本
 * - dropIcon — 下拉箭头图标（DOM 节点），默认隐藏
 *
 * 事件：
 * - click — 按钮（icon/text）点击时触发
 *
 * 浮动层：
 * - 由派生组件（如 DropdownComponent）通过 body.floats 声明驱动
 *
 * 尺寸：
 * - 支持 sm/md/lg 三档尺寸，由 SizeAbility 提供
 * - 默认尺寸为 md
 */

import { Component } from '@qimenjs/component-core';
import { SizeAbility } from '@qimenjs/component-abilities';

export interface ButtonProps {
    icon?: string;
    text?: string;
    size?: 'sm' | 'md' | 'lg';
}

export let ButtonComponent = Component.withTemplate({
    tpl: {
        tag: 'div',
        cls: 'q-button',
        children: [
            {
                tag: 'i',
                name: 'icon',
                cls: 'q-button__icon',
            },
            {
                tag: 'span',
                name: 'text',
                cls: 'q-button__text',
            },
            {
                tag: 'i',
                name: 'dropIcon',
                cls: 'q-expand-arrow q-expand-arrow--collapsed',
                hidden: true,
            },
        ],
    },
    tplEvents: {
        '': { click: { emits: ['click'] } },
        dropIcon: { click: { emits: ['dropClick'] } },
    },
    body: {
        type: 'Button',

        onAfterInit(props?: ButtonProps): void {
            this.initSize();
            this.update(props);
        },

        update(props?: Partial<ButtonProps>): void {
            if (props?.icon !== undefined) {
                this.icon = props.icon;
            }
            if (props?.text !== undefined) {
                this.text = props.text;
            }
            this.size = props?.size || 'md';
        },
    },
}).with([SizeAbility]);

export type ButtonComponent = InstanceType<typeof ButtonComponent>;
