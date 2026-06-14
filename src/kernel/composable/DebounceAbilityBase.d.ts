import { AbilityBase } from './AbilityBase';
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
export declare abstract class DebounceAbilityBase extends AbilityBase {
    /**
     * 防抖函数映射
     * @private
     */
    private debouncedMap;
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
    protected getDebouncedAction<A extends (...args: any[]) => any>(key: string, fn: A, wait?: number, immediate?: boolean): A;
    /**
     * 销毁时清理所有防抖定时器
     *
     * @protected
     */
    protected onDispose(): void;
}
//# sourceMappingURL=DebounceAbilityBase.d.ts.map