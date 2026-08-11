/**
 * DebounceAbility — 防抖能力
 *
 * 为宿主提供防抖函数管理，防抖实例通过 abilityState 存储，
 * dispose 时自动取消所有防抖计时器。
 *
 * @example
 * ```ts
 * const fn = this.debounce('save', () => this._save(), 500);
 * fn(); // 防抖调用
 * fn.cancel(); // 手动取消
 * ```
 */

import { debounce as debounceFn } from '@qimenjs/async';
import type { AbilityDefinition } from '@/composable';

export const DebounceAbility = {
    __name__: 'DebounceAbility',

    debounce<A extends (...args: any[]) => any>(
        this: any,
        key: string,
        fn: A,
        wait: number = 0,
        immediate: boolean = false
    ): A & { cancel(): void } {
        return this.abilityState(`__debounce_${key}`, () =>
            debounceFn(fn, wait, immediate)
        ) as A & { cancel(): void };
    },
} satisfies AbilityDefinition;
