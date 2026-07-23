/**
 * component-template.ts — 组件模板完整定义
 *
 * ComponentTemplate = tpl（DOM 骨架）+ body（行为配置），
 * 是 withTemplate 的输入类型。
 *
 * tpl 支持两种模式：
 *   - 单模板：tpl 为 TplNode，无条件，始终使用
 *   - 多模板：tpl 为 TplVariant[]，每个变体带 when 条件函数
 *     闭包类根据 props 依次求值 when(props)，首个匹配的变体胜出
 *     when 省略 → 兜底匹配（类似 switch-default）
 *
 * ══════════════════════════════════════════════════════════════
 * 模板选择机制
 * ══════════════════════════════════════════════════════════════
 *
 * 条件函数内聚在模板定义中，调用方只传配置，无需知道内部 key。
 *
 * 选择流程：
 *   1. tpl 为 TplNode → 直接使用，无条件
 *   2. tpl 为 TplVariant[] → 遍历变体，when(props) 首个为 true 的胜出
 *   3. 无 when 的变体 → 兜底匹配（放在数组末尾）
 *   4. 全部不匹配 → 抛出 ComponentError(COMPONENT_TPL_KEY_NOT_FOUND)
 */

import type { TplNode } from './tpl-node-types';
import type { BodyDef } from './tpl-body';

/**
 * 模板变体 — 带条件的模板定义
 *
 * when 函数接收实例化 props，返回 true 表示匹配。
 * 省略 when 等同于 () => true，作为兜底变体。
 *
 * @example
 * ```ts
 * { tpl: { tag: 'div', cls: 'q-input--top' }, when: (cfg) => cfg.labelPosition === 'top' },
 * { tpl: { tag: 'div', cls: 'q-input--left' }, when: (cfg) => cfg.labelPosition === 'left' },
 * { tpl: { tag: 'div', cls: 'q-input--default' } },  // 兜底
 * ```
 */
export interface TplVariant {
    /** 模板根节点定义 */
    tpl: TplNode;

    /**
     * 选择条件函数，接收实例化 props
     * - 返回 true → 匹配此变体
     * - 省略 → 兜底匹配，等同 () => true
     * - 放在数组末尾作为 default 分支
     */
    when?: (config: Record<string, any>) => boolean;
}

/**
 * 组件模板完整定义
 *
 * @example
 * ```ts
 * // 单模板
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
 * // 多模板（条件选择）
 * const InputTemplate: ComponentTemplate = {
 *     tpl: [
 *         { tpl: { tag: 'div', cls: 'q-input--top' }, when: (cfg) => cfg.labelPosition === 'top' },
 *         { tpl: { tag: 'div', cls: 'q-input--left' }, when: (cfg) => cfg.labelPosition === 'left' },
 *         { tpl: { tag: 'div', cls: 'q-input--default' } },  // 兜底
 *     ],
 *     body: {
 *         type: 'input',
 *     }
 * };
 * ```
 */
export interface ComponentTemplate {
    /** 模板定义：单模板（TplNode）或多模板变体（TplVariant[]） */
    tpl: TplNode | TplVariant[];

    /** 组件行为配置 */
    body?: BodyDef;
}
