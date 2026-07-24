/**
 * component-template.ts — 组件模板定义
 *
 * ComponentTemplate = tpl（DOM 骨架）+ body（行为配置），
 * 是 withTemplate 的输入类型。
 *
 * 直接类模式：只有单模板，不再支持多模板 when 条件选择。
 * 变体派生统一通过 .replace() 实现。
 */

import type { TplNode } from './tpl-node-types';
import type { BodyDef } from './tpl-body';
import type { TplEvents, ItemEvents } from './tpl-events';

/**
 * 组件模板定义
 *
 * @example
 * ```ts
 * const ButtonTemplate: ComponentTemplate = {
 *     tpl: {
 *         tag: 'div',
 *         cls: 'q-button',
 *         flex: true,
 *         children: [
 *             { tag: 'i', name: 'icon', cls: 'q-button__icon' },
 *             { tag: 'span', name: 'text', cls: 'q-button__text' },
 *         ]
 *     },
 *     body: {
 *         type: 'button',
 *     }
 * };
 * ```
 */
export interface ComponentTemplate {
    /** 模板根节点定义 */
    tpl: TplNode;

    /** 组件行为配置 */
    body?: BodyDef;

    /** 组件级事件委托声明（与 body 同级） */
    tplEvents?: TplEvents;

    /** ItemGroup 子组件事件委托声明（与 tplEvents 同级） */
    itemEvents?: ItemEvents;
}
