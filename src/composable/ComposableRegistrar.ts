/**
 * 可组合能力注册器
 * 
 * 简化版：只做预编译缓存
 * - 能力类通过 ComposableBase 的 static abilities 声明
 * - 实例化时自动从原型链收集能力
 * - get() 方法自动预编译并缓存
 */

import { RegistrarBase } from '@/registry';
import type { IPrecompiledAbility, IPrecompilableAbility } from './types/composable';
import type { AbilityBase } from './AbilityBase';

/**
 * 能力注册存储结构
 */
interface AbilityStorage {
    /**
     * 预编译缓存
     * key: 能力名称
     * value: 预编译结果
     */
    precompiledCache: Map<string, IPrecompiledAbility>;
    
    /**
     * 能力实例缓存
     * key: 能力名称
     * value: 能力实例
     */
    abilityInstances: Map<string, IPrecompilableAbility>;
}

/**
 * 可组合能力注册器
 * 
 * 简化版：只负责预编译缓存
 * 
 * @example
 * ```typescript
 * // 获取预编译能力（自动预编译+缓存）
 * const precompiled = ComposableRegistrar.getInstance().get(EventAbility);
 * 
 * // 检查是否已缓存
 * ComposableRegistrar.getInstance().has('EventAbility');
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
        precompiledCache: new Map(),
        abilityInstances: new Map(),
    };
    
    /**
     * 获取预编译能力（自动预编译 + 缓存）
     * 
     * @param AbilityClass - 能力类
     * @returns 预编译能力，失败返回 undefined
     */
    get(AbilityClass: typeof AbilityBase): IPrecompiledAbility | undefined {
        const name = AbilityClass.name;
        
        // 1. 检查预编译缓存
        if (this.storage.precompiledCache.has(name)) {
            return this.storage.precompiledCache.get(name);
        }
        
        // 2. 获取或创建能力实例
        let ability: IPrecompilableAbility;
        
        if (this.storage.abilityInstances.has(name)) {
            ability = this.storage.abilityInstances.get(name)!;
        } else {
            // 直接实例化能力类
            ability = new AbilityClass() as IPrecompilableAbility;
            this.storage.abilityInstances.set(name, ability);
        }
        
        // 3. 预编译并缓存
        const precompiled = ability.precompile();
        if (precompiled) {
            this.storage.precompiledCache.set(name, precompiled);
            return precompiled;
        }
        
        return undefined;
    }
    
    /**
     * 检查能力是否已缓存
     * 
     * @param name - 能力名称
     * @returns 是否已缓存
     */
    has(name: string): boolean {
        return this.storage.precompiledCache.has(name) 
            || this.storage.abilityInstances.has(name);
    }
    
    /**
     * 获取所有已缓存的能力名称
     */
    getAllNames(): string[] {
        const names = new Set<string>();
        this.storage.precompiledCache.forEach((_, name) => names.add(name));
        this.storage.abilityInstances.forEach((_, name) => names.add(name));
        return Array.from(names);
    }
    
    /**
     * 清除预编译缓存
     */
    clearCaches(): void {
        this.storage.precompiledCache.clear();
        this.storage.abilityInstances.clear();
    }
    
    /**
     * 清空注册器
     */
    clear(): void {
        this.checkLock();
        this.storage.precompiledCache.clear();
        this.storage.abilityInstances.clear();
    }
    
    /**
     * 输出注册器状态信息
     */
    protected doInspect(): void {
        console.log('⚡ Precompiled Cache:', this.storage.precompiledCache.size);
        console.log('📦 Instance Cache:', this.storage.abilityInstances.size);
        
        if (this.storage.abilityInstances.size > 0) {
            console.log('\n📋 Cached Abilities:');
            this.storage.abilityInstances.forEach((_, name) => {
                const precompiled = this.storage.precompiledCache.has(name);
                console.log(`  - ${name} ${precompiled ? '⚡' : '💤'}`);
            });
        }
    }
}
