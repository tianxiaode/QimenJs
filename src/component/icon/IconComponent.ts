/**
 * IconComponent 图标组件
 *
 * 通用图标容器，通过 iconCls 指定图标类名（如 save/eye），
 * 尺寸由 SizeAbility 提供 sm/md/lg 三档，默认 md。
 *
 * 图标渲染统一走 CSS 方案：iconCls 传入 CSS 类名，由 CSS 决定渲染方式，
 * 三类图标都通过「类名 + CSS 变量」承载：
 * - 字符/emoji：`--q-icon-content: '💾'`
 * - FontAwesome：`--q-icon-content: '\f0c7'` + `--q-icon-font: 'Font Awesome 6 Free'` + `--q-icon-weight: 900`
 * - SVG：`content: ''` + `background: url(...)`
 *
 * @example
 * ```ts
 * new IconComponent({ iconCls: 'save' })
 * new IconComponent({ iconCls: 'eye', size: 'lg' })
 * ```
 */

import { Component } from '@qimenjs/component-core';
import type { TemplateDecl } from '@/component-core';
import { SizeAbility } from '@qimenjs/component-abilities';
import { ICON_TPL } from './icon-tpl';
import { Definitions } from '@/composable';
import './icon.css';

const IconComponentDefs: Definitions = {
    options: {
        iconCls: null,
        size: 'md',
    },
} as const;

class IconComponent extends Component {
    static type = 'icon';
    get tpl(): TemplateDecl {
        return ICON_TPL;
    }

    _onIconClsOptionChange(value: string, old: string): void {
        if (value) this.addCls(value, 'icon');
        if (old) this.removeCls(old, 'icon');
    }
}

IconComponent.define(IconComponentDefs);
IconComponent.use([SizeAbility]);

export { IconComponent };