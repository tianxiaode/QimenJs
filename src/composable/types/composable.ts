/**
 * 可组合能力系统类型定义
 * 
 * 包含能力系统的所有核心类型
 */

import type { ILogger } from "@orbitjs/logger";

// ============================================
// 基硎接口
// ============================================

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
     * 获取宿主对象自身
     * 
     * 在 Ability 方法中，this 被 bind 到宿主，this.host 返回宿主自身。
     */
    readonly host: any;
    
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
export type AbilityHostBase = Omit<
    IComposableBase,
    'getStatic' | 'setStatic'
>;

// ============================================
// 暴露结果类型
// ============================================

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

// ============================================
// 预编译能力类型
// ============================================

/**
 * 描述符创建函数类型
 * 
 * 在 factory(host) 阶段调用，返回所有属性的 PropertyDescriptor Map
 * 
 * @template T - 宿主类型
 * @param host - 宿主对象
 * @returns 属性名到 PropertyDescriptor 的映射
 */
export type CreateDescriptorsFn<T = any> = (host: T) => Map<string | symbol, PropertyDescriptor>;

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
     * 创建属性描述符
     * 
     * 在 factory(host) 阶段调用，执行 expose(host) 并返回所有属性的 PropertyDescriptor。
     * 闭包自然捕获 host，无需 hostRef 切换 hack。
     * 
     * @param host - 宿主对象
     * @returns 属性名到 PropertyDescriptor 的映射
     */
    readonly createDescriptors: CreateDescriptorsFn<T>;
    
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
     * 预编译方法
     * 
     * 在注册时或首次使用时调用，返回预编译的能力
     * 
     * @returns 预编译的能力
     */
    precompile(): IPrecompiledAbility<T>;
}

// ============================================
// 能力注册相关类型
// ============================================

/**
 * 能力类构造函数类型
 * 
 * 用于表示可以 new 的具体 AbilityBase 子类构造函数
 * 使用 IPrecompilableAbility 接口作为实例类型约束
 */
export type AbilityConstructor = new () => IPrecompilableAbility;

/**
 * 可组合条目
 */
export interface ComposableEntry {
    /**
     * 能力名称
     */
    name: string;
    
    /**
     * 能力构造函数
     */
    ctor: any;
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

// ============================================
// 能力装饰器相关类型
// ============================================

/**
 * 能力装饰器返回类型
 */
export type AbilityDecorator = <T extends new (...args: any[]) => any>(
    constructor: T
) => T;

// ============================================
// 工具类型
// ============================================

/**
 * 从能力类提取宿主类型
 * 
 * @template T - 能力类类型
 */
export type ExtractHostType<T extends IPrecompilableAbility> = 
    T extends IPrecompilableAbility<infer H> ? H : never;

/**
 * 能力属性映射类型
 * 
 * @template T - 宿主类型
 */
export type AbilityProperties<T = any> = Record<string | symbol, PropertyDescriptor>;
