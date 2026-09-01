import { ViewportPosition } from '../../types';
import type { AbilityDefinition } from '@/composable';

export const ViewportPositionAbility: AbilityDefinition = {
    setViewportPosition(position: ViewportPosition, offset: number = 0, margin: number = 16): void {
        this.top = null;
        this.bottom = null;
        this.left = null;
        this.right = null;
        this.transform = null;
        this.position = 'fixed'; // 设置固定定位

        const isTop = position.startsWith('top');
        const isBottom = position.startsWith('bottom');
        const isLeft = position.endsWith('left');
        const isRight = position.endsWith('right');
        const isCenter = position === 'top' || position === 'bottom';
        const isMiddle = position === 'center';

        if (isMiddle) {
            this.top = '50%';
            this.transform = 'translate(-50%, -50%)';
            return;
        }

        if (isTop) {
            this.top = `${margin + offset}px`;
        } else if (isBottom) {
            this.bottom = `${margin + offset}px`;
        }

        if (isLeft) {
            this.left = `${margin}px`;
        } else if (isRight) {
            this.right = `${margin}px`;
        } else if (isCenter) {
            this.left = '50%';
            this.transform = 'translateX(-50%)';
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
} satisfies AbilityDefinition;
