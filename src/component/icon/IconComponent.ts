/**
 * IconComponent 图标组件
 *
 * 通用图标容器，通过 content 指定图标类名（如 save/eye），
 * 尺寸由 SizeAbility 提供 sm/md/lg 三档，默认 md。
 *
 * @example
 * ```ts
 * new IconComponent({ content: 'save' })
 * new IconComponent({ content: 'eye', size: 'lg' })
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
        content: null,
        size: 'md',
    },
} as const;

class IconComponent extends Component {
    static type = 'icon';
    get tpl(): TemplateDecl {
        return ICON_TPL;
    }

    _onContentOptionChange(value: string, old: string): void {
        if (value) this.addCls(value, 'content');
        if (old) this.removeCls(old, 'content');
    }
}

IconComponent.define(IconComponentDefs);
IconComponent.use([SizeAbility]);

export { IconComponent };
