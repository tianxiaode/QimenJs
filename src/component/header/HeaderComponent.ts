/**
 * HeaderComponent 头部组件
 *
 * 统一架构的头部组件，可复用于 Dialog、Panel 等容器。
 * 通过 CSS 和 childProps 区分不同场景的样式和行为。
 *
 * 子节点：
 * - icon: 图标（DOM 节点）
 * - toolsLeft: 左侧工具区（ItemGroupPooledComponent）
 * - title: 标题文本（DOM 节点）
 * - subtitle: 子标题文本（DOM 节点）
 * - toolsRight: 右侧工具区（ItemGroupPooledComponent）
 * - action: 操作按钮（ButtonComponent，如 close/collapse）
 *
 * 使用示例：
 * ```ts
 * // Dialog 头部 — 带 close 按钮
 * { type: HeaderComponent, props: {
 *     childProps: {
 *         icon: { props: { innerHTML: '⚠' } },
 *         title: { props: { innerHTML: '确认删除' } },
 *         action: { props: { icon: 'close' } },
 *     }
 * }}
 *
 * // Panel 头部 — 左右工具区 + 折叠按钮
 * { type: HeaderComponent, props: {
 *     childProps: {
 *         title: { props: { innerHTML: '数据面板' } },
 *         toolsLeft: { props: { items: [...] } },
 *         toolsRight: { props: { items: [...] } },
 *         action: { props: { icon: 'collapse' } },
 *     }
 * }}
 * ```
 */

import { Component } from '@qimenjs/component-core';

export interface HeaderProps {
    icon?: string;
    title?: string;
    subtitle?: string;
    toolsLeft?: Record<string, any>;
    toolsRight?: Record<string, any>;
    action?: Record<string, any>;
}

class HeaderComponent extends Component {
    forwards = {
        action: 'action',
    };

    onAfterInit(props?: HeaderProps): void {
        if (props?.icon !== undefined) {
            this.setNodeHidden(false, 'icon');
            this.icon = props.icon;
        }
        if (props?.title !== undefined) {
            this.title = props.title;
        }
        if (props?.subtitle !== undefined) {
            this.setNodeHidden(false, 'subtitle');
            this.subtitle = props.subtitle;
        }
        if (props?.toolsLeft) {
            this.setNodeHidden(false, 'toolsLeft');
            const toolsLeftComp = this.nodeMap?.toolsLeft?.component;
            if (toolsLeftComp) {
                toolsLeftComp._initItemGroupComponent(props.toolsLeft);
            }
        }
        if (props?.toolsRight) {
            this.setNodeHidden(false, 'toolsRight');
            const toolsRightComp = this.nodeMap?.toolsRight?.component;
            if (toolsRightComp) {
                toolsRightComp._initItemGroupComponent(props.toolsRight);
            }
        }
        if (props?.action) {
            this.setNodeHidden(false, 'action');
            const actionComp = this.nodeMap?.action?.component;
            if (actionComp && typeof actionComp.update === 'function') {
                actionComp.update(props.action);
            }
        }
    }
}

export { HeaderComponent };
export type HeaderComponentInstance = InstanceType<typeof HeaderComponent>;
