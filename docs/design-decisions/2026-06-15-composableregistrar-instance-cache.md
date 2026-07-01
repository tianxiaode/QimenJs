# ComposableRegistrar 实例缓存修复

> **已过时**：ComposableRegistrar 已从代码中移除。保留本文档仅作历史参考。

**日期**: 2026-06-15  
**状态**: ✅ 已完成  
**影响范围**: composable 包

## 背景

在对比旧版本（kernel 中）和当前版本的 ComposableRegistrar 后，发现当前实现缺少关键的实例缓存机制，导致性能问题。

## 问题分析

### 问题 1：重复实例化

**旧版本**：
```typescript
// 第一次：构造函数 → 实例化 → 缓存实例
// 第二次：直接使用缓存的实例
```

**当前版本（修复前）**：
```typescript
// 每次都调用 abilityClass.precompile()
// 如果 abilityClass 是构造函数，每次都会实例化！
```

### 问题 2：MRO 是否需要？

**结论：不需要**

**原因**：
1. **装饰器已经处理父类能力**：
   ```typescript
   export function Ability(...keys: string[]) {
       return (ctor: any) => {
           // 直接从父类获取已收集的能力
           const parentAbilities = Object.getPrototypeOf(ctor)?.[ABILITIES_KEY] || [];
           // 合并父类和自己的能力
           ctor[ABILITIES_KEY] = [...new Set([...parentAbilities, ...keys])];
       };
   }
   ```

2. **编译阶段完成**：父类能力在装饰器阶段就已经合并，不需要运行时解析

3. **getRecursive 简化**：只需要简单映射能力名称到条目

## 解决方案

### 添加实例缓存机制

```typescript
export class ComposableRegistrar extends RegistrarBase<AbilityStorage> {
    // 添加实例缓存
    private _abilityInstances = new Map<string, IPrecompilableAbility>();
    
    getPrecompiled(name: string): IPrecompiledAbility | undefined {
        // 1. 检查预编译缓存
        if (this.storage.precompiledCache.has(name)) {
            return this.storage.precompiledCache.get(name);
        }
        
        // 2. 获取注册条目
        const entry = this.storage.registry.get(name);
        if (!entry) return undefined;
        
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
}
```

## 实施细节

### 修改的文件

1. `src/composable/ComposableRegistrar.ts`
   - 添加 `_abilityInstances` Map
   - 修改 `getPrecompiled()` 实现实例缓存
   - 修改 `unregister()` 清除实例缓存
   - 添加 `clearCaches()` 方法
   - 更新 `doInspect()` 显示实例缓存状态

### 新增功能

- `clearCaches()` - 清除所有缓存（用于测试）

### 保留的功能

- `getRecursive()` - 简单映射，不需要 MRO
- 所有其他方法保持不变

## 性能影响

### 修复前

```typescript
// 假设 EventAbility 是一个构造函数
registrar.register({ name: 'Event', ctor: EventAbility }, EventAbility);

// 第一次调用
const p1 = registrar.getPrecompiled('Event'); // 实例化 EventAbility

// 第二次调用
const p2 = registrar.getPrecompiled('Event'); // 又实例化 EventAbility！
```

### 修复后

```typescript
// 第一次调用
const p1 = registrar.getPrecompiled('Event'); 
// 实例化 EventAbility，缓存实例

// 第二次调用
const p2 = registrar.getPrecompiled('Event'); 
// 使用缓存的实例，不再实例化 ✅
```

## 测试验证

需要添加测试验证：
- [ ] 第一次调用时实例化
- [ ] 第二次调用时使用缓存
- [ ] 实例缓存正确性
- [ ] 预编译缓存正确性

## 架构决策

### 为什么不恢复 MRO？

1. **装饰器已经处理**：父类能力在编译阶段合并
2. **性能更好**：编译时处理比运行时快
3. **代码更简单**：不需要复杂的依赖解析
4. **功能等价**：最终结果相同

### 为什么保留实例缓存？

1. **避免重复实例化**：性能优化
2. **懒加载**：第一次使用时才实例化
3. **内存效率**：一个能力只有一个实例
4. **符合设计原则**：只在第一次获取时实例化并缓存

## 参考资料

- [ComposableRegistrar 版本对比](./2026-06-15-comparableregistrar-comparison.md)
- [Composable 系统重构](./2026-06-15-composable-refactoring.md)
