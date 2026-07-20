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
 * - dropIcon — click 触发 toggle（由 body.floats 声明，调度中心自动处理）
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
        floats: {
            dropIcon: { type: 'DropPanel', trigger: 'click', placement: 'bottom' },
        },
    },
});

export type ButtonComponent = InstanceType<typeof ButtonComponent>;
