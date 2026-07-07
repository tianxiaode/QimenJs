/**
 * AnimationAbility 动画能力
 *
 * 使用 Web Animations API 播放动画
 */

import type { AbilityDefinition } from '@qimenjs/composable';

export const AnimationAbility: AbilityDefinition = {
    /**
     * 播放动画
     *
     * @param name - 动画名称（CSS @keyframes 名称）
     * @param options - 动画选项
     * @returns Animation 实例
     */
    play(name: string, options?: { duration?: number; easing?: string; fill?: FillMode }): Animation | undefined {
        if (!this.el || typeof this.el.animate !== 'function') return undefined;

        const keyframes = [
            { animationName: name, offset: 0 },
            { animationName: name, offset: 1 },
        ];

        const animOptions: KeyframeAnimationOptions = {
            duration: options?.duration ?? 250,
            easing: options?.easing ?? 'ease',
            fill: options?.fill ?? 'forwards',
        };

        // 使用 CSS @keyframes 动画
        return this.el.animate(keyframes, animOptions);
    },

    /**
     * 播放关键帧动画
     *
     * @param keyframes - 关键帧数组
     * @param options - 动画选项
     * @returns Animation 实例
     */
    animate(keyframes: Keyframe[], options?: KeyframeAnimationOptions): Animation | undefined {
        if (!this.el || typeof this.el.animate !== 'function') return undefined;
        return this.el.animate(keyframes, options);
    },
};
