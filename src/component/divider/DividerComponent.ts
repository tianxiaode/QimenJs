/**
 * DividerComponent 分割线组件
 *
 * 水平/垂直分割线，支持文字标签和虚线样式。
 *
 * 模板节点：
 * - text — 文字标签（默认隐藏）
 *
 * @example
 * ```ts
 * new DividerComponent()
 * new DividerComponent({ vertical: true })
 * new DividerComponent({ text: '或者' })
 * new DividerComponent({ dashed: true })
 * ```
 */

import { Component } from '@qimenjs/component-core';
import type { TemplateDecl } from '@/component-core';
import { DIVIDER_TPL } from './divider-tpl';
import { Definitions } from '@/composable';
import './divider.css';

const DividerComponentDefs: Definitions = {
    targetToOptions: {
        text: { target: 'text', to: 'text' },
    },
    options: {
        vertical: false,
        dashed: false,
    },
} as const;

class DividerComponent extends Component {
    static type = 'divider';
    get tpl(): TemplateDecl {
        return DIVIDER_TPL;
    }

    _onTextOptionChange(value: string, _old: string): void {
        this._setNodeHidden(!value, 'text');
    }

    _onVerticalOptionChange(value: boolean): void {
        this.toggleCls('q-divider--vertical', value);
    }

    _onDashedOptionChange(value: boolean): void {
        this.toggleCls('q-divider--dashed', value);
    }
}

DividerComponent.define(DividerComponentDefs);
export { DividerComponent };
