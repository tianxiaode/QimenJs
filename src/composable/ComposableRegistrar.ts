/**
 * 可组合能力注册器
 * 
 * 管理所有能力的注册和获取
 */

import type { 
    ComposableEntry,
    IPrecompiledAbility,
    IAbilityRegistrationEntry
} from './types/composable';

/**
 * 可组合能力注册器
 * 
 * 单例模式，管理所有能力的注册和获取
 */
export class ComposableRegistrar {
    private static instance: ComposableRegistrar;
    
    /**
     * 能力注册表
     * key: 能力名称
     * value: 注册条目
     */
    private registry = new Map<string, IAbilityRegistrationEntry>();
    
    /**
     * 预编译能力缓存
     * key: 能力名称
     * value: 预编译的能力
     */
    private precompiledCache = new Map<string, IPrecompiledAbility>();
    
    /**
     * 锁定标志（防止运行时注册）
     */
    private locked = false;
    
    /**
     * 获取单例实例
     */
    static getInstance(): ComposableRegistrar {
        if (!ComposableRegistrar.instance) {
            ComposableRegistrar.instance = new ComposableRegistrar();
        }
        return ComposableRegistrar.instance;
    }
    
    /**
     * 注册能力
     * 
     * @param entry - 注册条目
     * @param abilityClass - 能力类
     * @param options - 注册选项
     */
    register(
        entry: { name: string; ctor: any },
        abilityClass: any,
        options?: { immediate?: boolean }
    ): void {
        if (this.locked) {
            throw new Error('Registrar is locked, cannot register new abilities');
        }
        
        // 存储注册条目
        this.registry.set(entry.name, {
            name: entry.name,
            abilityClass: abilityClass,
            description: options?.immediate ? 'Immediate' : undefined
        });
        
        // 如果指定立即预编译
        if (options?.immediate && typeof abilityClass.precompile === 'function') {
            const precompiled = abilityClass.precompile();
            this.precompiledCache.set(entry.name, precompiled);
        }
    }
    
    /**
     * 获取预编译能力
     * 
     * @param name - 能力名称
     * @returns 预编译的能力，如果不存在则返回 undefined
     */
    getPrecompiled(name: string): IPrecompiledAbility | undefined {
        // 检查缓存
        if (this.precompiledCache.has(name)) {
            return this.precompiledCache.get(name);
        }
        
        // 懒加载预编译
        const entry = this.registry.get(name);
        if (entry && typeof entry.abilityClass.precompile === 'function') {
            const precompiled = entry.abilityClass.precompile();
            this.precompiledCache.set(name, precompiled);
            return precompiled;
        }
        
        return undefined;
    }
    
    /**
     * 批量获取能力条目
     * 
     * @param names - 能力名称列表
     * @returns 能力条目列表
     */
    getRecursive(names: string[]): ComposableEntry[] {
        return names
            .map(name => this.registry.get(name))
            .filter((entry): entry is IAbilityRegistrationEntry => entry !== undefined)
            .map(entry => ({
                name: entry.name,
                ctor: entry.abilityClass
            }));
    }
    
    /**
     * 检查能力是否存在
     * 
     * @param name - 能力名称
     * @returns 是否存在
     */
    has(name: string): boolean {
        return this.registry.has(name);
    }
    
    /**
     * 锁定注册表
     */
    lock(): void {
        this.locked = true;
    }
    
    /**
     * 解锁注册表
     */
    unlock(): void {
        this.locked = false;
    }
    
    /**
     * 清空注册表
     */
    clear(): void {
        this.registry.clear();
        this.precompiledCache.clear();
        this.locked = false;
    }
}
