import { AbilityBase, type IExposeResult } from './AbilityBase';
import { debounce } from '@orbitjs/async';

/**
 * DebounceAbilityBase - 防抖能力基类
 * 
 * 提供防抖功能的基类，子类可以使用 getDebouncedAction() 获取防抖函数
 * 
 * 新设计：每个宿主有独立的防抖 Map（通过闭包变量自然隔离），
 * 不再需要 getOrCreateState 或实例级 debouncedMap。
 * 
 * @example
 * ```typescript
 * class SearchAbility extends DebounceAbilityBase {
 *     protected expose(host: any): IExposeResult {
 *         const debouncedSearch = this.getDebouncedAction('search', (keyword) => {
 *             // 执行搜索
 *         }, 300);
 *         return {
 *             search: debouncedSearch,
 *         };
 *     }
 * }
 * ```
 */
export abstract class DebounceAbilityBase extends AbilityBase {
    /**
     * 防抖函数映射（per-host，通过闭包变量隔离）
     * @private
     */
    private debouncedMaps = new WeakMap<object, Map<string, any>>();

    /**
     * 获取防抖函数
     * 
     * 每个宿主有独立的防抖 Map，自然 per-host 隔离。
     * 
     * @template A - 函数类型
     * @param key - 唯一标识键
     * @param fn - 原始函数
     * @param wait - 等待时间（毫秒）
     * @param immediate - 是否立即执行
     * @returns 防抖后的函数
     */
    protected getDebouncedAction<A extends (...args: any[]) => any>(
        key: string,
        fn: A,
        wait: number = 300,
        immediate: boolean = false
    ): A {
        // 获取当前宿主的防抖 Map
        // 注意：此方法在 expose(host) 中调用，此时 this 仍然是 Ability 实例
        // 但 host 已通过 expose(host) 参数传入
        // 我们需要一种方式获取当前 host...
        
        // 问题：getDebouncedAction 在 expose(host) 中调用，
        // 但它不知道当前 host 是谁。
        // 解决方案：改为 getDebouncedAction(host, key, fn, wait, immediate)
        throw new Error('Use getDebouncedActionFor instead - see below');
    }

    /**
     * 获取防抖函数（per-host 隔离版本）
     * 
     * @param host - 宿主对象
     * @param key - 唯一标识键
     * @param fn - 原始函数
     * @param wait - 等待时间（毫秒）
     * @param immediate - 是否立即执行
     * @returns 防抖后的函数
     */
    protected getDebouncedActionFor<A extends (...args: any[]) => any>(
        host: object,
        key: string,
        fn: A,
        wait: number = 300,
        immediate: boolean = false
    ): A {
        let map = this.debouncedMaps.get(host);
        if (!map) {
            map = new Map<string, any>();
            this.debouncedMaps.set(host, map);
        }
        
        if (!map.has(key)) {
            map.set(key, debounce(fn, wait, immediate));
        }
        return map.get(key);
    }

    /**
     * 销毁时清理指定宿主的防抖定时器
     * 
     * @param host - 正在销毁的宿主对象
     * @protected
     */
    protected onDispose(host: any): void {
        const map = this.debouncedMaps.get(host);
        if (map) {
            map.forEach(d => d.cancel?.());
            map.clear();
            this.debouncedMaps.delete(host);
        }
    }
}
