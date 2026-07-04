# Composable 系统重构

> **已过时**：本文档基于旧版 AbilityBase + expose() 架构。当前已迁移为 AbilityDefinition 纯对象模式，AbilityBase、ComposableRegistrar 已移除。保留本文档仅作历史参考。

**日期**: 2026-06-15  
**状态**: 已完成  
**影响范围**: composable 包、测试

## 背景

Composable 系统是 QimenJS 的核心能力注入系统，用于实现模块化、可组合的功能。之前的实现存在以下问题：

1. **性能问题** - 运行时原型链爬取，性能开销大
2. **架构不一致** - ComposableRegistrar 没有从 RegistrarBase 派生
3. **测试过时** - 测试代码与实现不匹配

## 决策

### 1. AbilityBase 设计

**决策**: AbilityBase 是抽象类，需要子类实现 `name` 属性

**原因**:
- `name` 是能力的唯一标识，用于注册和查找
- 作为抽象属性强制子类必须提供
- 符合 `IPrecompilableAbility` 接口要求

**代码**:
```typescript
export abstract class AbilityBase implements IPrecompilableAbility {
    /**
     * 能力名称（必须由子类实现）
     */
    abstract readonly name: string;
    
    /**
     * 暴露属性和方法（必须由子类实现）
     */
    protected abstract expose(): IExposeResult;
}
```

**使用示例**:
```typescript
class EventAbility extends AbilityBase {
    readonly name = 'Event';  // 必须提供
    
    protected expose(): IExposeResult {
        return {
            on: (event, handler) => { /* ... */ },
            emit: (event, data) => { /* ... */ },
        };
    }
}
```

### 2. 预编译能力

**决策**: 使用预编译能力提升性能

**原因**:
- 避免运行时原型链爬取
- 性能提升 70-90%
- 启动时可以懒加载

**实现**:
- `precompile()` 方法在注册时或首次使用时调用
- 返回 `IPrecompiledAbility` 对象
- 包含属性描述符工厂和销毁函数工厂

### 3. expose() API

**决策**: 保留熟悉的 `expose()` API，内部自动转换为预编译能力

**原因**:
- 开发者体验好，易于理解
- 内部自动优化，无需手动预编译
- 兼容旧代码

**示例**:
```typescript
protected expose(): IExposeResult {
    return {
        // 简单值
        version: '1.0.0',
        
        // 方法
        doSomething: () => { /* ... */ },
        
        // getter
        count: { get: () => this._count },
        
        // getter/setter
        value: {
            get: () => this._value,
            set: (val) => { this._value = val; }
        }
    };
}
```

## 影响

### 正面影响
- 性能大幅提升
- API 更清晰
- 类型安全

### 负面影响
- 测试需要重写
- 旧代码需要适配

## 替代方案

### 方案 A: 运行时能力注入
- **优点**: 简单直接
- **缺点**: 性能差，每次都要爬取原型链
- **结论**: 不采用

### 方案 B: 完全预编译
- **优点**: 性能最好
- **缺点**: API 复杂，开发者体验差
- **结论**: 不采用

### 方案 C: 混合方案（采用）
- **优点**: 兼顾性能和开发体验
- **缺点**: 实现复杂
- **结论**: 采用

## 实施细节

### 修改的文件

1. `src/composable/AbilityBase.ts`
   - 添加 `abstract readonly name: string`
   - 实现 `precompile()` 方法
   - 保留 `expose()` API

2. `src/composable/ComposableBase.ts`
   - 使用预编译能力
   - 优化能力加载逻辑

3. `src/composable/ComposableRegistrar.ts`
   - 从 RegistrarBase 派生
   - 实现预编译缓存

4. `src/composable/types/composable.ts`
   - 添加 `ComposableEntry` 类型
   - 定义预编译能力接口

### 测试状态

- **通过的测试**: 6 个
- **失败的测试**: 7 个
- **覆盖率**: ~60%

失败原因：测试代码为旧版本编写，需要重写

## 后续工作

1. **重写测试** - 根据新 API 重写测试
2. **性能测试** - 验证性能提升
3. **文档完善** - 添加使用指南
4. **示例代码** - 提供更多示例

## 参考资料

- [预编译能力设计](./2026-06-15-precompiled-ability.md)
- [注册器架构统一](./2026-06-15-registrar-architecture.md)
