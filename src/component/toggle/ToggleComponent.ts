/**
 * ToggleComponent 切换按钮组件
 *
 * 在 Button 基础上增加切换态（pressed/unpressed）。
 * 点击自动切换状态，视觉反馈跟随状态变化。
 *
 * 模板节点：
 * - icon — 图标（DOM 节点），通过 this.icon 设置内容
 * - text — 文本
 *
 * 事件：
 * - toggle — 切换状态变化时触发，数据 { pressed }
 *
 * 使用示例：
 * ```ts
 * new ToggleComponent({ text: '粗体', icon: 'B' })
 * new ToggleComponent({ text: '斜体', icon: 'I', pressed: true })
 * toggle.on('toggle', ({ pressed }) => { ... })
 * ```
 */

import { Component } from '@qimenjs/component-core';
import { SizeAbility } from '@qimenjs/component-abilities';

export interface ToggleProps {
    text?: string;
    icon?: string;
    pressed?: boolean;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

class ToggleComponent extends Component {
    static type = 'Toggle';

    type = 'Toggle';

    onInitState() {
        return {
            _pressed: false,
        };
    }

    onAfterInit(props?: ToggleProps): void {
        this.initSize();
        if (props?.pressed) this._pressed = props.pressed;
        if (props?.disabled) this.disabled = props.disabled;
        if (props?.size) this.size = props.size;
        if (props?.text) this.text = props.text;
        if (props?.icon) this._setIcon(props.icon);
        this._applyState();
    }

    onRootClick(): void {
        if (this.disabled) return;
        this._pressed = !this._pressed;
        this._applyState();
    }

    getEventData(nodeName: string, eventName: string, eventType: string): Record<string, any> {
        return { pressed: this._pressed };
    }

    get pressed(): boolean {
        return this._pressed;
    }
    set pressed(value: boolean) {
        this._pressed = value;
        this._applyState();
    }

    _setIcon(value: string): void {
        this.icon = value;
        this.setNodeHidden(false, 'icon');
    }

    _applyState(): void {
        this.el.classList.toggle('q-toggle--pressed', this._pressed);
        this.el.classList.toggle('q-toggle--disabled', this.disabled);

        if (this.disabled) {
            this.el.setAttribute('aria-disabled', 'true');
        } else {
            this.el.removeAttribute('aria-disabled');
        }

        this.el.setAttribute('aria-pressed', String(this._pressed));
    }

    update(props?: Partial<ToggleProps>): void {
        if (props?.pressed !== undefined) this.pressed = props.pressed;
        if (props?.disabled !== undefined) {
            this.disabled = props.disabled;
            this._applyState();
        }
        if (props?.size !== undefined) this.size = props.size;
        if (props?.text !== undefined) this.text = props.text;
        if (props?.icon !== undefined) this._setIcon(props.icon);
    }
}

ToggleComponent.use([SizeAbility]);

export { ToggleComponent };
export type ToggleComponentInstance = InstanceType<typeof ToggleComponent>;
