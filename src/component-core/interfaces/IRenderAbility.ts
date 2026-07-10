/**
 * 渲染能力接口
 *
 * 管理组件的 DOM 元素创建和模板注入。
 * 所有组件都需要此能力——没有 el 就不是组件。
 *
 * 职责：
 * - el 创建：constructor 中 document.createElement（不经过 __initProps）
 * - 模板注入：__initProps 中从 TemplateRegistrar 获取模板并注入 el
 * - reinitElement：切换模板时重新注入
 *
 * 时序：
 * 1. constructor → document.createElement → this.el 可用
 * 2. mount → __initProps → 从注册表获取模板 → el.innerHTML = templateHtml
 */

export interface IRenderAbility {
    /** 组件根 DOM 元素 */
    readonly el: HTMLElement;

    /**
     * 重新初始化元素内容（切换模板）
     *
     * 清空当前 el 内容，从新模板注入。
     * 切换后需要重新初始化 ContentManager。
     *
     * @param templateId - 新模板 ID，不传则使用当前 templateId
     */
    reinitElement(templateId?: string): void;
}
