/**
 * AnimationAbility — 动画控制
 *
 * 对应 LayoutNode 的 AnimationProps 字段：
 * enterAnimation, enterAnimationOptions,
 * leaveAnimation, leaveAnimationOptions,
 * animationEnabled
 */

import type { AbilityDefinition } from '@/composable';
import type { AnimationProps } from '@/layout/LayoutNode';

export const AnimationAbility: AbilityDefinition = {
    enterAnimation: {
        get(): string | undefined { return this.props.enterAnimation; },
        set(v: string | undefined) { this.setProp('enterAnimation', v); },
    },

    enterAnimationOptions: {
        get(): AnimationProps['enterAnimationOptions'] { return this.props.enterAnimationOptions; },
        set(v: AnimationProps['enterAnimationOptions']) { this.setProp('enterAnimationOptions', v); },
    },

    leaveAnimation: {
        get(): string | undefined { return this.props.leaveAnimation; },
        set(v: string | undefined) { this.setProp('leaveAnimation', v); },
    },

    leaveAnimationOptions: {
        get(): AnimationProps['leaveAnimationOptions'] { return this.props.leaveAnimationOptions; },
        set(v: AnimationProps['leaveAnimationOptions']) { this.setProp('leaveAnimationOptions', v); },
    },

    animationEnabled: {
        get(): boolean { return this.props.animationEnabled ?? true; },
        set(v: boolean) { this.setProp('animationEnabled', v); },
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
        slideInUp: [{ transform: 'translateY(20px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }],
        slideOutDown: [{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(20px)', opacity: 0 }],
        slideInLeft: [{ transform: 'translateX(-20px)', opacity: 0 }, { transform: 'translateX(0)', opacity: 1 }],
        slideOutRight: [{ transform: 'translateX(0)', opacity: 1 }, { transform: 'translateX(20px)', opacity: 0 }],
        scaleIn: [{ transform: 'scale(0.9)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }],
        scaleOut: [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(0.9)', opacity: 0 }],
    };
    return presets[name] ?? null;
}
