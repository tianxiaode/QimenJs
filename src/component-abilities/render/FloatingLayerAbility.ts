/**
 * FloatingLayerAbility — 浮层能力
 *
 * 提供浮层通用逻辑：OverlayRoot 挂载/卸载、z-index 管理、
 * 进入/退出动画、视口定位。
 *
 * 适用于命令式管理器（ToastManager、MsgboxManager 等），
 * 不依赖 TemplateComponent 的重量级基类。
 *
 * 动画：接受自定义 Keyframe 参数，不依赖 AnimationAbility。
 * 定位：支持视口定位（top-right/bottom-center 等）和居中定位，
 *       不依赖 OverlayHostAbility 的锚点定位。
 */

import type { AbilityDefinition } from '@/composable';
import { OverlayRoot } from '@qimenjs/component';
import { ZIndexLevel, nextZIndex, releaseZIndex } from '@qimenjs/component';
import { createEventAdapter } from '@qimenjs/event-dom';
import type { GestureSemantic, InputSignal } from '@qimenjs/event-dom';

// ─── 视口定位类型 ──────────────────────────────────────────

export type ViewportPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top' | 'bottom' | 'center';

// ─── 动画配置 ──────────────────────────────────────────────

export interface FloatingAnimationOptions {
    /** 动画时长 ms，默认 200（进入）/ 150（退出） */
    duration?: number;
    /** 缓动函数，默认 'ease-out'（进入）/ 'ease-in'（退出） */
    easing?: string;
}

// ─── 能力定义 ──────────────────────────────────────────────

export const FloatingLayerAbility: AbilityDefinition = {
    // ─── OverlayRoot 容器访问 ───

    overlayRoot: {
        get(): HTMLElement | null {
            if (typeof document === 'undefined') return null;
            return OverlayRoot.getInstance().getRoot();
        },
    },

    // ─── z-index 管理 ───

    _zIndexLevel: {
        get(): number {
            return this.abilityState('FloatingLayerAbility:zIndexLevel', () => ZIndexLevel.notification);
        },
        set(value: number) {
            this.setAbilityState('FloatingLayerAbility:zIndexLevel', value);
        },
    },

    /**
     * 获取 z-index 并递增计数器
     */
    acquireZIndex(level?: number): number {
        const zLevel = level ?? this._zIndexLevel;
        return nextZIndex(zLevel);
    },

    /**
     * 释放 z-index
     */
    releaseZIndex(): void {
        releaseZIndex(this._zIndexLevel);
    },

    // ─── 挂载/卸载 ───

    /**
     * 挂载元素到 OverlayRoot
     */
    mountToOverlay(el: HTMLElement): void {
        const root = this.overlayRoot;
        if (root) {
            root.appendChild(el);
        }
    },

    /**
     * 从 OverlayRoot 移除元素
     */
    unmountFromOverlay(el: HTMLElement): void {
        if (el.parentNode) {
            el.parentNode.removeChild(el);
        }
    },

    // ─── 动画 ───

    /**
     * 播放进入动画
     */
    playEnterAnimation(el: HTMLElement, keyframes: Keyframe[], options?: FloatingAnimationOptions): Animation {
        return el.animate(keyframes, {
            duration: options?.duration ?? 200,
            easing: options?.easing ?? 'ease-out',
        });
    },

    /**
     * 播放退出动画
     */
    playExitAnimation(el: HTMLElement, keyframes: Keyframe[], options?: FloatingAnimationOptions): Animation {
        return el.animate(keyframes, {
            duration: options?.duration ?? 150,
            easing: options?.easing ?? 'ease-in',
        });
    },

    // ─── 视口定位 ───

    /**
     * 设置视口定位
     *
     * @param el - 目标元素
     * @param position - 视口位置
     * @param offset - 距边缘偏移量 px（用于堆叠）
     * @param margin - 距视口边缘间距 px
     */
    setViewportPosition(el: HTMLElement, position: ViewportPosition, offset: number = 0, margin: number = 16): void {
        // 重置所有定位属性
        el.style.top = '';
        el.style.bottom = '';
        el.style.left = '';
        el.style.right = '';
        el.style.transform = '';

        el.style.position = 'fixed';

        const isTop = position.startsWith('top');
        const isBottom = position.startsWith('bottom');
        const isLeft = position.endsWith('left');
        const isRight = position.endsWith('right');
        const isCenter = position === 'top' || position === 'bottom';
        const isMiddle = position === 'center';

        if (isMiddle) {
            el.style.top = '50%';
            el.style.left = '50%';
            el.style.transform = 'translate(-50%, -50%)';
            return;
        }

        if (isTop) {
            el.style.top = `${margin + offset}px`;
        } else if (isBottom) {
            el.style.bottom = `${margin + offset}px`;
        }

        if (isLeft) {
            el.style.left = `${margin}px`;
        } else if (isRight) {
            el.style.right = `${margin}px`;
        } else if (isCenter) {
            el.style.left = '50%';
            el.style.transform = 'translateX(-50%)';
        }
    },

    /**
     * 获取进入动画的初始 transform
     */
    getEnterTransform(position: ViewportPosition): string {
        if (position === 'center') return 'scale(0.8)';
        if (position.startsWith('top')) return 'translateY(-100%)';
        if (position.startsWith('bottom')) return 'translateY(100%)';
        return 'translateY(-100%)';
    },

    /**
     * 获取退出动画的最终 transform
     */
    getExitTransform(position: ViewportPosition): string {
        if (position === 'center') return 'scale(0.8)';
        if (position.startsWith('top')) return 'translateY(-100%)';
        if (position.startsWith('bottom')) return 'translateY(100%)';
        return 'translateY(-100%)';
    },
};
