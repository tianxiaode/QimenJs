/**
 * CardComponent 卡片组件
 *
 * 通用内容容器，由 header + body + footer 三区组成。
 * header 通过 HeaderFragment 模板片段内联，无组件边界。
 *
 * 模板节点：
 * - header:icon — 头部图标（来自 HeaderFragment）
 * - header:title — 头部标题（来自 HeaderFragment）
 * - header:action — 头部操作按钮（来自 HeaderFragment）
 * - body — 内容区域
 * - footer — 底部区域（可选）
 *
 * @example
 * ```ts
 * new CardComponent({ title: '用户信息' })
 * new CardComponent({ title: '通知', icon: '🔔', action: '✕' })
 * ```
 */

import { TemplateComponent } from '@qimenjs/component-core';
import { HeaderFragment } from '../header/HeaderFragment';

export interface CardProps {
    title?: string;
    icon?: string;
    action?: string;
}

export let CardComponent = TemplateComponent.withTemplate({
    tpl: {
        tag: 'div',
        cls: 'q-card',
        children: [
            { tag: 'div', cls: 'q-card__header', fragment: HeaderFragment },
            { tag: 'div', name: 'body', cls: 'q-card__body' },
            { tag: 'div', name: 'footer', cls: 'q-card__footer', hidden: true },
        ],
    },
    body: {
        type: 'Card',

        _initCard(props?: CardProps): void {
            if (props?.title) {
                this.headerTitle = props.title;
            }

            if (props?.icon) {
                this.headerIcon = props.icon;
                this.headerIconHidden = false;
            }

            if (props?.action) {
                this.headerActionIcon = props.action;
                this.headerActionHidden = false;
            }
        },
    },
});

export type CardComponent = InstanceType<typeof CardComponent>;
