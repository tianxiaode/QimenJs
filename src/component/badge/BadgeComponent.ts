/**
 * BadgeComponent 角标组件
 *
 * 独立组件，由 BadgeAbility 创建并挂载到宿主元素上。
 * 自身负责绝对定位、文本更新、显隐控制。
 *
 * 模板定义好后，setText 等方法由 withTemplate 自动生成。
 */

import { TemplateComponent } from '@qimenjs/component-core';

export let BadgeComponent = TemplateComponent.withTemplate({
    tpl: {
        tag: 'div',
        children: [
            { tag: 'span', name: 'badge:default', content: 'text', className: 'q-badge__content' },
        ]
    },
    body: {
        type: 'badge',
    },
});
