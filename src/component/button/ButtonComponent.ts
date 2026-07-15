/**
 * ButtonComponent 按钮组件
 *
 * v2 模式：props + content 层次化结构
 *
 * props: 组件自身 HTML 元素的配置（壳）
 *   - size: 规格档位 sm/md/lg
 *   - disabled: 禁用状态
 *   - width/height: 精确尺寸
 *
 * content: 声明组件子节点，使用时传入具体配置覆盖默认值
 *   - icon: 图标子组件
 *   - text: 文本 DOM 节点
 *   - dropIcon: 下拉箭头图标子组件
 *
 * 子节点的 className/style 等直接在 tpl 里写，content 不重复定义。
 * 使用时通过 content 传入覆盖值。
 */

import { TemplateComponent } from '@qimenjs/component-core';
import { IconComponent } from '../icon/IconComponent';

export let ButtonComponent = TemplateComponent.withTemplate({
    tpl: {
        tag: 'div',
        className: 'q-button',
        children: [
            { name: 'icon', type: IconComponent, className: 'q-button__icon' },
            { tag: 'span', name: 'text', className: 'q-button__text' },
            { name: 'dropIcon', type: IconComponent, className: 'q-expand-arrow q-expand-arrow--collapsed', hidden: true },
        ],
    },
    props: {
        size: 'md',
        disabled: false,
    },
    body: {
        type: 'Button',
    },
});
