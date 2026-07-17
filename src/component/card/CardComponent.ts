/**
 * CardComponent 卡片组件
 *
 * 通用内容容器，由 header + body + footer 三区组成。
 * header 复用 HeaderComponent，footer 可选。
 *
 * 模板节点：
 * - header — 头部区域（HeaderComponent）
 * - body — 内容区域
 * - footer — 底部区域（可选）
 *
 * @example
 * ```ts
 * // 简单卡片
 * new CardComponent({ title: '用户信息' })
 *
 * // 带图标和操作按钮
 * new CardComponent({
 *     title: '通知',
 *     icon: '🔔',
 *     action: '✕',
 * })
 *
 * // 使用方通过 childProps 定制 header 子节点
 * ```
 */

import { TemplateComponent } from '@qimenjs/component-core';
import { HeaderComponent } from '../header/HeaderComponent';

export interface CardProps {
    title?: string;
    icon?: string;
    action?: string;
}

export let CardComponent = TemplateComponent.withTemplate({
    tpl: {
        tag: 'div',
        className: 'q-card',
        children: [
            { name: 'header', type: HeaderComponent, className: 'q-card__header' },
            { tag: 'div', name: 'body', className: 'q-card__body' },
            { tag: 'div', name: 'footer', className: 'q-card__footer', hidden: true },
        ],
    },
    body: {
        type: 'Card',

        forwards: {
            header: 'header',
        },

        _initCard(props?: CardProps): void {
            if (props?.title) {
                const textEl = this.header?.nodeMap?.text?.el as HTMLElement | null;
                if (textEl) textEl.textContent = props.title;
            }

            if (props?.icon) {
                const iconComponent = this.header?.icon;
                if (iconComponent?.nodeMap?.content?.el) {
                    iconComponent.nodeMap.content.el.innerHTML = props.icon;
                    if (iconComponent.el) iconComponent.el.hidden = false;
                }
            }

            if (props?.action) {
                const actionComponent = this.header?.action;
                if (actionComponent?.nodeMap?.icon?.nodeMap?.content?.el) {
                    actionComponent.nodeMap.icon.nodeMap.content.el.innerHTML = props.action;
                    if (actionComponent.el) actionComponent.el.hidden = false;
                }
                if (actionComponent?.nodeMap?.text?.el) {
                    actionComponent.nodeMap.text.el.textContent = '';
                }
            }
        },
    },
});

export type CardComponent = InstanceType<typeof CardComponent>;