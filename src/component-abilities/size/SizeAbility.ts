/**
 * SizeAbility — 尺寸分档能力
 *
 * 为组件提供 size getter/setter，自动管理 CSS 类名切换。
 * 默认三档 sm/md/lg，默认值 md。
 * CSS 类名约定：q-{type}--{size}（如 q-avatar--sm）。
 *
 * 使用方式：
 * 1. 组件声明 .with([SizeAbility])
 * 2. 构造时调用 initSize(config?) 初始化
 * 3. 通过 size getter/setter 读写当前尺寸
 *
 * @example
 * ```ts
 * const Avatar = TemplateComponent.withTemplate(TPL).with([SizeAbility]);
 *
 * // body 中
 * onAfterInit(props) {
 *     this.initSize();
 * }
 *
 * // 外部切换
 * avatar.size = 'lg';  // 自动移除 q-avatar--md，添加 q-avatar--lg
 * ```
 */

import type { AbilityDefinition } from '@/composable';

export interface SizeConfig {
    sizes?: string[];
    defaultSize?: string;
}

const STATE_KEY = 'SizeAbility:state';

const DEFAULT_SIZES = ['sm', 'md', 'lg'];
const DEFAULT_SIZE = 'md';

interface SizeState {
    sizes: string[];
    currentSize: string;
    classPrefix: string;
}

export const SizeAbility= {
    initSize(config?: SizeConfig): void {
        const sizes = config?.sizes ?? DEFAULT_SIZES;
        const defaultSize = config?.defaultSize ?? DEFAULT_SIZE;
        const type = this.type as string | undefined;
        const classPrefix = type ? `q-${type.toLowerCase()}--` : 'q-size--';

        this.setAbilityState(STATE_KEY, {
            sizes,
            currentSize: defaultSize,
            classPrefix,
        });

        this.addCls(`${classPrefix}${defaultSize}`);
    },

    get size(): string {
        const state = this.abilityState(STATE_KEY) as SizeState | undefined;
        return state?.currentSize ?? DEFAULT_SIZE;
    },

    set size(value: string) {
        const state = this.abilityState(STATE_KEY) as SizeState | undefined;
        if (!state || state.currentSize === value) return;

        this.removeCls(`${state.classPrefix}${state.currentSize}`);
        this.addCls(`${state.classPrefix}${value}`);

        state.currentSize = value;
    },
} satisfies AbilityDefinition;
