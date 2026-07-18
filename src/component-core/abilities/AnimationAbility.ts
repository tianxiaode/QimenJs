/**
 * AnimationAbility — 动画控制
 *
 * 对应 LayoutNode 的 AnimationProps 字段：
 * enterAnimation, enterAnimationOptions,
 * leaveAnimation, leaveAnimationOptions,
 * animationEnabled
 *
 * 通过 getAnimation(key) / setAnimation(key, value) 方法访问，
 * 不再将动画属性暴露到组件顶层。
 */

import type { AbilityDefinition } from '@/composable';
import type { AnimationProps } from '../types/layout';

/**
 * 支持的动画 key 类型
 */
export type AnimationKey =
    | 'enterAnimation'
    | 'enterAnimationOptions'
    | 'leaveAnimation'
    | 'leaveAnimationOptions'
    | 'animationEnabled';

export const AnimationAbility: AbilityDefinition = {
    /**
     * 获取动画属性值
     *
     * @param key - 动画属性名
     */
    getAnimation(key: AnimationKey): any {
        if (key === 'animationEnabled') {
            return this.props.animationEnabled ?? true;
        }
        return this.props[key];
    },

    /**
     * 设置动画属性值
     *
     * @param key - 动画属性名
     * @param value - 属性值
     */
    setAnimation(key: AnimationKey, value: any): void {
        this.setProp(key, value);
    },

    /**
     * 播放进入动画
     */
    playEnter(): void {
        const name = this.props.enterAnimation;
        const options = this.props.enterAnimationOptions;
        const enabled = this.props.animationEnabled ?? true;
        if (!name || !enabled) return;

        const keyframes = parseAnimationName(name);
        if (keyframes) {
            this.el.animate(keyframes, {
                duration: options?.duration ?? 300,
                easing: options?.easing ?? 'ease',
                fill: options?.fill ?? 'forwards',
            });
        }
    },

    /**
     * 播放离开动画
     */
    playLeave(): Promise<void> {
        const name = this.props.leaveAnimation;
        const options = this.props.leaveAnimationOptions;
        const enabled = this.props.animationEnabled ?? true;
        if (!name || !enabled) return Promise.resolve();

        const keyframes = parseAnimationName(name);
        if (keyframes) {
            const anim = this.el.animate(keyframes, {
                duration: options?.duration ?? 300,
                easing: options?.easing ?? 'ease',
                fill: options?.fill ?? 'forwards',
            });
            return anim.finished.then(() => {});
        }
        return Promise.resolve();
    },
};

/**
 * 解析动画名称为 Keyframe
 * TODO: 对接动画注册表
 */
function parseAnimationName(name: string): Keyframe[] | null {
    const presets: Record<string, Keyframe[]> = {
        fadeIn: [{ opacity: 0 }, { opacity: 1 }],
        fadeOut: [{ opacity: 1 }, { opacity: 0 }],
        slideInUp: [
            { transform: 'translateY(20px)', opacity: 0 },
            { transform: 'translateY(0)', opacity: 1 },
        ],
        slideOutDown: [
            { transform: 'translateY(0)', opacity: 1 },
            { transform: 'translateY(20px)', opacity: 0 },
        ],
        slideInLeft: [
            { transform: 'translateX(-20px)', opacity: 0 },
            { transform: 'translateX(0)', opacity: 1 },
        ],
        slideOutRight: [
            { transform: 'translateX(0)', opacity: 1 },
            { transform: 'translateX(20px)', opacity: 0 },
        ],
        scaleIn: [
            { transform: 'scale(0.9)', opacity: 0 },
            { transform: 'scale(1)', opacity: 1 },
        ],
        scaleOut: [
            { transform: 'scale(1)', opacity: 1 },
            { transform: 'scale(0.9)', opacity: 0 },
        ],
    };
    return presets[name] ?? null;
}
