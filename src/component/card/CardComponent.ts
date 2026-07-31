/**
 * CardComponent 卡片组件
 *
 * 通用内容容器，由 header + body + footer 三区组成。
 * header 通过 HeaderFragment 模板片段内联，无组件边界。
 *
 * @example
 * ```ts
 * new CardComponent({ title: '用户信息' })
 * new CardComponent({ title: '通知', icon: '🔔', action: '✕' })
 * ```
 */

import { Component } from '@qimenjs/component-core';
import { CARD_TPL } from './card-tpl';

export interface CardProps {
    title?: string;
    icon?: string;
    action?: string;
}

class CardComponent extends Component {
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

CardComponent.useTemplate(CARD_TPL);
export { CardComponent };
export type CardComponentInstance = InstanceType<typeof CardComponent>;
