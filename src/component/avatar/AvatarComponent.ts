/**
 * AvatarComponent 头像组件
 *
 * 支持图片、文字、图标三种头像模式，优先级：src > text > icon。
 * 圆形裁切，尺寸分档由 SizeAbility 提供。
 *
 * @example
 * ```ts
 * new AvatarComponent({ src: '/avatar.png' })
 * new AvatarComponent({ text: '张' })
 * new AvatarComponent({ icon: '👤' })
 * ```
 */

import { Component } from '@qimenjs/component-core';
import type { TplNode } from '@qimenjs/component-core';
import { SizeAbility } from '@qimenjs/component-abilities';
import { AVATAR_TPL } from './avatar-tpl';
import './avatar.css.ts';

/** 头像模式类型 */
export type AvatarMode = 'src' | 'text' | 'icon';

/** 头像属性接口 */
export interface AvatarProps {
    src?: string;
    text?: string;
    icon?: string;
    size?: 'sm' | 'md' | 'lg';
}

class AvatarComponent extends Component {
    get tpl(): TplNode {
        return AVATAR_TPL;
    }

    onAfterInit(props?: AvatarProps): void {
        this.initSize();
        this.update(props);
    }

    update(props?: Partial<AvatarProps>): void {
        if (props?.src !== undefined) {
            this.image = props.src;
        }
        if (props?.text !== undefined) {
            this.text = props.text.charAt(0).toUpperCase();
        }
        if (props?.icon !== undefined) {
            this.icon = props.icon;
        }
        this.size = props?.size || 'md';

        this.setNodeHidden(props?.src === undefined, 'image');
        this.setNodeHidden(props?.text === undefined, 'text');
        this.setNodeHidden(props?.icon === undefined, 'icon');
    }
}

AvatarComponent.use(SizeAbility);

export { AvatarComponent };
/** 头像实例类型 */
export type AvatarComponentInstance = InstanceType<typeof AvatarComponent>;
