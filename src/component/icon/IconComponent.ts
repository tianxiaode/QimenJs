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

import { Component } from '@qimenjs/component-core';
import { SizeAbility } from '@qimenjs/component-abilities';
import { ICON_TPL } from './icon-tpl';

export interface IconProps {
    content?: string;
    size?: 'sm' | 'md' | 'lg';
}

class IconComponent extends Component {
    onAfterInit(props?: IconProps): void {
        this.initSize();
        this.update(props);
    }

    update(props?: Partial<IconProps>): void {
        if (props?.content !== undefined) {
            this.content = props.content;
        }
        this.size = props?.size || 'md';
    }
}

IconComponent.use([SizeAbility]);
IconComponent.useTemplate(ICON_TPL);

export { IconComponent };
export type IconComponentInstance = InstanceType<typeof IconComponent>;
