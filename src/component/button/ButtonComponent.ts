/**
 * ButtonComponent 按钮组件
 *
 * 独立组件，使用 withTemplate 模板创建。
 * 支持类型、尺寸、禁用状态等配置。
 *
 * icon/dropIcon 通过 content 声明，自动从 IconComponent._expose 透传：
 * - button.icon → IconComponent 实例
 * - button.iconClassName → icon.el.className
 * - button.iconStyle → icon.el.style
 * - button.iconSize → icon.size
 * - button.iconContentClassName → icon.content.el.className
 * - button.iconContentStyle → icon.content.el.style
 * - button.iconContentSize → icon.content.size
 * - button.dropIcon → IconComponent 实例
 * - button.dropIconClassName / Style / Size / ContentClassName / ContentStyle / ContentSize
 * - button.text → span.innerHTML
 */

import { TemplateComponent } from '@qimenjs/component-core';
import { IconComponent } from '../icon/IconComponent';

export let ButtonComponent = TemplateComponent.withTemplate({
    tpl: {
        tag: 'div',
        children: [
            { name: 'button:icon', type: IconComponent, content: 'icon' },
            { tag: 'span', name: 'button:text', content: 'text' },
            { name: 'button:expand', type: IconComponent, className: 'q-expand-arrow q-expand-arrow--collapsed', hidden: true, content: 'dropIcon' },
        ]
    },
    body: {
        type: 'Button',
    },
});
