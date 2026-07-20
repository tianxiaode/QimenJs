/**
 * AvatarComponent 头像组件
 *
 * 支持图片、文字、图标三种头像模式，优先级：src > text > icon。
 * 圆形裁切，尺寸分档。
 *
 * 模板节点：
 * - image — 图片（img 标签，src 模式时显示）
 * - text — 文字（span，text 模式时显示，取首字）
 * - icon — 图标（IconComponent，icon 模式时显示）
 *
 * @example
 * ```ts
 * // 图片头像
 * new AvatarComponent({ src: '/avatar.png' })
 *
 * // 文字头像
 * new AvatarComponent({ text: '张' })
 *
 * // 图标头像
 * new AvatarComponent({ icon: '👤' })
 * ```
 */

import { TemplateComponent } from '@qimenjs/component-core';
import { IconComponent } from '../icon/IconComponent';

export interface AvatarProps {
    src?: string;
    text?: string;
    icon?: string;
    size?: 'sm' | 'md' | 'lg';
}

export let AvatarComponent = TemplateComponent.withTemplate({
    tpl: {
        tag: 'div',
        className: 'q-avatar',
        children: [
            { tag: 'img', name: 'image', className: 'q-avatar__image', hidden: true },
            { tag: 'span', name: 'text', className: 'q-avatar__text', hidden: true },
            { name: 'icon', type: IconComponent, className: 'q-avatar__icon', hidden: true },
        ],
    },
    props: {
        size: 'md',
    },
    body: {
        type: 'Avatar',

        onInitState() {
            return {
                _src: '',
                _text: '',
                _icon: '',
            };
        },

        forwards: {
            icon: 'icon',
        },

        _initAvatar(props?: AvatarProps): void {
            if (props?.src) this._src = props.src;
            if (props?.text) this._text = props.text;
            if (props?.icon) this._icon = props.icon;
            if (props?.size) this.size = props.size;

            this._applyContent();
            this._applySize();
        },

        get src(): string {
            return this._src;
        },
        set src(value: string) {
            this._src = value;
            this._applyContent();
        },

        get text(): string {
            return this._text;
        },
        set text(value: string) {
            this._text = value;
            this._applyContent();
        },

        get icon(): string {
            return this._icon;
        },
        set icon(value: string) {
            this._icon = value;
            this._applyContent();
        },

        _applyContent(): void {
            const imageEl = this.nodeMap?.image?.el as HTMLImageElement | null;
            const textEl = this.nodeMap?.text?.el as HTMLElement | null;
            const iconComponent = this.icon;

            // 优先级：src > text > icon
            if (this._src) {
                if (imageEl) {
                    imageEl.src = this._src;
                    imageEl.hidden = false;
                }
                if (textEl) textEl.hidden = true;
                if (iconComponent?.el) iconComponent.el.hidden = true;
            } else if (this._text) {
                if (imageEl) imageEl.hidden = true;
                if (textEl) {
                    textEl.textContent = this._text.charAt(0).toUpperCase();
                    textEl.hidden = false;
                }
                if (iconComponent?.el) iconComponent.el.hidden = true;
            } else if (this._icon) {
                if (imageEl) imageEl.hidden = true;
                if (textEl) textEl.hidden = true;
                if (iconComponent?.el) {
                    iconComponent.el.hidden = false;
                    if (iconComponent.nodeMap?.content?.el) {
                        iconComponent.nodeMap.content.el.innerHTML = this._icon;
                    }
                }
            }
        },

        _applySize(): void {
            this.el.classList.remove('q-avatar--sm', 'q-avatar--md', 'q-avatar--lg');
            this.el.classList.add(`q-avatar--${this.size}`);
        },

        update(props?: Partial<AvatarProps>): void {
            if (props?.src !== undefined) this.src = props.src;
            if (props?.text !== undefined) this.text = props.text;
            if (props?.icon !== undefined) this.icon = props.icon;
            if (props?.size !== undefined) {
                this.size = props.size;
                this._applySize();
            }
        },
    },
});

export type AvatarComponent = InstanceType<typeof AvatarComponent>;
