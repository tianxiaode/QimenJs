import { ViewportPosition } from '../../types';
import type { AbilityDefinition } from '@/composable';

export const ViewportPositionAbility: AbilityDefinition = {
    setViewportPosition(position: ViewportPosition, offset: number = 0, margin: number = 16): void {
        this.el.style.top = null;
        this.el.style.bottom = null;
        this.el.style.left = null;
        this.el.style.right = null;
        this.el.style.transform = null; // 保存变换
        this.el.style.position = 'fixed'; // 保存位置
        const isTop = position.startsWith('top');
        const isBottom = position.startsWith('bottom');
        const isLeft = position.endsWith('left');
        const isRight = position.endsWith('right');
        const isCenter = position === 'top' || position === 'bottom';
        const isMiddle = position === 'center';

        if (isMiddle) {
            this.el.style.top = '50%';
            this.el.style.left = '50%';
            this.el.style.transform = 'translate(-50%, -50%)';
            return;
        }

        if (isTop) {
            this.el.style.top = `${margin + offset}px`;
        } else if (isBottom) {
            this.el.style.bottom = `${margin + offset}px`;
        }

        if (isLeft) {
            this.el.style.left = `${margin}px`;
        } else if (isRight) {
            this.el.style.right = `${margin}px`;
        } else if (isCenter) {
            this.el.style.left = '50%';
            this.el.style.transform = 'translateX(-50%)';
        }
    },

    getEnterTransform(position: ViewportPosition): string {
        if (position === 'center') return 'scale(0.8)';
        if (position.startsWith('top')) return 'translateY(-100%)';
        if (position.startsWith('bottom')) return 'translateY(100%)';
        return 'translateY(-100%)';
    },

    getExitTransform(position: ViewportPosition): string {
        if (position === 'center') return 'scale(0.8)';
        if (position.startsWith('top')) return 'translateY(-100%)';
        if (position.startsWith('bottom')) return 'translateY(100%)';
        return 'translateY(-100%)';
    },
};
