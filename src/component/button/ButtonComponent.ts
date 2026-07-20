/**
 * ButtonComponent 按钮组件
 *
 * 模板节点：
 * - icon — 图标（IconComponent），通过 $icon 访问
 * - text — 文本
 * - dropIcon — 下拉箭头图标（IconComponent），默认隐藏
 *
 * 事件：
 * - click — 按钮（icon/text）点击时触发
 *
 * 浮动层：
 * - 由派生组件（如 DropdownComponent）通过 body.floats 声明驱动
 */

import { TemplateComponent } from '@qimenjs/component-core';
import { IconComponent } from '../icon/IconComponent';

export let ButtonComponent = TemplateComponent.withTemplate({
    tpl: {
        tag: 'div',
        cls: 'q-button',
        children: [
            {
                name: 'icon',
                type: IconComponent,
                cls: 'q-button__icon',
                events: { click: { emits: ['click'] } },
            },
            {
                tag: 'span',
                name: 'text',
                cls: 'q-button__text',
                events: { click: { emits: ['click'] } },
            },
            {
                name: 'dropIcon',
                type: IconComponent,
                cls: 'q-expand-arrow q-expand-arrow--collapsed',
                hidden: true,
            },
        ],
    },
    body: {
        type: 'Button',
    },
});

export type ButtonComponent = InstanceType<typeof ButtonComponent>;
