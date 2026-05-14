# 真正的延迟实例化设计

## 问题分析

### 之前的问题

**在 register() 时就实例化，和直接 new 没区别！**

```typescript
// ❌ 问题：register 时就实例化
registrar.register(EventAbilityEntry);
// ↑ 内部执行 new EventAbility()

// 即使不使用，也会实例化
```

**后果：**
- 注册时就实例化所有能力
- 和直接 new 没区别
- 没有真正的延迟加载

## 正确的解决方案

### 在 getPrecompiled() 时才实例化

**真正的延迟加载：只在使用时才实例化！**

```typescript
// ✅ 正确：register 时只存储构造函数
registrar.register(EventAbilityEntry);
// ↑ 只存储 EventAbility 构造函数，不实例化

// 使用时才实例化
const precompiled = registrar.getPrecompiled('Event');
// ↑ 此时才 new EventAbility()，并缓存
```

## 实现细节

### 1. register() 方法

```typescript
register(
    entry: ComposableEntry,
    abilityClass?: IPrecompilableAbility | (new () => IPrecompilableAbility),
    options?: IAbilityRegistrationOptions
): void {
    // 存储能力类（构造函数或实例）
    if (abilityClass) {
        this._abilityClasses.set(entry.name, abilityClass as any);
    } else if (entry.abilityClass) {
        this._abilityClasses.set(entry.name, entry.abilityClass as any);
    }
    
    // 不实例化！只存储
}
```

**关键点：**
- 只存储构造函数或实例
- 不进行实例化
- 不进行预编译

### 2. getPrecompiled() 方法

```typescript
getPrecompiled(name: string): IPrecompiledAbility | undefined {
    // 检查缓存
    if (this._precompiledCache.has(name)) {
        return this._precompiledCache.get(name);
    }
    
    // 获取能力类
    const abilityClass = this._abilityClasses.get(name);
    if (abilityClass) {
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

**关键点：**
- 检查预编译缓存
- 判断是构造函数还是实例
- 如果是构造函数，实例化并缓存实例
- 预编译并缓存结果

## 执行流程

### 完整流程

```
1. 模块加载
   ├── import EventAbilityEntry
   └── 定义 { abilityClass: EventAbility }  // 构造函数

2. 注册
   ├── registrar.register(EventAbilityEntry)
   └── 存储 EventAbility 构造函数  // 不实例化

3. 首次使用
   ├── registrar.getPrecompiled('Event')
   ├── 检查缓存：无
   ├── 获取 EventAbility 构造函数
   ├── new EventAbility()  // ← 此时才实例化
   ├── 缓存实例
   ├── precompile()  // 预编译
   └── 缓存预编译结果

4. 再次使用
   ├── registrar.getPrecompiled('Event')
   └── 直接返回缓存  // 不再实例化
```

### 缓存策略

**三层缓存：**

1. **预编译缓存** (`_precompiledCache`)
   - 缓存预编译结果
   - 最快，直接返回

2. **实例缓存** (`_abilityClasses`)
   - 缓存能力实例
   - 避免重复实例化

3. **构造函数存储**
   - 初始存储构造函数
   - 实例化后替换为实例

## 性能对比

### 场景：100个能力，注册50个，使用10个

| 方案 | 模块加载 | 注册时 | 使用时 | 总实例化 |
|------|---------|--------|--------|---------|
| 直接new | 100个 | 0个 | 0个 | 100个 |
| register时实例化 | 0个 | 50个 | 0个 | 50个 |
| **get时实例化** | **0个** | **0个** | **10个** | **10个** |

**性能提升：**
- 相比直接new：节省 90%
- 相比register时实例化：节省 80%

## 使用示例

### 定义能力条目

```typescript
// 使用构造函数
export const EventAbilityEntry: ComposableEntry = {
    name: 'Event',
    abilityClass: EventAbility,  // ← 构造函数
};
```

### 注册能力

```typescript
const registrar = ComposableRegistrar.getInstance();

// 注册时不实例化
registrar.register(EventAbilityEntry);
registrar.register(DomainAbilityEntry);
registrar.register(SystemAbilityEntry);

// 此时没有任何能力被实例化
```

### 使用能力

```typescript
// 首次使用：实例化 + 预编译
const eventAbility = registrar.getPrecompiled('Event');
// ↑ new EventAbility() + precompile()

// 再次使用：直接返回缓存
const eventAbility2 = registrar.getPrecompiled('Event');
// ↑ 直接返回缓存

// 不使用的能力永远不会实例化
// DomainAbility 和 SystemAbility 不会被实例化
```

## 优势总结

### 1. 真正的延迟加载
- ✅ 只在使用时实例化
- ✅ 不使用不实例化
- ✅ 最小化内存占用

### 2. 智能缓存
- ✅ 实例缓存：避免重复实例化
- ✅ 预编译缓存：避免重复预编译
- ✅ 性能最优

### 3. 灵活性
- ✅ 支持构造函数
- ✅ 支持实例
- ✅ 自动判断类型

### 4. 易于使用
- ✅ 透明的延迟加载
- ✅ 无需手动管理
- ✅ 自动缓存

## 代码对比

### 旧方案（register时实例化）

```typescript
register(entry: ComposableEntry) {
    // 立即实例化
    const ability = new entry.abilityClass();
    this._abilityClasses.set(entry.name, ability);
    
    // 立即预编译
    const precompiled = ability.precompile();
    this._precompiledCache.set(entry.name, precompiled);
}
```

**问题：** 注册时就实例化，即使不使用

### 新方案（get时实例化）

```typescript
register(entry: ComposableEntry) {
    // 只存储构造函数
    this._abilityClasses.set(entry.name, entry.abilityClass);
}

getPrecompiled(name: string) {
    // 检查缓存
    if (cache.has(name)) return cache.get(name);
    
    // 获取能力类
    const abilityClass = this._abilityClasses.get(name);
    
    // 判断类型
    if (typeof abilityClass === 'function') {
        // 构造函数：实例化
        const ability = new abilityClass();
        // 缓存实例
        this._abilityClasses.set(name, ability);
    }
    
    // 预编译并缓存
    const precompiled = ability.precompile();
    cache.set(name, precompiled);
    return precompiled;
}
```

**优势：** 只在使用时才实例化

## 总结

**真正的延迟实例化设计完成！**

- ✅ register() 只存储构造函数
- ✅ getPrecompiled() 时才实例化
- ✅ 实例缓存避免重复实例化
- ✅ 预编译缓存避免重复预编译
- ✅ 不使用的能力永远不会实例化
- ✅ 性能最优，内存占用最小

**这是真正的延迟加载！**
