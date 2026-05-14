# ComposableEntry 修改总结

## 问题分析

### 原始定义

```typescript
export interface ComposableEntry {
    name: string;
    description?: string;
    deps?: string[];
    ctor: new (...args: any[]) => IComposable;  // ← 构造函数
}
```

### 问题

**在新架构中，能力类不需要构造函数！**

1. **新架构使用预编译能力**
   - 能力类实现 `IPrecompilableAbility` 接口
   - 通过 `precompile()` 方法生成预编译能力
   - 不需要实例化能力类

2. **ctor 字段无用**
   - `ctor` 是构造函数类型
   - 新架构需要的是 `IPrecompilableAbility` 实例
   - 类型不匹配

## 解决方案

### 修改 ComposableEntry

**新定义：**

```typescript
export interface ComposableEntry {
    /**
     * 能力名称（唯一标识）
     */
    name: string;
    
    /**
     * 能力描述
     */
    description?: string;
    
    /**
     * 依赖的其他能力
     */
    deps?: readonly string[];
    
    /**
     * 可预编译的能力类实例
     * 
     * 注意：这是一个实例，不是构造函数
     * 例如：new EventAbility()
     */
    abilityClass?: IPrecompilableAbility;
}
```

### 主要变化

1. **移除 ctor 字段**
   - 不再需要构造函数
   - 新架构不使用构造函数创建能力实例

2. **添加 abilityClass 字段**
   - 类型：`IPrecompilableAbility`
   - 可选字段（用 `?` 标记）
   - 是实例，不是构造函数

3. **deps 改为 readonly**
   - `deps?: readonly string[]`
   - 防止修改依赖数组

## 使用方式

### 定义能力条目

**旧方式：**

```typescript
export const EventAbilityEntry: ComposableEntry = {
    name: EventAbilityName,
    description: '为类添加事件能力',
    ctor: EventAbility,  // ← 构造函数
};
```

**新方式：**

```typescript
export const EventAbilityEntry: ComposableEntry = {
    name: EventAbilityName,
    description: '为类添加事件能力',
    abilityClass: new EventAbility(),  // ← 实例
};
```

### 注册能力

**方式 1: 从 entry 获取**

```typescript
const registrar = ComposableRegistrar.getInstance();

// entry 中包含 abilityClass
registrar.register(EventAbilityEntry, undefined, { immediate: true });
```

**方式 2: 单独传入**

```typescript
const registrar = ComposableRegistrar.getInstance();

// entry 中不包含 abilityClass，单独传入
registrar.register(
    { name: 'Event', description: '事件能力' },
    new EventAbility(),
    { immediate: true }
);
```

**方式 3: 混合使用**

```typescript
const registrar = ComposableRegistrar.getInstance();

// entry 中有 abilityClass，但单独传入的优先级更高
registrar.register(
    { name: 'Event', abilityClass: new EventAbility() },
    new CustomEventAbility(),  // ← 使用这个
    { immediate: true }
);
```

## ComposableRegistrar 修改

### register 方法

```typescript
register(
    entry: ComposableEntry,
    abilityClass?: IPrecompilableAbility,
    options?: IAbilityRegistrationOptions
): void {
    // ...
    
    // 优先使用传入的 abilityClass，其次使用 entry 中的
    const ability = abilityClass ?? entry.abilityClass;
    
    if (ability) {
        this._abilityClasses.set(entry.name, ability);
        
        if (options?.immediate) {
            const precompiled = ability.precompile();
            this._precompiledCache.set(entry.name, precompiled);
        }
    }
}
```

### 优先级规则

```
传入的 abilityClass > entry.abilityClass
```

**示例：**

```typescript
// 情况 1: 只有 entry.abilityClass
registrar.register({ 
    name: 'Event', 
    abilityClass: new EventAbility() 
});
// 使用 entry.abilityClass

// 情况 2: 只有传入的 abilityClass
registrar.register(
    { name: 'Event' },
    new EventAbility()
);
// 使用传入的 abilityClass

// 情况 3: 两者都有
registrar.register(
    { name: 'Event', abilityClass: new EventAbility() },
    new CustomEventAbility()
);
// 使用传入的 abilityClass（优先级更高）
```

## 已修改的文件

### 1. types/registrars/entries.ts

**修改前：**
```typescript
export interface ComposableEntry {
    name: string;
    description?: string;
    deps?: string[];
    ctor: new (...args: any[]) => IComposable;
}
```

**修改后：**
```typescript
export interface ComposableEntry {
    name: string;
    description?: string;
    deps?: readonly string[];
    abilityClass?: IPrecompilableAbility;
}
```

### 2. abilities/system/entries.ts

**修改前：**
```typescript
export const EventAbilityEntry: ComposableEntry = {
    name: EventAbilityName,
    description: '为类添加事件能力',
    ctor: EventAbility,
};
```

**修改后：**
```typescript
export const EventAbilityEntry: ComposableEntry = {
    name: EventAbilityName,
    description: '为类添加事件能力',
    abilityClass: new EventAbility(),
};
```

### 3. registrars/ComposableRegistrar.ts

**添加优先级逻辑：**
```typescript
const ability = abilityClass ?? entry.abilityClass;
```

## 优势

### 1. 类型安全
- ✅ 使用 `IPrecompilableAbility` 类型
- ✅ 编译时检查
- ✅ 避免类型错误

### 2. 灵活性
- ✅ 可以在 entry 中定义
- ✅ 可以单独传入
- ✅ 支持覆盖

### 3. 简洁性
- ✅ 移除无用的 ctor 字段
- ✅ 统一使用实例
- ✅ 代码更清晰

### 4. 向后兼容
- ✅ abilityClass 是可选的
- ✅ 可以逐步迁移
- ✅ 不影响现有代码

## 迁移指南

### 步骤 1: 修改 ComposableEntry 定义

```typescript
// 移除 ctor
// 添加 abilityClass
export interface ComposableEntry {
    name: string;
    description?: string;
    deps?: readonly string[];
    abilityClass?: IPrecompilableAbility;  // ← 新增
}
```

### 步骤 2: 修改能力条目定义

```typescript
// 旧方式
export const EventAbilityEntry: ComposableEntry = {
    name: 'Event',
    ctor: EventAbility,  // ← 移除
};

// 新方式
export const EventAbilityEntry: ComposableEntry = {
    name: 'Event',
    abilityClass: new EventAbility(),  // ← 新增
};
```

### 步骤 3: 更新注册代码

```typescript
// 旧方式
registrar.register(entry);

// 新方式（相同）
registrar.register(entry, undefined, { immediate: true });
```

## 总结

**ComposableEntry 已修改完成！**

- ✅ 移除 ctor 字段
- ✅ 添加 abilityClass 字段
- ✅ 更新所有能力条目定义
- ✅ 更新 ComposableRegistrar 逻辑
- ✅ 支持优先级覆盖
- ✅ 类型安全
- ✅ 灵活易用

**新架构完全适配！**
