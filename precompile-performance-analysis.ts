/**
 * 预编译性能优化方案分析
 * 
 * 问题：能力类很多，全部预编译会导致启动慢
 */

// ============================================
// 问题分析
// ============================================

console.log('=== 问题分析 ===\n');

console.log('假设场景：');
console.log('- 100 个能力类');
console.log('- 每个预编译耗时 1ms');
console.log('- 总耗时：100ms');
console.log('');
console.log('问题：');
console.log('❌ 启动时全部预编译，启动慢');
console.log('❌ 很多能力可能不会被使用');
console.log('❌ 浪费时间和内存');


// ============================================
// 解决方案1：懒加载预编译（推荐）
// ============================================

console.log('\n=== 解决方案1：懒加载预编译（推荐） ===\n');

console.log('思路：');
console.log('1. 注册时只存储能力类，不预编译');
console.log('2. 第一次使用时才预编译');
console.log('3. 预编译结果缓存');
console.log('');

console.log('实现：');
console.log(`
class ComposableRegistrar {
    // 存储能力类（未预编译）
    private abilityClasses = new Map<string, IPrecompilableAbility>();
    
    // 预编译缓存
    private precompiledCache = new Map<string, IPrecompiledAbility>();
    
    // 注册时只存储类
    register(entry: ComposableEntry, abilityClass: IPrecompilableAbility) {
        this.storage.set(entry.name, entry);
        this.abilityClasses.set(entry.name, abilityClass);  // 只存储，不预编译
    }
    
    // 获取时才预编译（懒加载）
    getPrecompiled(name: string): IPrecompiledAbility {
        // 检查缓存
        if (this.precompiledCache.has(name)) {
            return this.precompiledCache.get(name)!;
        }
        
        // 首次使用，执行预编译
        const abilityClass = this.abilityClasses.get(name);
        if (abilityClass) {
            const precompiled = abilityClass.precompile();
            this.precompiledCache.set(name, precompiled);
            return precompiled;
        }
        
        return undefined;
    }
}
`);

console.log('优点：');
console.log('✅ 启动快（不预编译）');
console.log('✅ 按需预编译');
console.log('✅ 只预编译实际使用的能力');
console.log('✅ 内存占用小');

console.log('\n缺点：');
console.log('⚠️ 首次使用有延迟（预编译时间）');
console.log('⚠️ 需要缓存管理');


// ============================================
// 解决方案2：异步预编译
// ============================================

console.log('\n\n=== 解决方案2：异步预编译 ===\n');

console.log('思路：');
console.log('1. 启动时不预编译');
console.log('2. 后台异步预编译');
console.log('3. 使用时等待预编译完成');
console.log('');

console.log('实现：');
console.log(`
class ComposableRegistrar {
    private precompilePromises = new Map<string, Promise<IPrecompiledAbility>>();
    
    // 启动后开始异步预编译
    async startBackgroundPrecompile() {
        for (const [name, abilityClass] of this.abilityClasses) {
            const promise = this.precompileAsync(abilityClass);
            this.precompilePromises.set(name, promise);
        }
    }
    
    // 异步预编译
    private async precompileAsync(abilityClass: IPrecompilableAbility) {
        // 使用 setTimeout 让出主线程
        await new Promise(resolve => setTimeout(resolve, 0));
        return abilityClass.precompile();
    }
    
    // 获取时等待预编译完成
    async getPrecompiled(name: string): Promise<IPrecompiledAbility> {
        const promise = this.precompilePromises.get(name);
        if (promise) {
            return await promise;
        }
        // 如果没有启动异步预编译，则同步预编译
        return this.syncPrecompile(name);
    }
}
`);

console.log('优点：');
console.log('✅ 启动快');
console.log('✅ 后台预编译，不阻塞');
console.log('✅ 使用时通常已完成');

console.log('\n缺点：');
console.log('⚠️ 实现复杂');
console.log('⚠️ 需要 async/await');
console.log('⚠️ 可能等待');


// ============================================
// 解决方案3：分级预编译
// ============================================

console.log('\n\n=== 解决方案3：分级预编译 ===\n');

console.log('思路：');
console.log('1. 核心能力立即预编译');
console.log('2. 常用能力延迟预编译');
console.log('3. 罕见能力懒加载');
console.log('');

console.log('实现：');
console.log(`
enum PrecompilePriority {
    Immediate = 0,  // 立即预编译（核心能力）
    Deferred = 1,   // 延迟预编译（常用能力）
    Lazy = 2        // 懒加载（罕见能力）
}

class ComposableRegistrar {
    register(
        entry: ComposableEntry,
        abilityClass: IPrecompilableAbility,
        priority: PrecompilePriority = PrecompilePriority.Lazy
    ) {
        this.storage.set(entry.name, entry);
        this.abilityClasses.set(entry.name, abilityClass);
        
        if (priority === PrecompilePriority.Immediate) {
            // 立即预编译
            this.precompile(name, abilityClass);
        } else if (priority === PrecompilePriority.Deferred) {
            // 延迟预编译（下一个事件循环）
            setTimeout(() => this.precompile(name, abilityClass), 0);
        }
        // Lazy: 不预编译，使用时才编译
    }
}

// 使用示例
registrar.register(eventEntry, EventAbility, PrecompilePriority.Immediate);
registrar.register(schemaEntry, SchemaAbility, PrecompilePriority.Deferred);
registrar.register(rareEntry, RareAbility, PrecompilePriority.Lazy);
`);

console.log('优点：');
console.log('✅ 平衡启动速度和性能');
console.log('✅ 核心能力立即可用');
console.log('✅ 灵活配置');

console.log('\n缺点：');
console.log('⚠️ 需要手动配置优先级');
console.log('⚠️ 实现稍复杂');


// ============================================
// 解决方案4：混合方案（最佳）
// ============================================

console.log('\n\n=== 解决方案4：混合方案（最佳） ===\n');

console.log('思路：');
console.log('1. 默认懒加载（最快启动）');
console.log('2. 可选立即预编译（核心能力）');
console.log('3. 预编译缓存（避免重复）');
console.log('');

console.log('实现：');
console.log(`
class ComposableRegistrar {
    private abilityClasses = new Map<string, IPrecompilableAbility>();
    private precompiledCache = new Map<string, IPrecompiledAbility>();
    
    // 注册
    register(
        entry: ComposableEntry,
        abilityClass?: IPrecompilableAbility,
        options?: { immediate?: boolean }
    ) {
        this.storage.set(entry.name, entry);
        
        if (abilityClass) {
            this.abilityClasses.set(entry.name, abilityClass);
            
            // 可选：立即预编译
            if (options?.immediate) {
                const precompiled = abilityClass.precompile();
                this.precompiledCache.set(entry.name, precompiled);
            }
        }
    }
    
    // 获取预编译能力（懒加载）
    getPrecompiled(name: string): IPrecompiledAbility | undefined {
        // 检查缓存
        if (this.precompiledCache.has(name)) {
            return this.precompiledCache.get(name);
        }
        
        // 懒加载预编译
        const abilityClass = this.abilityClasses.get(name);
        if (abilityClass) {
            const precompiled = abilityClass.precompile();
            this.precompiledCache.set(name, precompiled);
            return precompiled;
        }
        
        return undefined;
    }
}

// 使用示例
// 核心能力：立即预编译
registrar.register(eventEntry, EventAbility, { immediate: true });

// 普通能力：懒加载
registrar.register(schemaEntry, SchemaAbility);
`);

console.log('优点：');
console.log('✅ 启动快（默认懒加载）');
console.log('✅ 核心能力立即可用');
console.log('✅ 按需预编译');
console.log('✅ 灵活配置');
console.log('�️ 实现简单');


// ============================================
// 性能对比
// ============================================

console.log('\n\n=== 性能对比 ===\n');

console.log('假设：100 个能力，每个预编译 1ms');
console.log('');

console.log('方案1：全部预编译');
console.log('  启动时间：100ms');
console.log('  首次使用：0ms（已预编译）');
console.log('');

console.log('方案2：懒加载');
console.log('  启动时间：0ms');
console.log('  首次使用：1ms（预编译）');
console.log('  后续使用：0ms（已缓存）');
console.log('');

console.log('方案3：混合方案（10个核心能力立即预编译）');
console.log('  启动时间：10ms');
console.log('  核心能力首次使用：0ms');
console.log('  普通能力首次使用：1ms');
console.log('  后续使用：0ms');
console.log('');

console.log('结论：');
console.log('✅ 混合方案最佳');
console.log('✅ 启动快（只预编译核心能力）');
console.log('✅ 使用快（懒加载+缓存）');


// ============================================
// 推荐实现
// ============================================

console.log('\n\n=== 推荐实现 ===\n');

console.log('推荐：混合方案（懒加载 + 可选立即预编译）');
console.log('');
console.log('实现要点：');
console.log('1. 默认懒加载（最快启动）');
console.log('2. 核心能力可选立即预编译');
console.log('3. 预编译结果缓存');
console.log('4. 简单易用');
console.log('');
console.log('使用建议：');
console.log('- 核心能力（Event, Schema等）：immediate: true');
console.log('- 普通能力：默认懒加载');
console.log('- 罕见能力：默认懒加载');
