/**
 * ToggleComponent 切换按钮组件
 *
 * 在 Button 基础上增加切换态（pressed/unpressed）。
 * 点击自动切换状态，视觉反馈跟随状态变化。
 *
 * 模板节点：
 * - icon — 图标（默认隐藏）
 * - text — 文本
 *
 * 事件：
 * - toggle — 切换状态变化时触发，数据 { pressed }
 *
 * @example
 * ```ts
 * new ToggleComponent({ text: '粗体', iconCls: 'q-icon-bold' })
 * new ToggleComponent({ text: '斜体', pressed: true })
 * // 状态图标切换（如明暗主题：太阳/月亮）
 * new ToggleComponent({ iconCls: 'fa fa-sun-o', pressedIconCls: 'fa fa-moon-o', ghost: true })
 * toggle.on('toggle', ({ pressed }) => { ... })
 * ```
 */

import { Component } from '@qimenjs/component-core';
import type { DomEventsMap, TemplateDecl } from '@/component-core';
import { ColorAbility, SizeAbility } from '@qimenjs/component-abilities';
import { TOGGLE_TPL } from './toggle-tpl';
import { Definitions } from '@/composable';
import './toggle.css';

const ToggleComponentDefs: Definitions = {
    options: {
        text: null,
        pressed: false,
        iconCls: null,
        pressedIconCls: null,
        ghost: false,
        size: 'md',
        color: null,
    },
} as const;

class ToggleComponent extends Component {
    static type = 'toggle';
    get tpl(): TemplateDecl {
        return TOGGLE_TPL;
    }

    private _lastIconCls: string | null = null;

    domEvents?: DomEventsMap | undefined = {
        click: { path: '', handler: true },
    };

    _onTextOptionChange(value: string) {
        this.setNodeText(value, 'text');
    }

    _onPressedOptionChange(value: boolean): void {
        this.toggleCls('q-toggle--pressed', value);
        this.setAttributes({ 'aria-pressed': String(value) });
        this._applyToggleIcon();
    }

    _onIconClsOptionChange(): void {
        this._applyToggleIcon();
    }

    _onPressedIconClsOptionChange(): void {
        this._applyToggleIcon();
    }

    _onGhostOptionChange(value: boolean): void {
        this.toggleCls('q-toggle--ghost', !!value);
    }

    /** 统一应用图标：pressed 且设置了 pressedIconCls 时切换为激活态图标 */
    private _applyToggleIcon(): void {
        const next = this.pressed && this.pressedIconCls ? this.pressedIconCls : this.iconCls;
        if (next === this._lastIconCls) return;
        if (this._lastIconCls) this.removeCls(this._lastIconCls, 'icon');
        if (next) this.addCls(next, 'icon');
        this.setNodeHidden(!next, 'icon');
        this._lastIconCls = next;
    }

    onClick(): void {
        if (this.disable) return;
        this.pressed = !this.pressed;
        this.emit('toggle', { pressed: this.pressed });
    }
}

ToggleComponent.define(ToggleComponentDefs);
ToggleComponent.use(SizeAbility, ColorAbility);

export { ToggleComponent };
