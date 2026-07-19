/**
 * component-template.ts — 组件模板完整定义
 *
 * ComponentTemplate = tpl（DOM 骨架）+ body（行为配置），
 * 是 withTemplate 的输入类型。
 */

import type { TplNode } from './tpl-node-types';
import type { BodyDef } from './tpl-body';

/**
 * 组件模板完整定义
 *
 * @example
 * ```ts
 * const ButtonTemplate: ComponentTemplate = {
 *     tpl: {
 *         tag: 'div',
 *         cls: 'q-button',
 *         flex: true,
 *         children: [
 *             { name: 'icon', type: IconComponent, cls: 'q-button__icon' },
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
    /** 模板根节点定义（DOM 骨架） */
    tpl: TplNode;

    /** 组件行为配置 */
    body?: BodyDef;
}
