/**
 * SwitchComponent 开关组件
 *
 * 椭圆滑块开关，单击左右移动切换，语义对齐 W3C switch（role="switch" + aria-checked）。
 * 用于即时生效的布尔状态（如深色模式、通知开关）。
 *
 * 模板节点：
 * - thumb — 滑块（根节点即轨道）
 *
 * 事件：
 * - change — 状态变化时触发，数据 { checked }
 *
 * @example
 * ```ts
 * new SwitchComponent({ checked: true })
 * new SwitchComponent({ color: 'success' })
 * switch.on('change', ({ checked }) => { ... })
 * ```
 */

import { Component } from '@qimenjs/component-core';
import type { DomEventsMap, TemplateDecl } from '@/component-core';
import { ColorAbility } from '@qimenjs/component-abilities';
import { SWITCH_TPL } from './switch-tpl';
import { Definitions } from '@/composable';
import './switch.css';

const SwitchComponentDefs: Definitions = {
    options: {
        checked: false,
        color: null,
    },
} as const;

class SwitchComponent extends Component {
    static type = 'switch';
    get tpl(): TemplateDecl {
        return SWITCH_TPL;
    }

    domEvents?: DomEventsMap | undefined = {
        click: { path: '', handler: true },
    };

    _onCheckedOptionChange(value: boolean): void {
        this.toggleCls('q-switch--checked', value);
        this.setAttributes({ 'aria-checked': String(value) });
    }

    onAfterInit(): void {
        super.onAfterInit();
        this.setAttributes({ role: 'switch' });
    }

    onClick(): void {
        if (this.disable) return;
        this.checked = !this.checked;
        this.emit('change', { checked: this.checked });
    }
}

SwitchComponent.define(SwitchComponentDefs);
SwitchComponent.use(ColorAbility);

export { SwitchComponent };
export type SwitchComponentInstance = InstanceType<typeof SwitchComponent>;
