/**
 * ToggleIconComponent 图标切换组件
 *
 * 通过切换图标来表达状态变化。
 * 两个状态各对应一个图标，点击自动切换。
 *
 * 模板节点：
 * - icon — 图标（DOM 节点），通过 this.icon 设置内容
 *
 * 事件：
 * - toggle — 切换状态变化时触发，数据 { on }
 *
 * 使用示例：
 * ```ts
 * new ToggleIconComponent({ onIcon: '⏸', offIcon: '▶' })
 * new ToggleIconComponent({ onIcon: '🔊', offIcon: '🔇', on: true })
 * toggleIcon.on('toggle', ({ on }) => { ... })
 * ```
 */

import { Component, DomEventsMap } from '@qimenjs/component-core';
import type { TplNode } from '@qimenjs/component-core';
import { SizeAbility } from '@qimenjs/component-abilities';
import { TOGGLE_ICON_TPL } from './toggle-icon-tpl';

/** 切换图标属性接口 */
export interface ToggleIconProps {
    onIcon?: string;
    offIcon?: string;
    on?: boolean;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

class ToggleIconComponent extends Component {
    get tpl(): TplNode {
        return TOGGLE_ICON_TPL;
    }

    _on: boolean = false;
    _onIcon: string = '';
    _offIcon: string = '';

    domEvents?: DomEventsMap | undefined = {
        click: { handler: 'onRootClick' },
    };

    onAfterInit(props?: ToggleIconProps): void {
        this.initSize();
        if (props?.onIcon) this._onIcon = props.onIcon;
        if (props?.offIcon) this._offIcon = props.offIcon;
        if (props?.on) this._on = props.on;
        if (props?.disabled) this.disabled = props.disabled;
        if (props?.size) this.size = props.size;
        this._applyState();
    }

    onRootClick(): void {
        if (this.disabled) return;
        this._on = !this._on;
        this._applyState();
    }

    override get defaultEventData() {
        return {
            ...super.defaultEventData,
            on: this._on,
        };
    }

    get isOn(): boolean {
        return this._on;
    }
    set isOn(value: boolean) {
        this._on = value;
        this._applyState();
    }

    get onIcon(): string {
        return this._onIcon;
    }
    set onIcon(value: string) {
        this._onIcon = value;
        this._applyState();
    }

    get offIcon(): string {
        return this._offIcon;
    }
    set offIcon(value: string) {
        this._offIcon = value;
        this._applyState();
    }

    _applyState(): void {
        const iconValue = this._on ? this._onIcon : this._offIcon;
        if (iconValue) {
            this.icon = iconValue;
        }

        this.toggleCls('q-toggle-icon--on', this._on);
        this.toggleCls('q-toggle-icon--off', !this._on);
        this.toggleCls('q-toggle-icon--disabled', this.disabled);
        this.setAttr('aria-pressed', String(this._on));

        if (this.disabled) {
            this.setAttr('aria-disabled', 'true');
        } else {
            this.setAttr('aria-disabled');
        }
    }

    update(props?: Partial<ToggleIconProps>): void {
        if (props?.on !== undefined) this.isOn = props.on;
        if (props?.onIcon !== undefined) this.onIcon = props.onIcon;
        if (props?.offIcon !== undefined) this.offIcon = props.offIcon;
        if (props?.disabled !== undefined) {
            this.disabled = props.disabled;
            this._applyState();
        }
        if (props?.size !== undefined) this.size = props.size;
    }
}

ToggleIconComponent.use(SizeAbility);

export { ToggleIconComponent };
/** 切换图标实例类型 */
export type ToggleIconComponentInstance = InstanceType<typeof ToggleIconComponent>;
