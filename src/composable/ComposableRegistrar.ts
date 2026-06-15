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
import type { 
    ComposableEntry,
    IAbilityRegistrationEntry, 
    IPrecompiledAbility,
    IPrecompilableAbility
} from './types/composable';

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
export class ComposableRegistrar extends RegistrarBase<AbilityStorage> {
    /**
     * 注册器名称
     */
    public readonly name = 'ComposableRegistrar';
    
    /**
     * 存储结构
     */
    protected storage: AbilityStorage = {
        registry: new Map(),
        precompiledCache: new Map(),
    };
    
    /**
     * 能力实例缓存
     * 
     * 用于缓存能力类的实例，避免重复实例化
     * key: 能力名称
     * value: 能力实例
     */
    private _abilityInstances = new Map<string, IPrecompilableAbility>();
    
    /**
     * 注册能力
     * 
     * @param entry - 能力条目
     * @param abilityClass - 能力类（构造函数或实例）
     * @param options - 注册选项
     */
    register(
        entry: { name: string; ctor: any },
        abilityClass: any,
        options?: { immediate?: boolean }
    ): void {
        this.checkLock();
        
        // 存储注册条目
        this.storage.registry.set(entry.name, {
            name: entry.name,
            abilityClass: abilityClass,
            description: options?.immediate ? 'Immediate' : undefined,
        });
        
        // 如果是立即预编译，则立即预编译
        if (options?.immediate) {
            const precompiled = this.getPrecompiled(entry.name);
            if (!precompiled) {
                console.warn(`[ComposableRegistrar] Failed to precompile ability: ${entry.name}`);
            }
        }
    }
    
    /**
     * 注销能力
     * 
     * @param name - 能力名称
     */
    unregister(name: string): void {
        this.checkLock();
        this.storage.registry.delete(name);
        this.storage.precompiledCache.delete(name);
        this._abilityInstances.delete(name);
    }
    
    /**
     * 获取能力注册条目
     * 
     * @param name - 能力名称
     * @returns 能力注册条目
     */
    get(name: string): IAbilityRegistrationEntry | undefined {
        return this.storage.registry.get(name);
    }
    
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
    getPrecompiled(name: string): IPrecompiledAbility | undefined {
        // 1. 检查预编译缓存
        if (this.storage.precompiledCache.has(name)) {
            return this.storage.precompiledCache.get(name);
        }
        
        // 2. 获取注册条目
        const entry = this.storage.registry.get(name);
        if (!entry) {
            return undefined;
        }
        
        // 3. 获取或创建能力实例（关键优化：实例缓存）
        let ability: IPrecompilableAbility;
        
        if (this._abilityInstances.has(name)) {
            // 使用缓存的实例
            ability = this._abilityInstances.get(name)!;
        } else {
            // 创建新实例并缓存
            const abilityClass = entry.abilityClass;
            
            if (typeof abilityClass === 'function') {
                // 构造函数：实例化
                ability = new (abilityClass as new () => IPrecompilableAbility)();
            } else if (abilityClass && typeof abilityClass.precompile === 'function') {
                // 已经是实例
                ability = abilityClass as IPrecompilableAbility;
            } else {
                // 无法预编译
                return undefined;
            }
            
            // 缓存实例，下次不需要再实例化
            this._abilityInstances.set(name, ability);
        }
        
        // 4. 预编译并缓存
        if (typeof ability.precompile === 'function') {
            const precompiled = ability.precompile();
            this.storage.precompiledCache.set(name, precompiled);
            return precompiled;
        }
        
        return undefined;
    }
    
    /**
     * 递归获取能力条目
     * 
     * 注意：由于装饰器已经在编译阶段处理了父类能力合并，
     * 这里只需要简单映射能力名称到条目即可，不需要 MRO 解析。
     * 
     * @param names - 能力名称列表
     * @returns 能力条目列表
     */
    getRecursive(names: string[]): ComposableEntry[] {
        return names
            .map(name => this.storage.registry.get(name))
            .filter((entry): entry is IAbilityRegistrationEntry => entry !== undefined)
            .map(entry => ({
                name: entry.name,
                ctor: entry.abilityClass,
            }));
    }
    
    /**
     * 检查能力是否已注册
     * 
     * @param name - 能力名称
     * @returns 是否已注册
     */
    has(name: string): boolean {
        return this.storage.registry.has(name);
    }
    
    /**
     * 获取所有已注册的能力名称
     * 
     * @returns 能力名称列表
     */
    getAllNames(): string[] {
        return Array.from(this.storage.registry.keys());
    }
    
    /**
     * 清除所有缓存
     * 
     * 用于测试或特殊场景
     */
    clearCaches(): void {
        this.storage.precompiledCache.clear();
        this._abilityInstances.clear();
    }
    
    /**
     * 清空注册器
     * 
     * 重写父类方法，正确清空所有存储
     */
    clear(): void {
        this.checkLock();
        this.storage.registry.clear();
        this.storage.precompiledCache.clear();
        this._abilityInstances.clear();
    }
    
    /**
     * 输出注册器状态信息
     */
    protected doInspect(): void {
        console.log('📊 Registered Abilities:', this.storage.registry.size);
        console.log('⚡ Precompiled Cache:', this.storage.precompiledCache.size);
        console.log('📦 Instance Cache:', this._abilityInstances.size);
        
        if (this.storage.registry.size > 0) {
            console.log('\n📋 Registered:');
            this.storage.registry.forEach((entry, name) => {
                const precompiled = this.storage.precompiledCache.has(name);
                const instanced = this._abilityInstances.has(name);
                console.log(`  - ${name} ${precompiled ? '⚡' : '💤'} ${instanced ? '📦' : '📭'}`);
            });
        }
    }
}
