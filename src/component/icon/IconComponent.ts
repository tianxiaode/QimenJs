/**
 * IconComponent 图标组件
 *
 * v2 模式：props + content 层次化结构
 *
 * props: 组件自身 HTML 元素的配置（壳）
 * content: 组件内部子节点的配置（瓤）— 仅组件子节点需要，DOM 节点直接在 tpl 里写
 *
 * 使用方式：
 * - icon.el.querySelector('.q-icon').className = 'q-icon save'  // 直接操作 DOM
 * - 或通过 nodeMap 访问：icon.nodeMap._.content.el.className = 'q-icon save'
 */

import { TemplateComponent } from '@qimenjs/component-core';

export let IconComponent = TemplateComponent.withTemplate({
    tpl: {
        tag: 'div',
        className: 'q-icon-wrap',
        children: [
            {
                tag: 'i',
                name: 'content',
                className: 'q-icon',
                events: {
                    click: { emits: ['click'] },
                },
            },
        ],
    },
    props: {
        size: 'md',
    },
    body: {
        type: 'Icon',
    },
});
