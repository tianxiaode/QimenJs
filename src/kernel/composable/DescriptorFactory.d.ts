/**
 * 描述符工厂辅助类
 *
 * 提供便捷的方法创建各种类型的属性描述符工厂
 * 支持完整的类型推断和类型安全
 */
import type { DescriptorFactoryFn } from '../types/composable';
/**
 * 描述符工厂辅助类
 *
 * 注意：这是一个类，不是类型
 * 类型定义在 types.ts 中的 DescriptorFactoryFn
 */
export declare class DescriptorFactory {
    /**
     * 创建 getter 描述符
     *
     * @template T - 宿主类型
     * @template R - 返回值类型
     * @param getter - getter 函数，接收 host，返回属性值
     * @returns 属性描述符工厂
     *
     * @example
     * ```typescript
     * DescriptorFactory.getter(host => host.state.loading)
     * ```
     */
    static getter<T = any, R = any>(getter: (host: T) => R): DescriptorFactoryFn<T>;
    /**
     * 创建 setter 描述符
     *
     * @template T - 宿主类型
     * @template V - 值类型
     * @param setter - setter 函数，接收 host 和 value
     * @returns 属性描述符工厂
     *
     * @example
     * ```typescript
     * DescriptorFactory.setter((host, value) => { host.state.value = value; })
     * ```
     */
    static setter<T = any, V = any>(setter: (host: T, value: V) => void): DescriptorFactoryFn<T>;
    /**
     * 创建 getter/setter 描述符
     *
     * @template T - 宿主类型
     * @template V - 值类型
     * @param getter - getter 函数
     * @param setter - setter 函数（可选）
     * @returns 属性描述符工厂
     *
     * @example
     * ```typescript
     * DescriptorFactory.accessor(
     *   host => host.state.value,
     *   (host, value) => { host.state.value = value; }
     * )
     * ```
     */
    static accessor<T = any, V = any>(getter: (host: T) => V, setter?: (host: T, value: V) => void): DescriptorFactoryFn<T>;
    /**
     * 创建方法描述符
     *
     * @template T - 宿主类型
     * @template Args - 方法参数类型
     * @template R - 返回值类型
     * @param method - 方法函数，第一个参数是 host，后续是方法参数
     * @returns 属性描述符工厂
     *
     * @example
     * ```typescript
     * DescriptorFactory.method((host, event: string, handler: Function) => {
     *   host.events.set(event, handler);
     * })
     * ```
     */
    static method<T = any, Args extends any[] = any[], R = any>(method: (host: T, ...args: Args) => R): DescriptorFactoryFn<T>;
    /**
     * 创建值描述符
     *
     * @template T - 宿主类型
     * @template V - 值类型
     * @param value - 属性值
     * @returns 属性描述符工厂
     *
     * @example
     * ```typescript
     * DescriptorFactory.value(0)
     * ```
     */
    static value<T = any, V = any>(value: V): DescriptorFactoryFn<T>;
    /**
     * 创建动态值描述符
     *
     * @template T - 宿主类型
     * @template V - 值类型
     * @param valueFactory - 值工厂函数，接收 host，返回初始值
     * @returns 属性描述符工厂
     *
     * @example
     * ```typescript
     * DescriptorFactory.dynamicValue(host => new Map<string, Function[]>())
     * ```
     */
    static dynamicValue<T = any, V = any>(valueFactory: (host: T) => V): DescriptorFactoryFn<T>;
    /**
     * 创建只读值描述符
     *
     * @template T - 宿主类型
     * @template V - 值类型
     * @param value - 属性值
     * @returns 属性描述符工厂
     *
     * @example
     * ```typescript
     * DescriptorFactory.readonlyValue('constant')
     * ```
     */
    static readonlyValue<T = any, V = any>(value: V): DescriptorFactoryFn<T>;
    /**
     * 创建计算属性描述符
     *
     * 计算属性会在首次访问时计算，然后缓存结果
     *
     * @template T - 宿主类型
     * @template R - 返回值类型
     * @param computer - 计算函数
     * @returns 属性描述符工厂
     *
     * @example
     * ```typescript
     * DescriptorFactory.computed(host => expensiveCalculation(host.data))
     * ```
     */
    static computed<T = any, R = any>(computer: (host: T) => R): DescriptorFactoryFn<T>;
}
//# sourceMappingURL=DescriptorFactory.d.ts.map