/**
 * 可组合能力系统类型定义
 *
 * 包含能力系统的所有核心类型
 */
import type { ILogger } from "@orbitjs/logger";
/**
 * 可组合接口
 */
export interface IComposable {
    /**
     * 附加到宿主
     */
    attach: (host: any) => void;
    /**
     * 销毁方法（可选）
     */
    dispose?: () => void;
}
/**
 * 可组合基类接口
 */
export interface IComposableBase {
    /**
     * 域名称（可选）
     */
    domain?: string;
    /**
     * 日志记录器
     */
    logger: ILogger;
    /**
     * 获取类级缓存
     */
    getStatic<T>(key: string | symbol): T | undefined;
    /**
     * 设置类级缓存
     */
    setStatic<T>(key: string | symbol, value: T): void;
    /**
     * 动态属性
     */
    [key: string]: any;
}
/**
 * 能力宿主基类类型
 */
export type AbilityHostBase = Omit<IComposableBase, 'getStatic' | 'setStatic'>;
/**
 * Ability 暴露给 Host 的属性描述符扩展
 * 允许直接返回属性值，或者返回标准的 PropertyDescriptor (getter/setter)
 */
export type ExposeValue = PropertyDescriptor | any;
/**
 * 暴露清单接口
 */
export interface IExposeResult {
    [key: string | symbol]: ExposeValue;
}
/**
 * 属性描述符工厂函数类型
 *
 * @template T - 宿主类型
 * @param host - 宿主对象
 * @returns 完整的属性描述符
 */
export type DescriptorFactoryFn<T = any> = (host: T) => PropertyDescriptor;
/**
 * 销毁函数工厂类型
 *
 * @template T - 宿主类型
 * @param host - 宿主对象
 * @returns 销毁函数
 */
export type DisposerFactoryFn<T = any> = (host: T) => () => void;
/**
 * 预编译能力接口
 *
 * @template T - 宿主类型
 */
export interface IPrecompiledAbility<T = any> {
    /**
     * 能力名称（唯一标识）
     */
    readonly name: string;
    /**
     * 属性描述符工厂映射
     *
     * key: 属性名（string 或 symbol）
     * value: 工厂函数，返回完整的属性描述符
     */
    readonly descriptorFactories: Map<string | symbol, DescriptorFactoryFn<T>>;
    /**
     * 销毁函数工厂（可选）
     *
     * 用于清理能力创建的资源
     */
    readonly createDisposer?: DisposerFactoryFn<T>;
}
/**
 * 可预编译能力类接口
 *
 * @template T - 宿主类型
 */
export interface IPrecompilableAbility<T = any> {
    /**
     * 能力名称（唯一标识）
     */
    readonly name: string;
    /**
     * 预编译方法
     *
     * 在注册时或首次使用时调用，返回预编译的能力
     *
     * @returns 预编译的能力
     */
    precompile(): IPrecompiledAbility<T>;
}
/**
 * 能力注册条目
 */
export interface IAbilityRegistrationEntry {
    /**
     * 能力名称
     */
    readonly name: string;
    /**
     * 能力描述
     */
    readonly description?: string;
    /**
     * 依赖的其他能力
     */
    readonly deps?: readonly string[];
    /**
     * 可预编译的能力类
     */
    readonly abilityClass: IPrecompilableAbility;
}
/**
 * 能力注册选项
 */
export interface IAbilityRegistrationOptions {
    /**
     * 是否立即预编译
     *
     * - true: 注册时立即预编译（核心能力）
     * - false: 首次使用时预编译（普通能力）
     *
     * @default false
     */
    readonly immediate?: boolean;
}
/**
 * 能力装饰器返回类型
 */
export type AbilityDecorator = <T extends new (...args: any[]) => any>(constructor: T) => T;
/**
 * 从能力类提取宿主类型
 *
 * @template T - 能力类类型
 */
export type ExtractHostType<T extends IPrecompilableAbility> = T extends IPrecompilableAbility<infer H> ? H : never;
/**
 * 能力属性映射类型
 *
 * @template T - 宿主类型
 */
export type AbilityProperties<T = any> = Record<string | symbol, DescriptorFactoryFn<T>>;
//# sourceMappingURL=composable.d.ts.map