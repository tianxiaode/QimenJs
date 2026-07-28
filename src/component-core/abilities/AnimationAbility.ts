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
import { ANIMATION_PRESETS } from '../constants/template-constants';

export const AnimationAbility = {
    /**
     * 获取动画配置声明
     *
     * 从组件构造函数的 _animation 静态属性中读取动画配置。
     * 该属性通常在组件定义时通过 body.animation 配置自动注入。
     *
     * @returns {AnimationDecl | undefined} 动画配置对象，如果未配置则返回 undefined
     *
     * @example
     * // 组件定义时配置动画
     * class MyComponent extends Component {
     *     static _animation = {
     *         enter: 'fadeIn',
     *         leave: 'fadeOut',
     *         duration: 300
     *     };
     * }
     *
     * // 运行时获取配置
     * const decl = this._animDecl;
     * if (decl) {
     *     console.log('动画时长:', decl.duration);
     * }
     */
    get _animDecl(): AnimationDecl | undefined {
        const ctor = (this as any).constructor as any;
        return ctor._animation ?? undefined;
    },

    /**
     * 播放入场动画
     *
     * 执行组件的入场动画效果。动画配置从 constructor._animation 中读取。
     * 如果动画被禁用（enabled=false）或未配置入场动画，则不执行任何操作。
     *
     * 动画参数优先级：
     * 1. 自定义关键帧（enterKeyframes）
     * 2. 预设动画名称（enter）
     *
     * @returns {void}
     *
     * @example
     * // 自动播放入场动画（组件初始化后）
     * // 在 body 中配置：
     * body: {
     *     animation: {
     *         enter: 'slideInUp',
     *         duration: 200
     *     }
     * }
     *
     * @example
     * // 手动播放入场动画（如浮层场景）
     * this.playEnter();
     *
     * @example
     * // 使用自定义关键帧
     * static _animation = {
     *     enterKeyframes: [
     *         { opacity: 0, transform: 'scale(0.8)' },
     *         { opacity: 1, transform: 'scale(1)' }
     *     ],
     *     duration: 300
     * };
     */
    playEnter(this: any): void {
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

    /**
     * 播放离场动画
     *
     * 执行组件的离场动画效果，并返回一个 Promise，在动画完成后 resolve。
     * 动画配置从 constructor._animation 中读取。
     * 如果动画被禁用（enabled=false）或未配置离场动画，则立即返回 resolved Promise。
     *
     * 动画参数优先级：
     * 1. 自定义关键帧（leaveKeyframes）
     * 2. 预设动画名称（leave）
     *
     * @returns {Promise<void>} 动画完成后 resolve 的 Promise
     *
     * @example
     * // 等待离场动画完成后再销毁组件
     * await this.playLeave();
     * this.destroy();
     *
     * @example
     * // 配置离场动画
     * static _animation = {
     *     leave: 'slideOutDown',
     *     duration: 200
     * };
     *
     * @example
     * // 使用自定义关键帧
     * static _animation = {
     *     leaveKeyframes: [
     *         { opacity: 1, transform: 'scale(1)' },
     *         { opacity: 0, transform: 'scale(0.8)' }
     *     ],
     *     duration: 300
     * };
     */
    playLeave(this: any): Promise<void> {
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
} as AbilityDefinition;

/**
 * 解析动画关键帧
 *
 * 根据配置解析出动画关键帧数据。优先使用自定义关键帧，其次使用预设动画名称。
 *
 * @param {string} [name] - 预设动画名称（如 'fadeIn', 'slideInUp'）
 * @param {Keyframe[]} [custom] - 自定义关键帧数组
 * @returns {Keyframe[] | null} 关键帧数组，无法解析时返回 null
 *
 * @example
 * // 使用自定义关键帧（优先）
 * const keyframes = resolveKeyframes('fadeIn', [{ opacity: 0 }, { opacity: 1 }]);
 * // 返回: [{ opacity: 0 }, { opacity: 1 }]
 *
 * @example
 * // 使用预设动画
 * const keyframes = resolveKeyframes('fadeIn', undefined);
 * // 返回: ANIMATION_PRESETS['fadeIn']
 *
 * @example
 * // 无配置
 * const keyframes = resolveKeyframes(undefined, undefined);
 * // 返回: null
 */
function resolveKeyframes(name?: string, custom?: Keyframe[]): Keyframe[] | null {
    if (custom) return custom;
    if (name) return ANIMATION_PRESETS[name] ?? null;
    return null;
}
