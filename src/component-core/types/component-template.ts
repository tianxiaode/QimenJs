/**
 * component-template.ts — 组件模板定义
 *
 * ComponentTemplate = tpl（DOM 骨架）+ body（行为配置），
 * 是 withTemplate 的输入类型。
 *
 * 直接类模式：只有单模板，不再支持多模板 when 条件选择。
 * 变体派生统一通过 .replace() 实现。
 *
 * ══════════════════════════════════════════════════════════════
 * 组件模板结构
 * ══════════════════════════════════════════════════════════════
 *
 * tpl: 模板结构定义（TplNode）
 *   - 定义 DOM 骨架和组件树
 *   - 编译时生成 HTML + nodeMetas
 *   - 运行时克隆模板、构建 nodeMap
 *
 * body: 组件行为配置（BodyDef）
 *   - 静态属性：type/entityKey/eventKey/floatKey/dragKey/listens/forwards
 *   - 初始化配置：floats/drags/animation/abilities/nodes/localData
 *   - 生命周期钩子：onBeforeInit/onAfterInit/onMounted/onResize/onUpdated/onBeforeUnmount/onBeforeDispose
 *   - 自定义方法：任意方法名
 *
 * @see TplNode - 模板节点定义
 * @see BodyDef - 组件行为定义
 */

import type { TplNode } from './tpl-node-types';
import type { BodyDef } from './tpl-body';

/**
 * 组件模板定义
 *
 * 完整的组件模板由两部分组成：
 * 1. tpl - DOM 骨架结构
 * 2. body - 组件行为和配置
 *
 * @example
 * ```ts
 * // 基本按钮组件
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
 *
 * // 带事件处理的按钮组件
 * const ButtonWithEvents: ComponentTemplate = {
 *     tpl: {
 *         tag: 'button',
 *         name: 'btn',
 *         cls: 'q-button',
 *         children: [
 *             { tag: 'i', name: 'icon', cls: 'q-button__icon' },
 *             { tag: 'span', name: 'text', cls: 'q-button__text' },
 *         ]
 *     },

 *     body: {
 *         type: 'button',
 *         onIconClick(ctx, el) {
 *             console.log('icon clicked');
 *         }
 *     }
 * };
 *
 * // 带浮动层的下拉按钮
 * const DropButtonTemplate: ComponentTemplate = {
 *     tpl: {
 *         tag: 'div',
 *         name: 'root',
 *         cls: 'q-drop-button',
 *         children: [
 *             { tag: 'button', name: 'btn', cls: 'q-drop-button__btn' },
 *             { tag: 'i', name: 'icon', cls: 'q-drop-button__icon' }
 *         ]
 *     },
 *     body: {
 *         type: 'dropButton',
 *         floats: {
 *             btn: { type: 'DropPanel', align: 'bottom', trigger: 'click' }
 *         }
 *     }
 * };
 * ```
 *
 * @see withTemplate - 创建组件的工厂函数
 * @see TplNode - 模板节点定义
 * @see BodyDef - 组件行为定义

 */
export interface ComponentTemplate {
    /**
     * 模板根节点定义
     *
     * 定义组件的 DOM 骨架结构，包括标签、类名、子节点等。
     * 编译时递归遍历生成 HTML，运行时克隆模板构建 nodeMap。
     */
    tpl: TplNode;

    /**
     * 组件行为配置
     *
     * 定义组件的行为、状态管理、生命周期钩子等。
     * 包括静态属性、初始化配置、生命周期方法、自定义方法。
     */
    body?: BodyDef;
}
