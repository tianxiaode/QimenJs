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
 * toggle.on('toggle', ({ pressed }) => { ... })
 * ```
 */

import { Component } from '@qimenjs/component-core';
import type { DomEventsMap, TemplateDecl } from '@/component-core';
import { SizeAbility } from '@qimenjs/component-abilities';
import { TOGGLE_TPL } from './toggle-tpl';
import { Definitions } from '@/composable';
import './toggle.css';

const ToggleComponentDefs: Definitions = {
    options: {
        text: null,
        pressed: false,
        iconCls: null,
        size: 'md',
    },
} as const;

class ToggleComponent extends Component {
    static type = 'toggle';
    get tpl(): TemplateDecl {
        return TOGGLE_TPL;
    }

    domEvents?: DomEventsMap | undefined = {
        click: { handler: true },
    };

    _onTextOptionChange(value: string) {
        this._setNodeText('text', value);
    }

    _onPressedOptionChange(value: boolean): void {
        this.toggleCls('q-toggle--pressed', value);
        this.setAttributes({ 'aria-pressed': String(value) });
    }

    _onIconClsOptionChange(value: string, old: string): void {
        this._setNodeHidden(!value, 'icon');
        if (value) this.addCls(value, 'icon');
        if (old) this.removeCls(old, 'icon');
    }

    onClick(): void {
        if (this.disable) return;
        this.pressed = !this.pressed;
        this.emit('toggle', { pressed: this.pressed });
    }
}

ToggleComponent.define(ToggleComponentDefs);
ToggleComponent.use([SizeAbility]);

export { ToggleComponent };
/** 切换实例类型 */
export type ToggleComponentInstance = InstanceType<typeof ToggleComponent>;