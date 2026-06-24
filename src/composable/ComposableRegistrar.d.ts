/**
 * 可组合能力注册器
 *
 * 管理所有能力的注册和获取
 * 继承自 RegistrarBase，保持架构一致性
 *
 * 关键优化：
 * - 实例缓存：避免重复实例化能力类
 * - 懒加载：第一次获取时才实例化
 * - 预编译缓存：缓存预编译结果
 */
import { RegistrarBase } from '@orbitjs/registry';
import type { ComposableEntry, IAbilityRegistrationEntry, IPrecompiledAbility } from './types/composable';
/**
 * 能力注册存储结构
 */
interface AbilityStorage {
    /**
     * 能力注册表
     */
    registry: Map<string, IAbilityRegistrationEntry>;
    /**
     * 预编译缓存
     */
    precompiledCache: Map<string, IPrecompiledAbility>;
}
/**
 * 可组合能力注册器
 *
 * 继承自 RegistrarBase，管理所有能力的注册和获取
 *
 * @example
 * ```typescript
 * // 获取注册器实例
 * const registrar = ComposableRegistrar.getInstance();
 *
 * // 注册能力
 * registrar.register(
 *     { name: 'Event', ctor: EventAbility },
 *     EventAbility,
 *     { immediate: true }
 * );
 *
 * // 获取预编译能力
 * const precompiled = registrar.getPrecompiled('Event');
 * ```
 */
export declare class ComposableRegistrar extends RegistrarBase<AbilityStorage> {
    /**
     * 注册器名称
     */
    readonly name = "ComposableRegistrar";
    /**
     * 存储结构
     */
    protected storage: AbilityStorage;
    /**
     * 能力实例缓存
     *
     * 用于缓存能力类的实例，避免重复实例化
     * key: 能力名称
     * value: 能力实例
     */
    private _abilityInstances;
    /**
     * 注册能力
     *
     * @param entry - 能力条目
     * @param abilityClass - 能力类（构造函数或实例）
     * @param options - 注册选项
     */
    register(entry: {
        name: string;
        ctor: any;
    }, abilityClass: any, options?: {
        immediate?: boolean;
    }): void;
    /**
     * 注销能力
     *
     * @param name - 能力名称
     */
    unregister(name: string): void;
    /**
     * 获取能力注册条目
     *
     * @param name - 能力名称
     * @returns 能力注册条目
     */
    get(name: string): IAbilityRegistrationEntry | undefined;
    /**
     * 获取预编译能力（懒加载 + 实例缓存）
     *
     * 关键优化：
     * 1. 检查预编译缓存
     * 2. 获取或创建能力实例（缓存实例）
     * 3. 预编译并缓存结果
     *
     * @param name - 能力名称
     * @returns 预编译能力
     */
    getPrecompiled(name: string): IPrecompiledAbility | undefined;
    /**
     * 递归获取能力条目
     *
     * 注意：由于装饰器已经在编译阶段处理了父类能力合并，
     * 这里只需要简单映射能力名称到条目即可，不需要 MRO 解析。
     *
     * @param names - 能力名称列表
     * @returns 能力条目列表
     */
    getRecursive(names: string[]): ComposableEntry[];
    /**
     * 检查能力是否已注册
     *
     * @param name - 能力名称
     * @returns 是否已注册
     */
    has(name: string): boolean;
    /**
     * 获取所有已注册的能力名称
     *
     * @returns 能力名称列表
     */
    getAllNames(): string[];
    /**
     * 清除所有缓存
     *
     * 用于测试或特殊场景
     */
    clearCaches(): void;
    /**
     * 清空注册器
     *
     * 重写父类方法，正确清空所有存储
     */
    clear(): void;
    /**
     * 输出注册器状态信息
     */
    protected doInspect(): void;
}
export {};
//# sourceMappingURL=ComposableRegistrar.d.ts.map