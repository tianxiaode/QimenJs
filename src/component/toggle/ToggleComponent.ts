/**
 * ToggleComponent 图标切换组件
 *
 * 图标两态按钮：off 态显示 offIcon，on 态显示 onIcon，单击自动切换。
 * 适用于静音/播放、明暗主题等纯图标状态切换场景。
 *
 * 模板节点：
 * - icon — 图标（iconCls 类名方式）
 *
 * 事件：
 * - toggle — 切换状态变化时触发，数据 { pressed }
 *
 * @example
 * ```ts
 * // 明暗主题切换：太阳/月亮
 * new ToggleComponent({ offIcon: 'fa fa-sun-o', onIcon: 'fa fa-moon-o' })
 * // 静音切换
 * new ToggleComponent({ offIcon: 'fa fa-volume-up', onIcon: 'fa fa-volume-off' })
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
        pressed: false,
        onIcon: null,
        offIcon: null,
        size: 'md',
        color: null,
    },
} as const;

class ToggleComponent extends Component {
    static type = 'toggle';
    get tpl(): TemplateDecl {
        return TOGGLE_TPL;
    }

    domEvents?: DomEventsMap | undefined = {
        click: { path: '', handler: true },
    };

    private _lastIconCls: string | null = null;

    _onPressedOptionChange(value: boolean): void {
        this.toggleCls('q-toggle--on', value);
        this.setAttributes({ 'aria-pressed': String(value) });
        this._applyIcon();
    }

    _onOnIconOptionChange(): void {
        this._applyIcon();
    }

    _onOffIconOptionChange(): void {
        this._applyIcon();
    }

    /** 应用当前状态对应的图标类（pressed → onIcon，否则 offIcon） */
    private _applyIcon(): void {
        const next = (this.pressed ? this.onIcon : this.offIcon) ?? null;
        if (next === this._lastIconCls) return;
        if (this._lastIconCls) this.removeCls(this._lastIconCls, 'icon');
        if (next) this.addCls(next, 'icon');
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
