/**
 * ToggleIconComponent 图标切换组件
 *
 * 通过切换图标来表达状态变化。
 * 两个状态各对应一个图标，点击自动切换。
 *
 * 使用示例：
 * ```ts
 * // 播放/暂停
 * new ToggleIconComponent({ onIcon: '⏸', offIcon: '▶' })
 *
 * // 静音/取消静音
 * new ToggleIconComponent({ onIcon: '🔊', offIcon: '🔇', on: true })
 *
 * // 监听切换
 * toggleIcon.on('toggle', ({ on }) => { ... })
 * ```
 */

import { TemplateComponent } from '@qimenjs/component-core';
import { IconComponent } from '../icon/IconComponent';

export interface ToggleIconProps {
    onIcon?: string;
    offIcon?: string;
    on?: boolean;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export let ToggleIconComponent = TemplateComponent.withTemplate({
    tpl: {
        tag: 'div',
        className: 'q-toggle-icon',
        children: [
            { name: 'icon', type: IconComponent, className: 'q-toggle-icon__icon' },
        ],
    },
    props: {
        size: 'md',
        disabled: false,
    },
    body: {
        type: 'ToggleIcon',

        _on: false,
        _onIcon: '',
        _offIcon: '',

        forwards: {
            icon: 'icon',
        },

        _initToggleIcon(props?: ToggleIconProps): void {
            if (props?.onIcon) this._onIcon = props.onIcon;
            if (props?.offIcon) this._offIcon = props.offIcon;
            if (props?.on) this._on = props.on;
            if (props?.disabled) this.disabled = props.disabled;
            if (props?.size) this.size = props.size;

            this.el.addEventListener('click', () => this._handleClick());
            this._applyState();
        },

        get on(): boolean { return this._on; },
        set on(value: boolean) {
            this._on = value;
            this._applyState();
        },

        get onIcon(): string { return this._onIcon; },
        set onIcon(value: string) {
            this._onIcon = value;
            this._applyState();
        },

        get offIcon(): string { return this._offIcon; },
        set offIcon(value: string) {
            this._offIcon = value;
            this._applyState();
        },

        _handleClick(): void {
            if (this.disabled) return;
            this._on = !this._on;
            this._applyState();
            this.emit('toggle', { on: this._on });
        },

        _applyState(): void {
            const iconValue = this._on ? this._onIcon : this._offIcon;
            const iconComponent = this.icon;
            if (iconComponent?.nodeMap?.content?.el && iconValue) {
                iconComponent.nodeMap.content.el.innerHTML = iconValue;
            }

            this.el.classList.toggle('q-toggle-icon--on', this._on);
            this.el.classList.toggle('q-toggle-icon--off', !this._on);
            this.el.classList.toggle('q-toggle-icon--disabled', this.disabled);

            this.el.setAttribute('aria-pressed', String(this._on));

            if (this.disabled) {
                this.el.setAttribute('aria-disabled', 'true');
            } else {
                this.el.removeAttribute('aria-disabled');
            }
        },

        update(props?: Partial<ToggleIconProps>): void {
            if (props?.on !== undefined) this.on = props.on;
            if (props?.onIcon !== undefined) this.onIcon = props.onIcon;
            if (props?.offIcon !== undefined) this.offIcon = props.offIcon;
            if (props?.disabled !== undefined) {
                this.disabled = props.disabled;
                this._applyState();
            }
            if (props?.size !== undefined) this.size = props.size;
        },
    },
});

export type ToggleIconComponent = InstanceType<typeof ToggleIconComponent>;