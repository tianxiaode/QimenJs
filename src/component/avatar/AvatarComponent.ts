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

        onInitState() {
            return {
                _mode: null as AvatarMode | null,
            };
        },

        onAfterInit(props?: AvatarProps): void {
            this.initSize();
            this._initAvatar(props);
        },

        _initAvatar(props?: AvatarProps): void {
            if (props?.src) {
                this.image = props.src;
                this._mode = 'src';
            } else if (props?.text) {
                this.text = props.text.charAt(0).toUpperCase();
                this._mode = 'text';
            } else if (props?.icon) {
                this._setIconContent(props.icon);
                this._mode = 'icon';
            }

            if (props?.size) this.size = props.size;
            this._applyMode();
        },

        _setIconContent(icon: string): void {
            const iconComp = this.$icon;
            if (iconComp?.nodeMap?.content?.el) {
                iconComp.nodeMap.content.el.innerHTML = icon;
            }
        },

        _applyMode(): void {
            const mode = this._mode;
            this.imageHidden = mode !== 'src';
            this.textHidden = mode !== 'text';
            this.iconHidden = mode !== 'icon';
        },

        update(props?: Partial<AvatarProps>): void {
            if (props?.src !== undefined) {
                this.image = props.src;
                this._mode = 'src';
                this._applyMode();
            }
            if (props?.text !== undefined) {
                this.text = props.text.charAt(0).toUpperCase();
                this._mode = 'text';
                this._applyMode();
            }
            if (props?.icon !== undefined) {
                this._setIconContent(props.icon);
                this._mode = 'icon';
                this._applyMode();
            }
            if (props?.size !== undefined) this.size = props.size;
        },
    },
}).with([SizeAbility]);

export type AvatarComponent = InstanceType<typeof AvatarComponent>;
