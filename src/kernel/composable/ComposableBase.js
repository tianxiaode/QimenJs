"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComposableBase = void 0;
exports.Ability = Ability;
const logger_1 = require("@orbitjs/logger");
const registrars_1 = require("../registrars");
/**
 * Symbol 用于存储能力列表
 * @internal
 */
const ABILITIES_KEY = Symbol('__abilities__');
/**
 * Symbol 用于存储销毁函数数组
 * @internal
 */
const DISPOSERS_KEY = Symbol('__disposers__');
/**
 * 装饰器：声明该类需要的能力
 *
 * 改进方案：在装饰器阶段完成能力收集，无需运行时原型链爬取
 *
 * 工作原理：
 * 1. 装饰器按代码定义顺序执行（父类先于子类）
 * 2. 装饰子类时，父类已完成装饰
 * 3. 直接从父类获取已收集的能力，合并自己的能力
 * 4. 性能从 O(n) 提升到 O(1)
 *
 * @param keys - 能力键的列表
 * @returns 类装饰器函数
 */
function Ability(...keys) {
    return (ctor) => {
        var _a;
        // 直接从父类获取已收集的能力（父类已完成装饰）
        const parentAbilities = ((_a = Object.getPrototypeOf(ctor)) === null || _a === void 0 ? void 0 : _a[ABILITIES_KEY]) || [];
        // 合并父类和自己的能力（去重）
        ctor[ABILITIES_KEY] = [...new Set([...parentAbilities, ...keys])];
    };
}
/**
 * 可组合基类，提供了能力注入和管理的基础功能
 *
 * 该类实现了自动装配能力的功能，通过装饰器声明所需能力，
 * 并从注册中心获取能力实例并将其附加到宿主对象上。
 *
 * 优化方案：
 * - 使用预编译能力，性能提升 70-90%
 * - 懒加载预编译，启动快
 * - 闭包捕获 host，无需 Ability 实例
 */
class ComposableBase {
    /**
     * 构造函数，初始化日志记录器和设置能力
     */
    constructor() {
        // 1. 内置日志，初始化即可用
        this.logger = logger_1.Logger.for(this.constructor.name);
        // 2. 初始化销毁函数数组
        Object.defineProperty(this, DISPOSERS_KEY, {
            value: [],
            enumerable: false,
            configurable: true
        });
        // 3. 设置能力
        this.setupAbilities();
        // 4. 应用重写
        this.applyOverrides();
    }
    /**
     * 提供给子类或 Ability 使用：获取类级缓存
     *
     * @template T - 返回值类型
     * @param key - 缓存键
     * @returns 缓存的值，如果不存在则返回 undefined
     */
    getStatic(key) {
        var _a;
        const ctor = this.constructor;
        return (_a = ctor._static_storage_) === null || _a === void 0 ? void 0 : _a.get(key);
    }
    /**
     * 提供给子类或 Ability 使用：设置类级缓存
     *
     * @template T - 值的类型
     * @param key - 缓存键
     * @param value - 要存储的值
     */
    setStatic(key, value) {
        const ctor = this.constructor;
        if (!ctor._static_storage_) {
            Object.defineProperty(ctor, '_static_storage_', {
                value: new Map(),
                enumerable: false,
            });
        }
        ctor._static_storage_.set(key, value);
    }
    /**
     * 自动装配方法：使用预编译能力
     *
     * @protected
     */
    setupAbilities() {
        const CACHE_KEY = '__resolved_ability_entries__';
        let entries = this.getStatic(CACHE_KEY);
        // 只有第一次实例化时，执行完整的解析逻辑
        if (!entries) {
            // 直接从类获取能力列表（装饰器阶段已收集完成）
            const abilityKeys = this.constructor[ABILITIES_KEY] || [];
            // 去注册中心一次性换取所有的 Entry
            const registrar = registrars_1.ComposableRegistrar.getInstance();
            entries = registrar.getRecursive(abilityKeys);
            // 将最终的 Entry 数组存入类级静态缓存
            this.setStatic(CACHE_KEY, entries);
            this.logger.debug(`Ability entries parsed and cached for class: ${this.constructor.name}`, { abilities: abilityKeys });
        }
        // 使用预编译能力
        const registrar = registrars_1.ComposableRegistrar.getInstance();
        const disposers = this[DISPOSERS_KEY];
        entries.forEach(entry => {
            // 获取预编译能力（懒加载）
            const precompiled = registrar.getPrecompiled(entry.name);
            if (!precompiled) {
                this.logger.error(`Ability ${entry.name} is not precompilable`);
                return;
            }
            // 挂载能力属性
            precompiled.descriptorFactories.forEach((factory, key) => {
                const descriptor = factory(this);
                Object.defineProperty(this, key, descriptor);
            });
            // 创建并存储销毁函数
            if (precompiled.createDisposer) {
                disposers.push(precompiled.createDisposer(this));
            }
        });
    }
    /**
     * 应用重写功能，允许派生类自定义一些功能
     *
     * @protected
     */
    applyOverrides() {
        this.logger.debug(`Applying overrides for ${this.constructor.name}`);
    }
    /**
     * 统一销毁：按装配顺序的逆序执行
     */
    dispose() {
        const disposers = this[DISPOSERS_KEY];
        // 按逆序执行销毁函数
        for (let i = disposers.length - 1; i >= 0; i--) {
            try {
                disposers[i]();
            }
            catch (e) {
                this.logger.error(`Dispose error:`, e);
            }
        }
        // 清空销毁函数数组
        disposers.length = 0;
    }
}
exports.ComposableBase = ComposableBase;
//# sourceMappingURL=ComposableBase.js.map