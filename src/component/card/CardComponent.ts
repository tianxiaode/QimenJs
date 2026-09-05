/**
 * CardComponent 卡片组件
 *
 * 通用内容容器，由 header（icon + title + action） + body + footer 三区组成。
 * 内联 header 结构，不再依赖 HeaderComponent。
 *
 * 模板节点：
 * - headerIcon  — 头部图标（默认隐藏）
 * - headerTitle — 头部标题
 * - headerAction — 头部操作按钮（默认隐藏）
 * - body        — 内容区
 * - footer      — 底部（默认隐藏）
 *
 * @example
 * ```ts
 * new CardComponent({ title: '用户信息' })
 * new CardComponent({ title: '通知', icon: '🔔', action: '✕' })
 * ```
 */

import { Component } from '@qimenjs/component-core';
import type { TemplateDecl } from '@/component-core';
import { CARD_TPL } from './card-tpl';
import { Definitions } from '@/composable';
import './card.css';

const CardComponentDefs: Definitions = {
    options: {
        title: null,
        icon: null,
        action: null,
    },
} as const;

class CardComponent extends Component {
    static type = 'card';
    get tpl(): TemplateDecl {
        return CARD_TPL;
    }

    _onTitleOptionChange(value: string, _old: string) {
        this._setNodeText('headerTitle', value);
        this._setNodeHidden(!value, 'headerTitle');
    }

    _onIconOptionChange(value: string, old: string) {
        this._setNodeHidden(!value, 'headerIcon');
        if (value) this.addCls(value, 'headerIcon');
        if (old) this.removeCls(old, 'headerIcon');
    }

    _onActionOptionChange(value: string, old: string) {
        this._setNodeHidden(!value, 'headerAction');
        if (value) this.addCls(value, 'headerAction');
        if (old) this.removeCls(old, 'headerAction');
    }
}

CardComponent.define(CardComponentDefs);
export { CardComponent };
/** 卡片实例类型 */
export type CardComponentInstance = InstanceType<typeof CardComponent>;
