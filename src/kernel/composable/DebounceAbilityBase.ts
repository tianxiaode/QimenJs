import { AbilityBase, type IExposeResult } from './AbilityBase';
import { debounce } from '@orbitjs/async';

/**
 * DebounceAbilityBase - 防抖能力基类
 * 
 * 提供防抖功能的基类，子类可以使用 getDebouncedAction() 获取防抖函数
 * 
 * @example
 * ```typescript
 * class SearchAbility extends DebounceAbilityBase {
 *     readonly name = 'Search';
 *     
 *     protected expose(): IExposeResult {
 *         return {
 *             search: this.getDebouncedAction('search', (keyword) => {
 *                 // 执行搜索
 *             }, 300),
 *         };
 *     }
 * }
 * ```
 */
export abstract class DebounceAbilityBase extends AbilityBase {
    /**
     * 防抖函数映射
     * @private
     */
    private debouncedMap = new Map<string, any>();

    /**
     * 获取防抖函数
     * 
     * @template A - 函数类型
     * @param key - 唯一标识键
     * @param fn - 原始函数
     * @param wait - 等待时间（毫秒）
     * @param immediate - 是否立即执行
     * @returns 防抖后的函数
     * 
     * @example
     * ```typescript
     * const debouncedSearch = this.getDebouncedAction(
     *     'search',
     *     (keyword) => this.doSearch(keyword),
     *     300
     * );
     * ```
     */
    protected getDebouncedAction<A extends (...args: any[]) => any>(
        key: string,
        fn: A,
        wait: number = 300,
        immediate: boolean = false
    ): A {
        if (!this.debouncedMap.has(key)) {
            // 包装函数，绑定正确的上下文
            this.debouncedMap.set(key, debounce(fn.bind(this), wait, immediate));
        }
        return this.debouncedMap.get(key);
    }

    /**
     * 销毁时清理所有防抖定时器
     * 
     * @protected
     */
    protected onDispose(): void {
        // 取消所有防抖定时器
        this.debouncedMap.forEach(d => d.cancel?.());
        this.debouncedMap.clear();
    }
}
