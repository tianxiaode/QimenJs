/**
 * HeaderFragment 头部模板片段
 *
 * 可复用的头部结构定义，编译时内联展开，不创建组件边界。
 * 使用 fragment 字段引用时，子节点 name 自动加 'header:' 前缀。
 *
 * 展开后的节点名：
 * - header:icon — 图标
 * - header:title — 标题
 * - header:subtitle — 子标题
 * - header:toolsLeft — 左侧工具区
 * - header:toolsRight — 右侧工具区
 * - header:action — 操作按钮
 *
 * @example
 * ```ts
 * { tag: 'div', cls: 'q-card__header', fragment: HeaderFragment }
 * ```
 */

import type { TplFragment } from '@qimenjs/component-core';
import { ItemGroupPooledComponent } from '../itemgroup/ItemGroupPooledComponent';

/** 头部片段 */
export const HeaderFragment: TplFragment = {
    name: 'header',
    children: [
        { tag: 'i', name: 'icon', cls: 'q-header__icon', hidden: true },
        {
            name: 'toolsLeft',
            type: ItemGroupPooledComponent,
            cls: 'q-header__tools q-header__tools--left',
            hidden: true,
        },
        { tag: 'div', name: 'title', cls: 'q-header__title' },
        { tag: 'span', name: 'subtitle', cls: 'q-header__subtitle', hidden: true },
        {
            name: 'toolsRight',
            type: ItemGroupPooledComponent,
            cls: 'q-header__tools q-header__tools--right',
            hidden: true,
        },
        { tag: 'i', name: 'action', cls: 'q-header__action', hidden: true },
    ],
};
