/**
 * HeaderComponent 头部组件
 *
 * 统一架构的头部组件，可复用于 Dialog、Panel 等容器。
 * 通过 CSS 和 childProps 区分不同场景的样式和行为。
 *
 * 子节点：
 * - icon: 图标（DOM 节点）
 * - title: 标题文本（DOM 节点）
 * - subtitle: 子标题文本（DOM 节点）
 * - tools: 工具区（ItemGroupComponent）
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
 * // Panel 头部 — 带折叠按钮
 * { type: HeaderComponent, props: {
 *     childProps: {
 *         title: { props: { innerHTML: '数据面板' } },
 *         action: { props: { icon: 'collapse' } },
 *     }
 * }}
 * ```
 */

import { Component } from '@qimenjs/component-core';
import { ItemGroupPooledComponent } from '../itemgroup/ItemGroupPooledComponent';
import { ButtonComponent } from '../button/ButtonComponent';

export let HeaderComponent = Component.withTemplate({
    tpl: {
        tag: 'div',
        cls: 'q-header',
        flex: { direction: 'row', align: 'center', gap: '8px' },
        children: [
            {
                tag: 'i',
                name: 'icon',
                cls: 'q-header__icon',
                hidden: true,
            },
            { tag: 'div', name: 'title', cls: 'q-header__title' },
            { tag: 'span', name: 'subtitle', cls: 'q-header__subtitle', hidden: true },
            {
                name: 'tools',
                type: ItemGroupPooledComponent,
                cls: 'q-header__tools',
                hidden: true,
            },
            { name: 'action', type: ButtonComponent, cls: 'q-header__action', hidden: true },
        ],
    },

    body: {
        type: 'Header',
        forwards: {
            action: 'action',
        },
    },
});
