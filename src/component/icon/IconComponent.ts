/**
 * IconComponent 图标组件
 *
 * 支持尺寸控制，通过 SizeAbility 提供 sm/md/lg 三种尺寸。
 * 默认尺寸为 md。
 *
 * 使用方式：
 * - icon.el.querySelector('.q-icon').className = 'q-icon save'  // 直接操作 DOM
 * - 或通过 nodeMap 访问：icon.nodeMap._.content.el.className = 'q-icon save'
 * - 通过 size 属性控制图标尺寸：icon.size = 'lg'
 */

import { TemplateComponent } from '@qimenjs/component-core';
import { SizeAbility } from '@qimenjs/component-abilities';

export interface IconProps {
    content?: string;
    size?: 'sm' | 'md' | 'lg';
}

export let IconComponent = TemplateComponent.withTemplate({
    tpl: {
        tag: 'div',
        cls: 'q-icon-wrap',
        children: [
            {
                tag: 'i',
                name: 'content',
                cls: 'q-icon',
                events: {
                    click: { emits: ['click'] },
                },
            },
        ],
    },
    body: {
        type: 'Icon',

        onAfterInit(props?: IconProps): void {
            this.initSize();
            this.update(props);
        },

        update(props?: Partial<IconProps>): void {
            if (props?.content !== undefined) {
                this.content = props.content;
            }
            this.size = props?.size || 'md';
        },
    },
}).with([SizeAbility]);

export type IconComponent = InstanceType<typeof IconComponent>;
