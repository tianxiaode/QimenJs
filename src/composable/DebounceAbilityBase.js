"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebounceAbilityBase = void 0;
const AbilityBase_1 = require("./AbilityBase");
const async_1 = require("@orbitjs/async");
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
class DebounceAbilityBase extends AbilityBase_1.AbilityBase {
    constructor() {
        super(...arguments);
        /**
         * 防抖函数映射
         * @private
         */
        this.debouncedMap = new Map();
    }
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
    getDebouncedAction(key, fn, wait = 300, immediate = false) {
        if (!this.debouncedMap.has(key)) {
            // 包装函数，绑定正确的上下文
            this.debouncedMap.set(key, (0, async_1.debounce)(fn.bind(this), wait, immediate));
        }
        return this.debouncedMap.get(key);
    }
    /**
     * 销毁时清理所有防抖定时器
     *
     * @protected
     */
    onDispose() {
        // 取消所有防抖定时器
        this.debouncedMap.forEach(d => { var _a; return (_a = d.cancel) === null || _a === void 0 ? void 0 : _a.call(d); });
        this.debouncedMap.clear();
    }
}
exports.DebounceAbilityBase = DebounceAbilityBase;
//# sourceMappingURL=DebounceAbilityBase.js.map