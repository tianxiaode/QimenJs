/**
 * CardComponent 卡片组件
 *
 * 通用内容容器，由 header + body + footer 三区组成。
 *
 * @example
 * ```ts
 * new CardComponent({ title: '用户信息' })
 * new CardComponent({ title: '通知', icon: '🔔', action: '✕' })
 * ```
 */

import { Component } from '@qimenjs/component-core';
import type { TplNode } from '@qimenjs/component-core';
import { CARD_TPL } from './card-tpl';
import './card.css.ts';

/** 卡片属性接口 */
export interface CardProps {
    title?: string;
    icon?: string;
    action?: string;
}

class CardComponent extends Component {
    get tpl(): TplNode {
        return CARD_TPL;
    }

    _initCard(props?: CardProps): void {
        if (props?.title) {
            this.headerTitle = props.title;
        }

        if (props?.icon) {
            this.headerIcon = props.icon;
            this.setNodeHidden(false, 'headerIcon');
        }

        if (props?.action) {
            this.headerActionIcon = props.action;
            this.setNodeHidden(false, 'headerAction');
        }
    }
}

export { CardComponent };
/** 卡片实例类型 */
export type CardComponentInstance = InstanceType<typeof CardComponent>;
