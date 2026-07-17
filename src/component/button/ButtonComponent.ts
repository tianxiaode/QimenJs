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
 * childProps: 使用方传入的子节点配置，key 对应 tpl children 的 name
 *   - icon: 图标子组件 → 使用方传 { props: { className: 'fa-solid fa-bars' } }
 *   - text: 文本 DOM 节点 → 使用方传 { props: { innerHTML: '保存' } }
 *   - dropIcon: 下拉箭头图标子组件
 *
 * 使用示例：
 * ```ts
 * { type: ButtonComponent, props: { childProps: { icon: { props: { className: 'fa-solid fa-bars' } }, text: { props: { innerHTML: '菜单' } } } } }
 * ```
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
        forwards: {
            icon: 'icon',
        },
    },
});
