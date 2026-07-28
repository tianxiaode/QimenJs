/**
 * template-constants.ts — 模板相关类型
 *
 * 定义模板系统中使用的常量和配置类型。
 * 这些类型用于配置内容属性和动画效果。
 */

/**
 * 内容属性定义
 *
 * 定义节点内容属性的配置，用于指定内容值应该设置到哪个节点属性。
 *
 * @example
 * ```ts
 * // 定义内容属性
 * const titleDef: ContentPropDef = {
 *     nodeProp: 'text'  // 内容值设置到 node.text
 * };
 *
 * // 在模板中使用
 * { name: 'title', tag: 'span' }
 * // this.title = 'Hello' → 自动设置 nodeMap.title.el.textContent = 'Hello'
 * ```
 */
export interface ContentPropDef {
    /**
     * 节点属性名
     *
     * 内容值应该设置到的节点属性，如 'text'、'html'、'value' 等。
     */
    nodeProp: string;
}

/**
 * 动画选项
 *
 * 定义组件动画的基本配置，包括时长、缓动函数和填充模式。
 * 用于 body.animation 配置中。
 *
 * @example
 * ```ts
 * // 在 body 中使用
 * body: {
 *     animation: {
 *         enter: 'slideInUp',
 *         leave: 'slideOutDown',
 *         duration: 200,
 *         easing: 'ease-in-out',
 *         fill: 'forwards'
 *     }
 * }
 *
 * // 自定义动画时长
 * const options: AnimationOptions = {
 *     duration: 300,
 *     easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
 *     fill: 'both'
 * };
 * ```
 *
 * @see AnimationDecl - 组件动画配置
 */
export interface AnimationOptions {
    /**
     * 动画时长（毫秒）
     *
     * 默认 300ms。
     */
    duration?: number;

    /**
     * 缓动函数
     *
     * CSS 缓动函数，如 'ease'、'ease-in-out'、'linear'、
     * 'cubic-bezier(0.4, 0, 0.2, 1)' 等。
     * 默认 'ease'。
     */
    easing?: string;

    /**
     * 填充模式
     *
     * 动画填充模式，控制动画执行前后的样式应用：
     * - 'none': 不应用任何样式（默认）
     * - 'forwards': 保留最后一帧样式
     * - 'backwards': 应用第一帧样式
     * - 'both': 同时应用 forwards 和 backwards
     */
    fill?: FillMode;
}
