import { RegistrarBase } from '@/registry';
import { ComposableEntry } from '../types';
import type { IPrecompiledAbility, IPrecompilableAbility, IAbilityRegistrationOptions } from '../types/composable';
/**
 * ComposableRegistrar 名称常量
 */
export declare const ComposableRegistrarName: "composable";
/**
 * ComposableRegistrar 类用于管理可组合能力的注册和检索
 * 提供了注册、注销、获取以及依赖关系解析等功能
 *
 * 主要特性：
 * - 支持依赖关系管理，通过MRO（方法解析顺序）算法解决依赖关系
 * - 提供缓存机制，避免重复计算依赖关系
 * - 支持单个或批量获取已注册的能力
 */
export declare class ComposableRegistrar extends RegistrarBase<Map<string, ComposableEntry>> {
    readonly name: "composable";
    /**
     * 存储所有已注册的可组合能力
     * key: 能力名称
     * value: ComposableEntry对象
     */
    protected storage: Map<string, ComposableEntry>;
    /**
     * MRO（Method Resolution Order）缓存
     * 用于缓存能力名称与其依赖关系数组的映射，优化性能
     */
    private _mroCache;
    /**
     * 预编译能力缓存
     * key: 能力名称
     * value: 预编译的能力
     */
    private _precompiledCache;
    /**
     * 可预编译的能力类存储
     * key: 能力名称
     * value: 可预编译的能力类
     */
    private _abilityClasses;
    /**
     * 注册一个新的可组合能力
     * @param entry 要注册的能力条目，包含名称、描述、依赖和构造函数
     */
    register(entry: ComposableEntry): void;
    /**
     * 注册并预编译一个可组合能力
     * @param entry 要注册的能力条目
     * @param abilityClass 可预编译的能力类
     * @param options 注册选项
     */
    register(entry: ComposableEntry, abilityClass: IPrecompilableAbility, options?: IAbilityRegistrationOptions): void;
    /**
     * 注销指定名称的可组合能力
     * @param name 要注销的能力名称
     */
    unregister(name: string): void;
    /**
     * 获取单个或多个已注册的可组合能力
     * @param name 能力名称
     * @returns 对应的可组合能力条目
     */
    get(name: string): ComposableEntry;
    /**
     * 获取多个已注册的可组合能力
     * @param names 能力名称数组
     * @returns 对应的可组合能力条目数组
     */
    get(names: string[]): ComposableEntry[];
    /**
     * 获取预编译能力（懒加载）
     * 如果能力未预编译，则自动预编译并缓存
     *
     * @param name 能力名称
     * @returns 预编译的能力，如果不存在则返回 undefined
     */
    getPrecompiled(name: string): IPrecompiledAbility | undefined;
    /**
     * 批量获取预编译能力
     *
     * @param names 能力名称数组
     * @returns 预编译的能力数组
     */
    getPrecompiledMultiple(names: string[]): IPrecompiledAbility[];
    /**
     * 递归获取与给定能力相关的所有依赖能力
     * 此方法会解析依赖关系并将所有相关能力返回
     * @param names 能力名称数组
     * @returns 包含所有依赖能力的数组（去重）
     */
    getRecursive(names: string[]): ComposableEntry[];
    /**
     * 获取或计算方法解析顺序(MRO)，用于解决依赖关系
     * 使用缓存机制避免重复计算，提高性能
     * @param name 能力名称
     * @param stack 用于循环依赖检测的栈
     * @returns 解析后的依赖关系数组（按正确顺序排列）
     */
    private getOrComputeMRO;
    /**
     * 执行检查操作，输出注册表信息到控制台
     * @protected
     */
    protected doInspect(): void;
}
//# sourceMappingURL=ComposableRegistrar.d.ts.map