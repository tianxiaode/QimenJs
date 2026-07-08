/**
 * 样式管理能力接口
 *
 * 提供完整的样式动态管理：
 * - className/style 属性管理
 * - class 增删查改
 * - style 属性读写
 * - DOM 属性操作
 *
 * 所有组件都需要此能力。
 */

export interface IStyleAbility {
    /** CSS 类名 */
    className: string;

    /** 内联样式对象 */
    style: Record<string, string> | undefined;

    // ── class 操作 ──

    /** 添加 class */
    addClass(name: string): void;

    /** 移除 class */
    removeClass(name: string): void;

    /** 切换 class */
    toggleClass(name: string, force?: boolean): void;

    /** 检查是否包含指定 class */
    hasClass(name: string): boolean;

    /** 替换 class */
    replaceClass(oldName: string, newName: string): void;

    // ── style 操作 ──

    /**
     * 设置样式属性
     *
     * 支持两种调用方式：
     * - setStyle(prop, value) - 设置单个属性
     * - setStyle({ prop1: val1, prop2: val2 }) - 批量设置
     *
     * @returns 组件自身，支持链式调用
     */
    setStyle(propOrProps: string | Record<string, string>, value?: string): any;

    /** 获取单个样式属性值 */
    getStyle(prop: string): string;

    /** 移除样式属性 */
    removeStyle(prop: string): void;

    // ── DOM 属性操作 ──

    /** 设置 DOM 属性 */
    setAttribute(attr: string, value: string): void;

    /** 获取 DOM 属性 */
    getAttribute(attr: string): string | null;

    /** 移除 DOM 属性 */
    removeAttribute(attr: string): void;
}
