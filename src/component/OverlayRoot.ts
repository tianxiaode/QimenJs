/**
 * OverlayRoot 全局浮层根容器
 *
 * 在 <body> 下创建全局浮层容器，所有浮层组件渲染到该容器中。
 * 浮层容器本身可见（用于 z-index 层叠），但 pointer-events: none
 * 避免遮挡下层交互。
 */

export class OverlayRoot {
    private static instance: OverlayRoot;
    private root: HTMLElement | null = null;

    private constructor() {}

    /**
     * 获取单例实例
     */
    static getInstance(): OverlayRoot {
        if (!OverlayRoot.instance) {
            OverlayRoot.instance = new OverlayRoot();
        }
        return OverlayRoot.instance;
    }

    /**
     * 获取浮层根容器
     *
     * 懒创建 #q-overlay-root 容器挂到 <body> 下
     */
    getRoot(): HTMLElement {
        if (this.root) return this.root;

        if (typeof document === 'undefined') {
            throw new Error('OverlayRoot: document is not available');
        }

        this.root = document.getElementById('q-overlay-root');
        if (!this.root) {
            this.root = document.createElement('div');
            this.root.id = 'q-overlay-root';
            this.root.style.position = 'fixed';
            this.root.style.top = '0';
            this.root.style.left = '0';
            this.root.style.width = '100%';
            this.root.style.height = '100%';
            this.root.style.zIndex = '1050';
            this.root.style.pointerEvents = 'none';
            document.body.appendChild(this.root);
        }

        return this.root;
    }

    /**
     * 销毁浮层根容器
     */
    destroy(): void {
        if (this.root && this.root.parentNode) {
            this.root.parentNode.removeChild(this.root);
        }
        this.root = null;
        OverlayRoot.instance = undefined as any;
    }
}
