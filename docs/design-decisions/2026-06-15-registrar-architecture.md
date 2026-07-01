# 注册器架构统一

> **部分过时**：ComposableRegistrar 相关内容已过时（已移除），RegistryHub 和其他 Registrar 仍有效。

**日期**: 2026-06-15  
**状态**: 已完成  
**影响范围**: registry 包、composable 包

## 背景

OrbitJS 中有多个注册器（Registrar），用于管理不同类型的注册项。之前存在以下问题：

1. **架构不一致** - ComposableRegistrar 没有从 RegistrarBase 派生
2. **重复代码** - 每个注册器都自己实现单例模式、锁定机制
3. **接口不统一** - 不同注册器的方法签名不一致

## 决策

### 1. ComposableRegistrar 从 RegistrarBase 派生

**决策**: ComposableRegistrar 继承 RegistrarBase

**原因**:
- 保持架构一致性
- 复用单例模式、锁定机制
- 统一接口

**代码**:
```typescript
export class ComposableRegistrar extends RegistrarBase<AbilityStorage> {
    public readonly name = 'ComposableRegistrar';
    
    protected storage: AbilityStorage = {
        registry: new Map(),
        precompiledCache: new Map(),
    };
    
    // 实现抽象方法
    register(entry: { name: string; ctor: any }, abilityClass: any, options?: { immediate?: boolean }): void { }
    unregister(name: string): void { }
    get(name: string): IAbilityRegistrationEntry | undefined { }
    protected doInspect(): void { }
    
    // 添加特定方法
    getPrecompiled(name: string): IPrecompiledAbility | undefined { }
    getRecursive(names: string[]): ComposableEntry[] { }
    has(name: string): boolean { }
    getAllNames(): string[] { }
}
```

### 2. RegistrarBase 的设计

**决策**: RegistrarBase 提供统一的基类

**功能**:
- 单例模式 - `getInstance()`
- 锁定机制 - `lock()`, `checkLock()`
- 清空功能 - `clear()`
- 调试功能 - `inspect()`

**抽象方法**:
- `register()` - 注册
- `unregister()` - 注销
- `get()` - 获取
- `doInspect()` - 输出状态

### 3. 存储结构

**决策**: 使用泛型支持不同的存储结构

**原因**:
- 不同注册器需要不同的数据结构
- Map、Array、Object 等
- 类型安全

**示例**:
```typescript
// ComposableRegistrar 使用 AbilityStorage
interface AbilityStorage {
    registry: Map<string, IAbilityRegistrationEntry>;
    precompiledCache: Map<string, IPrecompiledAbility>;
}

// 其他注册器可以使用不同的存储
class SimpleRegistrar extends RegistrarBase<Map<string, any>> { }
class ArrayRegistrar extends RegistrarBase<any[]> { }
```

## 影响

### 正面影响
- 架构统一
- 代码复用
- 接口一致
- 便于维护

### 负面影响
- 需要重构现有注册器
- 可能影响现有代码

## 替代方案

### 方案 A: 每个注册器独立实现
- **优点**: 灵活
- **缺点**: 重复代码，不一致
- **结论**: 不采用

### 方案 B: 使用组合而非继承
- **优点**: 更灵活
- **缺点**: 复杂，难以统一
- **结论**: 不采用

### 方案 C: 继承 RegistrarBase（采用）
- **优点**: 统一，复用，简单
- **缺点**: 继承的局限性
- **结论**: 采用

## 实施细节

### 修改的文件

1. `src/composable/ComposableRegistrar.ts`
   - 从 RegistrarBase 派生
   - 实现所有抽象方法
   - 添加特定方法

2. `src/composable/types/composable.ts`
   - 添加 ComposableEntry 类型

### 实现的方法

| 方法 | 说明 |
|------|------|
| `register()` | 注册能力 |
| `unregister()` | 注销能力 |
| `get()` | 获取能力注册条目 |
| `getPrecompiled()` | 获取预编译能力 |
| `getRecursive()` | 递归获取能力条目 |
| `has()` | 检查能力是否已注册 |
| `getAllNames()` | 获取所有已注册的能力名称 |
| `doInspect()` | 输出注册器状态信息 |

## 后续工作

1. **检查其他注册器** - 确保都从 RegistrarBase 派生
2. **统一接口** - 标准化方法签名
3. **编写测试** - 测试 RegistrarBase 的功能
4. **文档完善** - 添加使用指南

## 参考资料

- [RegistrarBase.ts](../../src/registry/registrars/RegistrarBase.ts) - 基类实现
- [ComposableRegistrar.ts](../../src/composable/ComposableRegistrar.ts) - 派生类实现
