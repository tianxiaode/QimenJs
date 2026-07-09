/**
 * AnimationAbility — 动画控制
 *
 * 对应 LayoutNode 的 AnimationProps 字段：
 * enterAnimation, enterAnimationOptions,
 * leaveAnimation, leaveAnimationOptions,
 * animationEnabled
 *
 * setter 假设 el 已存在（阶段 4）。
 */

import type { ComposableBase } from '../ComposableBase';
import { ABILITY_INIT_PROPS } from '../ComposableBase';
import { AbilityBase } from './AbilityBase';
import type { AnimationProps } from '../../layout/LayoutNode';

const STATE_KEY = 'AnimationAbility';

const animationDescriptors: PropertyDescriptorMap = {
    enterAnimation: {
        get(this: ComposableBase) { return this.abilityState(`${STATE_KEY}:enterAnimation`); },
        set(this: ComposableBase, v: string | undefined) {
            this.abilityState(`${STATE_KEY}:enterAnimation`, v);
        },
        configurable: true, enumerable: true,
    },
    enterAnimationOptions: {
        get(this: ComposableBase) { return this.abilityState(`${STATE_KEY}:enterAnimationOptions`); },
        set(this: ComposableBase, v: AnimationProps['enterAnimationOptions']) {
            this.abilityState(`${STATE_KEY}:enterAnimationOptions`, v);
        },
        configurable: true, enumerable: true,
    },
    leaveAnimation: {
        get(this: ComposableBase) { return this.abilityState(`${STATE_KEY}:leaveAnimation`); },
        set(this: ComposableBase, v: string | undefined) {
            this.abilityState(`${STATE_KEY}:leaveAnimation`, v);
        },
        configurable: true, enumerable: true,
    },
    leaveAnimationOptions: {
        get(this: ComposableBase) { return this.abilityState(`${STATE_KEY}:leaveAnimationOptions`); },
        set(this: ComposableBase, v: AnimationProps['leaveAnimationOptions']) {
            this.abilityState(`${STATE_KEY}:leaveAnimationOptions`, v);
        },
        configurable: true, enumerable: true,
    },
    animationEnabled: {
        get(this: ComposableBase) { return this.abilityState(`${STATE_KEY}:animationEnabled`) ?? true; },
        set(this: ComposableBase, v: boolean) {
            this.abilityState(`${STATE_KEY}:animationEnabled`, v);
        },
        configurable: true, enumerable: true,
    },
};

export class AnimationAbility extends AbilityBase {
    static install(component: ComposableBase, config?: Record<string, any>): void {
        Object.defineProperties(component, animationDescriptors);
        component.abilityState(`${STATE_KEY}:instance`, new AnimationAbility());
    }

    [ABILITY_INIT_PROPS](_props: Record<string, any>): void {
        // 无操作，赋值在阶段 4
    }

    /**
     * 播放进入动画
     */
    static playEnter(component: ComposableBase): void {
        const name = component.abilityState(`${STATE_KEY}:enterAnimation`);
        const options = component.abilityState(`${STATE_KEY}:enterAnimationOptions`);
        const enabled = component.abilityState(`${STATE_KEY}:animationEnabled`) ?? true;
        if (!name || !enabled) return;

        const keyframes = parseAnimationName(name);
        if (keyframes) {
            component.el.animate(keyframes, {
                duration: options?.duration ?? 300,
                easing: options?.easing ?? 'ease',
                fill: options?.fill ?? 'forwards',
            });
        }
    }

    /**
     * 播放离开动画
     */
    static playLeave(component: ComposableBase): Promise<void> {
        const name = component.abilityState(`${STATE_KEY}:leaveAnimation`);
        const options = component.abilityState(`${STATE_KEY}:leaveAnimationOptions`);
        const enabled = component.abilityState(`${STATE_KEY}:animationEnabled`) ?? true;
        if (!name || !enabled) return Promise.resolve();

        const keyframes = parseAnimationName(name);
        if (keyframes) {
            const anim = component.el.animate(keyframes, {
                duration: options?.duration ?? 300,
                easing: options?.easing ?? 'ease',
                fill: options?.fill ?? 'forwards',
            });
            return anim.finished.then(() => {});
        }
        return Promise.resolve();
    }
}

/**
 * 解析动画名称为 Keyframe
 * TODO: 对接动画注册表
 */
function parseAnimationName(name: string): Keyframe[] | null {
    // 预置动画映射
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
