/**
 * IconComponent 图标组件
 *
 * 两层结构：外层 div（控制容器）+ 内层 i（图标显示）
 *
 * 自动生成的对接属性：
 * - iconClassName → 外层 div 的 className
 * - iconStyle → 外层 div 的 style
 * - iconContentClassName → 内层 i 的 className（设置图标字体类名）
 * - iconContentStyle → 内层 i 的 style
 * - click 事件通过 emits 转发为组件事件
 *
 * _expose = ['content'] — 内层 i 的 content 名
 */

import { TemplateComponent } from '@qimenjs/component-core';

export let IconComponent = TemplateComponent.withTemplate({
    tpl: {
        tag: 'div',
        className: 'q-icon-wrap',
        children: [
            {
                tag: 'i',
                name: 'icon:content',
                content: 'content',
                className: 'q-icon',
                events: {
                    click: { emits: ['click'] },
                },
            },
        ],
    },
    body: {
        type: 'Icon',
    },
});
