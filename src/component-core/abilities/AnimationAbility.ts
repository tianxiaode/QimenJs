/**
 * AnimationAbility — 组件动画能力
 *
 * 声明式配置，自动触发：
 * - body.animation.enter → 初始化完成后自动播放
 * - body.animation.leave → 销毁前自动播放
 *
 * 配置在 body 中声明，不需要手动调用 playEnter/playLeave：
 *   body: {
 *       animation: {
 *           enter: 'slideInUp',
 *           leave: 'slideOutDown',
 *           duration: 200,
 *       }
 *   }
 *
 * 也支持手动播放（如浮层场景）：
 *   this.playEnter();
 *   await this.playLeave();
 */

import type { AbilityDefinition } from '@/composable';
import type { AnimationDecl } from '../types/tpl-body';
import { ANIMATION_PRESETS } from '../utils/template-constants';

export const AnimationAbility= {
    get _animDecl(): AnimationDecl | undefined {
        const ctor = this.constructor as any;
        return ctor._animation ?? undefined;
    },

    playEnter(): void {
        const decl = this._animDecl;
        if (!decl || decl.enabled === false) return;

        const keyframes = resolveKeyframes(decl.enter, decl.enterKeyframes);
        if (!keyframes) return;

        this.el?.animate(keyframes, {
            duration: decl.duration ?? 300,
            easing: decl.easing ?? 'ease',
            fill: 'forwards',
        });
    },

    playLeave(): Promise<void> {
        const decl = this._animDecl;
        if (!decl || decl.enabled === false) return Promise.resolve();

        const keyframes = resolveKeyframes(decl.leave, decl.leaveKeyframes);
        if (!keyframes) return Promise.resolve();

        const anim = this.el?.animate(keyframes, {
            duration: decl.duration ?? 300,
            easing: decl.easing ?? 'ease',
            fill: 'forwards',
        });

        return anim ? anim.finished.then(() => {}) : Promise.resolve();
    },
};

function resolveKeyframes(name?: string, custom?: Keyframe[]): Keyframe[] | null {
    if (custom) return custom;
    if (name) return ANIMATION_PRESETS[name] ?? null;
    return null;
}
