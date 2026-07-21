/**
 * AvatarComponent 头像组件
 *
 * 支持图片、文字、图标三种头像模式，优先级：src > text > icon。
 * 圆形裁切，尺寸分档由 SizeAbility 提供。
 *
 * 模板节点（自动生成属性）：
 * - image — img，自动生成 this.image（读写 src）、this.imageHidden
 * - text  — span，自动生成 this.text（读写 innerHTML）、this.textHidden
 * - icon  — IconComponent，自动生成 this.$icon（组件实例）、this.iconHidden
 *
 * @example
 * ```ts
 * new AvatarComponent({ src: '/avatar.png' })
 * new AvatarComponent({ text: '张' })
 * new AvatarComponent({ icon: '👤' })
 * ```
 */

import { TemplateComponent } from '@qimenjs/component-core';
import { IconComponent } from '../icon/IconComponent';
import { SizeAbility } from '@qimenjs/component-abilities';

export type AvatarMode = 'src' | 'text' | 'icon';

export interface AvatarProps {
    src?: string;
    text?: string;
    icon?: string;
    size?: 'sm' | 'md' | 'lg';
}

export let AvatarComponent = TemplateComponent.withTemplate({
    tpl: {
        tag: 'div',
        cls: 'q-avatar',
        children: [
            { tag: 'img', name: 'image', cls: 'q-avatar__image', hidden: true },
            { tag: 'span', name: 'text', cls: 'q-avatar__text', hidden: true },
            { name: 'icon', type: IconComponent, cls: 'q-avatar__icon', hidden: true },
        ],
    },
    body: {
        type: 'Avatar',

        onAfterInit(props?: AvatarProps): void {
            this.update(props);
        },

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
            // 设置默认尺寸为 md
            this.size = props?.size || 'md';

            // 根据属性值自动判断显示模式
            this.imageHidden = props?.src === undefined;
            this.textHidden = props?.text === undefined;
            this.iconHidden = props?.icon === undefined;
        },
    },
}).with([SizeAbility]);

export type AvatarComponent = InstanceType<typeof AvatarComponent>;
