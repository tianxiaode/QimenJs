/**
 * ToggleComponent 切换按钮组件
 *
 * 在 Button 基础上增加切换态（pressed/unpressed）。
 * 点击自动切换状态，视觉反馈跟随状态变化。
 *
 * 模板节点：
 * - icon — 图标（IconComponent）
 * - text — 文本
 *
 * 使用示例：
 * ```ts
 * // 简单切换
 * new ToggleComponent({ text: '粗体', icon: 'B' })
 *
 * // 带初始状态
 * new ToggleComponent({ text: '斜体', icon: 'I', pressed: true })
 *
 * // 监听切换
 * toggle.on('toggle', ({ pressed }) => { ... })
 * ```
 */

import { TemplateComponent } from '@qimenjs/component-core';
import { IconComponent } from '../icon/IconComponent';

export interface ToggleProps {
    text?: string;
    icon?: string;
    pressed?: boolean;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export let ToggleComponent = TemplateComponent.withTemplate({
    tpl: {
        tag: 'div',
        className: 'q-toggle',
        children: [
            { name: 'icon', type: IconComponent, className: 'q-toggle__icon', hidden: true },
            { tag: 'span', name: 'text', className: 'q-toggle__text' },
        ],
    },
    props: {
        size: 'md',
        disabled: false,
    },
    body: {
        type: 'Toggle',

        _pressed: false,

        forwards: {
            icon: 'icon',
        },

        _initToggle(props?: ToggleProps): void {
            if (props?.pressed) this._pressed = props.pressed;
            if (props?.disabled) this.disabled = props.disabled;
            if (props?.size) this.size = props.size;
            if (props?.text) this.text = props.text;
            if (props?.icon) this._setIcon(props.icon);

            this.el.addEventListener('click', () => this._handleClick());
            this._applyState();
        },

        get pressed(): boolean { return this._pressed; },
        set pressed(value: boolean) {
            this._pressed = value;
            this._applyState();
        },

        _handleClick(): void {
            if (this.disabled) return;
            this._pressed = !this._pressed;
            this._applyState();
            this.emit('toggle', { pressed: this._pressed });
        },

        _setIcon(value: string): void {
            const iconComponent = this.icon;
            if (iconComponent?.nodeMap?.content?.el) {
                iconComponent.nodeMap.content.el.innerHTML = value;
                const iconWrap = iconComponent.el;
                if (iconWrap) iconWrap.hidden = false;
            }
        },

        _applyState(): void {
            this.el.classList.toggle('q-toggle--pressed', this._pressed);
            this.el.classList.toggle('q-toggle--disabled', this.disabled);

            if (this.disabled) {
                this.el.setAttribute('aria-disabled', 'true');
            } else {
                this.el.removeAttribute('aria-disabled');
            }

            this.el.setAttribute('aria-pressed', String(this._pressed));
        },

        update(props?: Partial<ToggleProps>): void {
            if (props?.pressed !== undefined) this.pressed = props.pressed;
            if (props?.disabled !== undefined) {
                this.disabled = props.disabled;
                this._applyState();
            }
            if (props?.size !== undefined) this.size = props.size;
            if (props?.text !== undefined) this.text = props.text;
            if (props?.icon !== undefined) this._setIcon(props.icon);
        },
    },
});

export type ToggleComponent = InstanceType<typeof ToggleComponent>;