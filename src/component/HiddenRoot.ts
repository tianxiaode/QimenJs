/**
 * HiddenRoot 隐藏根组件
 *
 * 单例模式，在 <body> 下创建一个不可见的根容器，
 * 用于挂载不需要可见的组件（Dialog 浮层、Tooltip、全局通知、隐藏表单等）。
 *
 * 特性：
 * - 单例，全局唯一
 * - 懒创建，首次访问时才创建 DOM
 * - display: none，不影响页面布局
 * - 可通过 mountHidden(comp) 便捷挂载组件
 * - 可通过 unmountHidden(comp) 便捷卸载组件
 *
 * @example
 * ```js
 * // 挂载一个隐藏组件
 * HiddenRoot.getInstance().mountHidden(dialog);
 *
 * // 获取根容器
 * const root = HiddenRoot.getInstance().getRoot();
 * ```
 */

import type { ComponentBase } from '@qimenjs/component-core';

/** 隐藏根容器的 DOM ID */
const HIDDEN_ROOT_ID = 'q-hidden-root';

export class HiddenRoot {
    private static instance: HiddenRoot;
    private root: HTMLElement | null = null;

    private constructor() {}

    /**
     * 获取单例实例
     */
    static getInstance(): HiddenRoot {
        if (!HiddenRoot.instance) {
            HiddenRoot.instance = new HiddenRoot();
        }
        return HiddenRoot.instance;
    }

    /**
     * 获取隐藏根容器
     *
     * 懒创建 #q-hidden-root 容器挂到 <body> 下
     */
    getRoot(): HTMLElement {
        if (this.root) return this.root;

        if (typeof document === 'undefined') {
            throw new Error('HiddenRoot: document is not available');
        }

        this.root = document.getElementById(HIDDEN_ROOT_ID);
        if (!this.root) {
            this.root = document.createElement('div');
            this.root.id = HIDDEN_ROOT_ID;
            this.root.style.display = 'none';
            this.root.setAttribute('aria-hidden', 'true');
            document.body.appendChild(this.root);
        }

        return this.root;
    }

    /**
     * 将组件挂载到隐藏根容器
     *
     * @param comp - 要挂载的组件
     */
    mountHidden(comp: ComponentBase): void {
        const root = this.getRoot();
        comp.mount(root);
    }

    /**
     * 从隐藏根容器卸载组件
     *
     * @param comp - 要卸载的组件
     */
    unmountHidden(comp: ComponentBase): void {
        comp.unmount();
    }

    /**
     * 销毁隐藏根容器
     *
     * 移除 DOM 元素，重置单例
     */
    destroy(): void {
        if (this.root && this.root.parentNode) {
            this.root.parentNode.removeChild(this.root);
        }
        this.root = null;
        HiddenRoot.instance = undefined as any;
    }
}
