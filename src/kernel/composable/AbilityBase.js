"use strict";
/**
 * 能力基类 - 新版本
 *
 * 结合了熟悉的 expose() API 和预编译性能优势
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbilityBase = void 0;
/**
 * 能力基类
 *
 * 提供熟悉的 expose() API，内部自动转换为预编译能力
 *
 * @example
 * ```typescript
 * class EventAbility extends AbilityBase {
 *     readonly name = 'Event';
 *
 *     protected expose(): IExposeResult {
 *         const scope = globalEventBus.createEventScope();
 *
 *         return {
 *             eventScope: { get: () => scope },
 *             on: (event, handler) => scope.on(event, handler),
 *             emit: (event, data) => scope.emit(event, data),
 *         };
 *     }
 *
 *     protected onDispose(): void {
 *         this.eventScope?.dispose();
 *     }
 * }
 * ```
 */
class AbilityBase {
    /**
     * 销毁方法
     *
     * 子类可重写此方法执行清理逻辑
     *
     * @protected
     */
    onDispose() {
        // 默认空实现，子类可重写
    }
    /**
     * 预编译方法
     *
     * 将 expose() 返回的定义转换为预编译能力
     *
     * @returns 预编译能力
     */
    precompile() {
        const descriptorFactories = new Map();
        // 创建临时实例来调用 expose()
        const tempInstance = Object.create(this.constructor.prototype);
        tempInstance.host = null; // 设置临时 host
        const props = tempInstance.expose();
        // 转换每个属性定义
        const keys = [...Object.keys(props), ...Object.getOwnPropertySymbols(props)];
        for (const key of keys) {
            const value = props[key];
            const descriptor = this.createDescriptorFactory(value);
            descriptorFactories.set(key, descriptor);
        }
        // 创建销毁函数工厂
        const createDisposer = (host) => {
            // 设置 host 引用
            this.host = host;
            // 返回销毁函数
            return () => {
                this.onDispose();
                this.host = null;
            };
        };
        return {
            name: this.name,
            descriptorFactories,
            createDisposer
        };
    }
    /**
     * 创建属性描述符工厂
     *
     * @param value - 属性定义
     * @returns 描述符工厂
     * @private
     */
    createDescriptorFactory(value) {
        // getter/setter 对象
        if (value && typeof value === 'object' && ('get' in value || 'set' in value)) {
            return (host) => {
                var _a;
                // 设置 host 引用，以便 getter/setter 中可以访问 this.host
                this.host = host;
                return {
                    ...value,
                    configurable: true,
                    enumerable: (_a = value.enumerable) !== null && _a !== void 0 ? _a : true
                };
            };
        }
        // 方法
        if (typeof value === 'function') {
            return (host) => ({
                value: value.bind(host),
                writable: true,
                configurable: true,
                enumerable: true
            });
        }
        // 普通值
        return () => ({
            value,
            writable: true,
            configurable: true,
            enumerable: true
        });
    }
}
exports.AbilityBase = AbilityBase;
//# sourceMappingURL=AbilityBase.js.map