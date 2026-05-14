# DomainAbility.ts 错误修复

## 问题分析

### 错误信息

```
DomainAbility.ts(6,10): error TS2305: Module '"../../types"' has no exported member 'DOMAIN_CACHE_SYMBOL'.
```

### 问题根源

**DOMAIN_CACHE_SYMBOL 常量未定义！**

DomainAbility.ts 使用了 `DOMAIN_CACHE_SYMBOL`，但该常量没有在任何地方定义。

## 解决方案

### 1. 创建常量定义

**文件：** `src/kernel/types/constants/domain.ts`

```typescript
/**
 * Domain能力相关常量
 */

/**
 * Domain配置缓存Symbol
 * 
 * 用于在ComposableBase类级别缓存Domain配置
 */
export const DOMAIN_CACHE_SYMBOL = Symbol('domain-cache');
```

### 2. 更新导出

**文件：** `src/kernel/types/constants/index.ts`

```typescript
export * from './entity-state';
export * from './entity-manager';
export * from './system';
export * from './domain';  // ← 新增
```

## DOMAIN_CACHE_SYMBOL 用途

### 在 DomainAbility 中的使用

```typescript
export class DomainAbility extends AbilityBase {
    readonly name = 'Domain';
    
    protected expose(): IExposeResult {
        // 1. 尝试从缓存获取
        let config = this.host.getStatic<DomainConfig>(DOMAIN_CACHE_SYMBOL);
        
        // 2. 如果没有缓存，则初始化
        if (!config) {
            const domainName = this.host.domain;
            if (domainName) {
                config = DomainRegistrar.getInstance().get(domainName);
                this.host.setStatic(DOMAIN_CACHE_SYMBOL, config);  // ← 缓存
                this.host.logger?.debug?.(`Domain [${domainName}] initialized and cached.`);
            }
        }
        
        return {
            domainConfig: {
                get: (): DomainConfig => config as DomainConfig,
                enumerable: true,
            },
        };
    }
}
```

### 缓存机制说明

**1. 类级别缓存**
- `getStatic()` / `setStatic()` 是类级别缓存
- 所有实例共享同一份配置
- 避免重复查询 DomainRegistrar

**2. Symbol 作为键**
- 使用 Symbol 作为缓存键
- 避免属性名冲突
- 保证唯一性

**3. 性能优化**
- 首次访问时缓存
- 后续访问直接从缓存读取
- 减少注册表查询开销

## 常量文件结构

```
src/kernel/types/constants/
├── domain.ts           ← Domain相关常量（新增）
├── entity-manager.ts
├── entity-state.ts
├── system.ts
└── index.ts            ← 统一导出
```

## 其他常量示例

### entity-state.ts

```typescript
export const ENTITY_STATE_CACHE_SYMBOL = Symbol('entity-state-cache');
```

### system.ts

```typescript
export const SYSTEM_CACHE_SYMBOL = Symbol('system-cache');
```

## 最佳实践

### 1. 常量命名

**格式：** `{FEATURE}_CACHE_SYMBOL`

```typescript
// ✅ 正确
export const DOMAIN_CACHE_SYMBOL = Symbol('domain-cache');
export const ENTITY_STATE_CACHE_SYMBOL = Symbol('entity-state-cache');

// ❌ 错误
export const domainCache = Symbol('domain-cache');  // 不符合命名规范
```

### 2. 文件组织

**每个功能模块一个常量文件：**

```
constants/
├── domain.ts          ← Domain相关
├── entity-state.ts    ← EntityState相关
├── system.ts          ← System相关
└── index.ts           ← 统一导出
```

### 3. Symbol 描述

**提供有意义的描述：**

```typescript
// ✅ 正确
export const DOMAIN_CACHE_SYMBOL = Symbol('domain-cache');  // 清晰的描述

// ❌ 错误
export const DOMAIN_CACHE_SYMBOL = Symbol();  // 无描述
export const DOMAIN_CACHE_SYMBOL = Symbol('cache');  // 描述不明确
```

## 总结

**DomainAbility.ts 错误已修复！**

- ✅ 创建 DOMAIN_CACHE_SYMBOL 常量
- ✅ 添加到 constants/domain.ts
- ✅ 更新 constants/index.ts 导出
- ✅ DomainAbility 可以正常使用

**常量定义规范：**
- ✅ 使用 Symbol 作为缓存键
- ✅ 提供有意义的描述
- ✅ 按功能模块组织文件
- ✅ 统一导出便于使用
