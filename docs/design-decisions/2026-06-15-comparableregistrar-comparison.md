# ComposableRegistrar 版本对比分析

## 关键差异

### 旧版本（kernel 中的实现）

**核心特性**：
1. **实例缓存机制** - `_abilityClasses` Map 存储能力类实例
2. **懒加载实例化** - 第一次获取时才实例化，之后缓存实例
3. **MRO 依赖解析** - 支持依赖关系管理和方法解析顺序
4. **预编译缓存** - `_precompiledCache` 缓存预编译结果

**关键代码**：
```typescript
getPrecompiled(name: string): IPrecompiledAbility | undefined {
    // 检查缓存
    if (this._precompiledCache.has(name)) {
        return this._precompiledCache.get(name);
    }
    
    // 懒加载预编译
    const abilityClass = this._abilityClasses.get(name);
    if (abilityClass) {
        // 判断是实例还是构造函数
        let ability: IPrecompilableAbility;
        
        if (typeof abilityClass === 'function') {
            // 构造函数：实例化
            ability = new (abilityClass as new () => IPrecompilableAbility)();
            // 缓存实例，下次不需要再实例化
            this._abilityClasses.set(name, ability);
        } else {
            // 已经是实例
            ability = abilityClass as IPrecompilableAbility;
        }
        
        // 预编译并缓存
        const precompiled = ability.precompile();
        this._precompiledCache.set(name, precompiled);
        return precompiled;
    }
    
    return undefined;
}
```

**优势**：
- ✅ 避免重复实例化
- ✅ 懒加载，启动快
- ✅ 实例缓存，性能好
- ✅ 支持依赖关系

### 新版本（当前实现）

**核心特性**：
1. **简化的存储结构** - 只有 registry 和 precompiledCache
2. **直接预编译** - 没有实例缓存
3. **无依赖解析** - 不支持 MRO
4. **立即预编译选项** - immediate 选项

**关键代码**：
```typescript
getPrecompiled(name: string): IPrecompiledAbility | undefined {
    // 先检查缓存
    if (this.storage.precompiledCache.has(name)) {
        return this.storage.precompiledCache.get(name);
    }
    
    // 如果没有缓存，尝试懒加载预编译
    const entry = this.storage.registry.get(name);
    if (entry && typeof entry.abilityClass.precompile === 'function') {
        const precompiled = entry.abilityClass.precompile();
        this.storage.precompiledCache.set(name, precompiled);
        return precompiled;
    }
    
    return undefined;
}
```

**问题**：
- ❌ 每次都调用 `abilityClass.precompile()` - 可能重复实例化
- ❌ 没有实例缓存 - 无法避免重复实例化
- ❌ 不支持依赖关系 - 缺少 MRO 解析

## 问题分析

### 问题 1：重复实例化

**旧版本**：
```typescript
// 第一次：构造函数 → 实例化 → 缓存实例
// 第二次：直接使用缓存的实例
```

**新版本**：
```typescript
// 每次都调用 abilityClass.precompile()
// 如果 abilityClass 是构造函数，每次都会实例化
```

### 问题 2：缺少实例缓存

旧版本有 `_abilityClasses` Map 来缓存实例：
```typescript
private _abilityClasses = new Map<string, IPrecompilableAbility | (new () => IPrecompilableAbility)>();
```

新版本没有这个缓存。

### 问题 3：缺少依赖解析

旧版本有完整的 MRO（方法解析顺序）实现：
```typescript
private _mroCache = new Map<string, string[]>();

private getOrComputeMRO(name: string, stack = new Set<string>()): string[] {
    // 完整的依赖解析逻辑
}
```

新版本的 `getRecursive` 只是简单映射，没有依赖解析。

## 建议的修复方案

### 方案 1：恢复实例缓存机制（推荐）

```typescript
export class ComposableRegistrar extends RegistrarBase<AbilityStorage> {
    // 添加实例缓存
    private _abilityInstances = new Map<string, IPrecompilableAbility>();
    
    getPrecompiled(name: string): IPrecompiledAbility | undefined {
        // 检查预编译缓存
        if (this.storage.precompiledCache.has(name)) {
            return this.storage.precompiledCache.get(name);
        }
        
        // 获取能力类
        const entry = this.storage.registry.get(name);
        if (!entry) return undefined;
        
        // 获取或创建实例
        let ability: IPrecompilableAbility;
        
        if (this._abilityInstances.has(name)) {
            // 使用缓存的实例
            ability = this._abilityInstances.get(name)!;
        } else {
            // 创建新实例并缓存
            if (typeof entry.abilityClass === 'function') {
                ability = new entry.abilityClass();
            } else {
                ability = entry.abilityClass;
            }
            this._abilityInstances.set(name, ability);
        }
        
        // 预编译并缓存
        if (typeof ability.precompile === 'function') {
            const precompiled = ability.precompile();
            this.storage.precompiledCache.set(name, precompiled);
            return precompiled;
        }
        
        return undefined;
    }
}
```

### 方案 2：恢复完整的旧版本实现

直接恢复旧版本的所有功能：
- 实例缓存
- MRO 依赖解析
- 完整的错误处理

## 性能影响

### 当前实现的问题

```typescript
// 假设 EventAbility 是一个构造函数
registrar.register({ name: 'Event', ctor: EventAbility }, EventAbility);

// 第一次调用
const p1 = registrar.getPrecompiled('Event'); // 实例化 EventAbility

// 第二次调用
const p2 = registrar.getPrecompiled('Event'); // 又实例化 EventAbility！

// 这违背了"只在第一次获取时实例化"的原则
```

### 期望的行为

```typescript
// 第一次调用
const p1 = registrar.getPrecompiled('Event'); // 实例化 EventAbility，缓存实例

// 第二次调用
const p2 = registrar.getPrecompiled('Event'); // 使用缓存的实例，不再实例化
```

## 结论

**当前实现缺少关键优化**：
1. ❌ 缺少实例缓存 - 导致重复实例化
2. ❌ 缺少依赖解析 - 不支持能力依赖关系
3. ❌ 性能问题 - 违背了懒加载和缓存的设计原则

**建议**：
- 立即修复实例缓存问题（高优先级）
- 考虑恢复完整的旧版本实现（中优先级）
- 添加单元测试验证行为（高优先级）

## 参考资料

- [设计决策：Composable 系统重构](../design-decisions/2026-06-15-composable-refactoring.md)
- 旧版本代码：`git show 6817c1d:src/kernel/registrars/ComposableRegistrar.ts`
