"use strict";
/**
 * 能力装饰器
 *
 * 提供装饰器方式为类添加能力
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithAbilities = WithAbilities;
const ComposableRegistrar_1 = require("./ComposableRegistrar");
/**
 * 为类添加能力的装饰器
 *
 * @description
 * 1. 自动注册能力类到 ComposableRegistrar
 * 2. 为目标类添加能力方法
 * 3. 支持多个能力组合
 *
 * @param abilities - 能力类数组
 * @returns 类装饰器
 *
 * @example
 * ```typescript
 * // 定义能力类
 * class EventAbility extends AbilityBase {
 *     static readonly description = '事件能力';
 *
 *     protected expose(): IExposeResult {
 *         return {
 *             on: (event, handler) => { },
 *             emit: (event, data) => { }
 *         };
 *     }
 * }
 *
 * // 使用装饰器（自动注册 + 添加能力）
 * @WithAbilities([EventAbility, DomainAbility])
 * class EntityManager {
 *     // 自动拥有能力方法
 * }
 * ```
 */
function WithAbilities(abilities) {
    // 自动注册能力类
    const registrar = ComposableRegistrar_1.ComposableRegistrar.getInstance();
    abilities.forEach(AbilityClass => {
        const name = AbilityClass.name;
        // 避免重复注册
        if (!registrar.has(name)) {
            registrar.register({
                name,
                ctor: AbilityClass
            }, AbilityClass, { immediate: false });
        }
    });
    // 返回类装饰器
    return function (constructor) {
        return class extends constructor {
            constructor(...args) {
                super(...args);
                /**
                 * 能力实例映射
                 * @private
                 */
                this._abilities = new Map();
                // 创建能力实例并暴露方法
                abilities.forEach(AbilityClass => {
                    const ability = new AbilityClass();
                    ability.host = this;
                    this._abilities.set(AbilityClass.name, ability);
                    // 暴露能力方法到实例
                    const exposed = ability.expose();
                    Object.entries(exposed).forEach(([key, value]) => {
                        var _a;
                        // 处理 getter/setter
                        if (value && typeof value === 'object' && ('get' in value || 'set' in value)) {
                            Object.defineProperty(this, key, {
                                ...value,
                                configurable: true,
                                enumerable: (_a = value.enumerable) !== null && _a !== void 0 ? _a : true
                            });
                        }
                        // 处理方法
                        else if (typeof value === 'function') {
                            this[key] = value;
                        }
                        // 处理普通值
                        else {
                            this[key] = value;
                        }
                    });
                });
            }
            /**
             * 获取能力实例
             *
             * @template T - 能力类型
             * @param name - 能力名称
             * @returns 能力实例
             */
            getAbility(name) {
                return this._abilities.get(name);
            }
            /**
             * 检查是否拥有能力
             *
             * @param name - 能力名称
             * @returns 是否拥有该能力
             */
            hasAbility(name) {
                return this._abilities.has(name);
            }
            /**
             * 销毁所有能力
             */
            disposeAbilities() {
                this._abilities.forEach(ability => {
                    if (typeof ability.onDispose === 'function') {
                        ability.onDispose();
                    }
                });
                this._abilities.clear();
            }
        };
    };
}
//# sourceMappingURL=decorators.js.map