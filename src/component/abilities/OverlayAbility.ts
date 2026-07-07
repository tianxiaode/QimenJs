/**
 * OverlayAbility 浮层能力
 *
 * 提供 overlayRoot、openOverlay、closeOverlay、zIndex 能力
 */

import type { AbilityDefinition } from '@qimenjs/composable';

export const OverlayAbility: AbilityDefinition = {
    /**
     * 获取 OverlayRoot 容器
     */
    overlayRoot: {
        get(): HTMLElement | null {
            if (typeof document === 'undefined') return null;

            let root = document.getElementById('q-overlay-root');
            if (!root) {
                root = document.createElement('div');
                root.id = 'q-overlay-root';
                root.style.position = 'fixed';
                root.style.top = '0';
                root.style.left = '0';
                root.style.zIndex = '1050';
                root.style.pointerEvents = 'none';
                document.body.appendChild(root);
            }
            return root;
        },
    },

    /**
     * 打开浮层
     */
    openOverlay(): void {
        const root = this.overlayRoot;
        if (root && this.el) {
            this.el.style.pointerEvents = 'auto';
            root.appendChild(this.el);
        }
    },

    /**
     * 关闭浮层
     */
    closeOverlay(): void {
        if (this.el && this.el.parentNode) {
            this.el.parentNode.removeChild(this.el);
        }
    },
};
