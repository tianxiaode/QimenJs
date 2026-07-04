# Registry 类型定义问题分析

## 一、当前类型定义的问题

### 1. Registrars 接口为空

**当前定义**：
```typescript
// types.ts
export interface Registrars {}

// register.d.ts
declare module '@orbit-js/registry' {
    interface Registrars {
        [MimeTypeRegistrarName]: MimeTypeRegistrar;
        [SystemRegistrarName]: SystemRegistrar;
        [PatternRegistrarName]: PatternRegistrar;
        [DomainRegistrarName]: DomainRegistrar;
        [HtmlTemplateRegistrarName]: HtmlTemplateRegistrar;
    }
}
```

**问题**：
- ❌ `Registrars` 接口在 `types.ts` 中是空的
- ❌ 通过模块增强（module augmentation）在 `register.d.ts` 中扩展
- ❌ IDE 类型提示不完整
- ❌ 运行时类型检查困难

**影响**：
```typescript
// 使用 Proxy 访问
Registry.mimeType  // ✅ 运行时正常
Registry.system    // ✅ 运行时正常

// 但类型检查不完整
Registry.unknown   // ❌ TypeScript 不报错，但运行时返回 undefined
```

### 2. 不同注册器的存储结构差异

**SystemRegistrar**：
```typescript
// 存储单个配置对象
protected storage: Partial<SystemConfig> = {
    locale: 'zh-CN',
    dateFormat: 'YYYY-MM-DD',
    // ...
};

// 注册方式
register(keyOrObj: string | Partial<SystemConfig>, value?: any): void
```

**DomainRegistrar**：
```typescript
// 存储 Map 结构
protected storage = new Map<string, DomainConfig>();

// 注册方式
register(name: string, config: DomainConfig, force = false): void
```

**MimeTypeRegistrar**：
```typescript
// 存储对象结构
protected storage: Record<string, MimeTypeConfig> = {};

// 注册方式
register(mimeType: string, config: MimeTypeConfig): void
```

**问题**：
- ❌ 每个注册器的存储结构不同
- ❌ 每个注册器的 `register` 方法签名不同
- ❌ 难以定义统一的类型约束
- ❌ 泛型 `RegistrarBase<M>` 的 `M` 类型各不相同

### 3. 泛型类型不够严格

**当前定义**：
```typescript
export abstract class RegistrarBase<M = any> {
    protected abstract storage: M;
    
    abstract register(...args: any[]): void;
    abstract unregister(id: string): void;
    abstract get(...args: any[]): any;
}
```

**问题**：
- ❌ `register` 使用 `...args: any[]`，类型不安全
- ❌ `get` 返回 `any`，丢失类型信息
- ❌ 无法在编译时检查参数正确性

**影响**：
```typescript
// SystemRegistrar
system.register('locale', 'zh-CN');  // ✅ 正确
system.register('unknown', 'value'); // ❌ TypeScript 不报错

// DomainRegistrar
domain.register('api', config);      // ✅ 正确
domain.register(123, config);        // ❌ TypeScript 不报错
```

## 二、问题根源分析

### 1. 设计权衡

**问题**：不同注册器确实需要不同的注册内容

**原因**：
- SystemRegistrar：系统配置（单个对象）
- DomainRegistrar：域配置（Map 结构）
- MimeTypeRegistrar：MIME 类型（Record 结构）
- PatternRegistrar：正则模式（Map 结构）

**这是合理的设计**，因为：
- ✅ 不同类型的配置确实需要不同的存储结构
- ✅ 不同注册器的使用场景不同
- ✅ 提供了灵活性

**代价**：
- ❌ 难以定义统一的类型约束
- ❌ 基类只能使用泛型 `M = any`

### 2. TypeScript 的限制

**问题**：TypeScript 的泛型约束有限

**示例**：
```typescript
// 无法定义这样的泛型约束
interface RegistrarMethods<M> {
    // 希望根据 M 的类型自动推断 register 的参数类型
    register(...args: inferFrom<M>): void;
}
```

**TypeScript 不支持**：
- ❌ 根据泛型参数自动推断方法签名
- ❌ 动态类型约束
- ❌ 条件类型推断方法参数

## 三、改进方案

### 方案一：为每个注册器定义严格的类型（推荐）

**实现方式**：

```typescript
// 1. 定义注册器方法接口
interface SystemRegistrarMethods {
    register(keyOrObj: string | Partial<SystemConfig>, value?: any): void;
    unregister(key: string): void;
    get(): Partial<SystemConfig>;
    get(key: string): any;
}

interface DomainRegistrarMethods {
    register(name: string, config: DomainConfig, force?: boolean): void;
    unregister(name: string): void;
    get(name: string): DomainConfig | undefined;
    getAll(): Map<string, DomainConfig>;
}

// 2. 更新 Registrars 接口
export interface Registrars {
    system: SystemRegistrar & SystemRegistrarMethods;
    domain: DomainRegistrar & DomainRegistrarMethods;
    mimeType: MimeTypeRegistrar & MimeTypeRegistrarMethods;
    pattern: PatternRegistrar & PatternRegistrarMethods;
    html: HtmlTemplateRegistrar & HtmlTemplateRegistrarMethods;
}

// 3. 使用时类型安全
Registry.system.register('locale', 'zh-CN');  // ✅ 类型安全
Registry.domain.register('api', config);      // ✅ 类型安全
```

**优点**：
- ✅ 完整的类型提示
- ✅ 编译时类型检查
- ✅ IDE 自动补全支持
- ✅ 不破坏现有代码

**缺点**：
- ❌ 需要为每个注册器定义接口
- ❌ 维护成本增加

### 方案二：使用泛型约束改进基类

**实现方式**：

```typescript
// 1. 定义存储类型映射
interface StorageTypeMap {
    system: Partial<SystemConfig>;
    domain: Map<string, DomainConfig>;
    mimeType: Record<string, MimeTypeConfig>;
    pattern: Map<string, PatternConfig>;
    html: Map<string, HtmlTemplateConfig>;
}

// 2. 改进 RegistrarBase
export abstract class RegistrarBase<K extends keyof StorageTypeMap> {
    protected abstract storage: StorageTypeMap[K];
    
    // 根据存储类型提供不同的方法签名
    abstract register(...args: RegisterArgs<K>): void;
    abstract unregister(...args: UnregisterArgs<K>): void;
    abstract get(...args: GetArgs<K>): GetReturn<K>;
}

// 3. 具体实现
class SystemRegistrar extends RegistrarBase<'system'> {
    // storage 类型自动推断为 Partial<SystemConfig>
    protected storage: Partial<SystemConfig> = {};
    
    // register 参数类型自动推断
    register(keyOrObj: string | Partial<SystemConfig>, value?: any): void {
        // ...
    }
}
```

**优点**：
- ✅ 类型自动推断
- ✅ 减少重复定义
- ✅ 更严格的类型约束

**缺点**：
- ❌ 实现复杂
- ❌ TypeScript 高级特性，可读性差
- ❌ 可能破坏现有代码

### 方案三：保持现状 + 改进文档（务实）

**实现方式**：

```typescript
// 1. 保持现有类型定义
export interface Registrars {
    [key: string]: RegistrarBase<any>;
}

// 2. 添加详细的 JSDoc 注释
/**
 * 注册器集合
 * 
 * 可用的注册器：
 * - `system`: SystemRegistrar - 系统配置注册器
 * - `domain`: DomainRegistrar - 域配置注册器
 * - `mimeType`: MimeTypeRegistrar - MIME 类型注册器
 * - `pattern`: PatternRegistrar - 正则模式注册器
 * - `html`: HtmlTemplateRegistrar - HTML 模板注册器
 * 
 * @example
 * // 系统配置
 * Registry.system.register('locale', 'zh-CN');
 * 
 * // 域配置
 * Registry.domain.register('api', { baseUrl: '...', ... });
 * 
 * // MIME 类型
 * Registry.mimeType.register('image/png', { ... });
 */
export interface Registrars {
    [key: string]: RegistrarBase<any>;
}

// 3. 为每个注册器添加详细的使用示例
```

**优点**：
- ✅ 改动最小
- ✅ 不破坏现有代码
- ✅ 通过文档提供指导

**缺点**：
- ❌ 类型安全性仍然较弱
- ❌ 依赖文档而非类型系统

## 四、推荐方案

### 短期：方案三（务实）

**理由**：
1. 改动最小，风险最低
2. 不破坏现有代码
3. 通过文档改进开发体验
4. 后续代码修改时可以逐步完善

**实施步骤**：
1. 为 `Registrars` 接口添加详细注释
2. 为每个注册器添加使用示例
3. 在 README 中说明类型系统的限制

### 中期：方案一（类型安全）

**理由**：
1. 提供完整的类型提示
2. 编译时类型检查
3. 不破坏现有代码
4. 渐进式改进

**实施步骤**：
1. 为每个注册器定义方法接口
2. 更新 `Registrars` 接口
3. 更新测试确保类型正确

### 长期：根据使用情况决定

**考虑因素**：
- 是否需要更严格的类型检查？
- 维护成本是否可接受？
- 是否有更好的 TypeScript 特性可用？

## 五、具体建议

### 立即实施（短期）

1. **改进 Registrars 接口注释**
   ```typescript
   /**
    * 注册器集合
    * 
    * 可用的注册器：
    * - `system`: SystemRegistrar - 系统配置注册器
    * - `domain`: DomainRegistrar - 域配置注册器
    * - `mimeType`: MimeTypeRegistrar - MIME 类型注册器
    * - `pattern`: PatternRegistrar - 正则模式注册器
    * - `html`: HtmlTemplateRegistrar - HTML 模板注册器
    * 
    * @example
    * // 系统配置
    * Registry.system.register('locale', 'zh-CN');
    * 
    * // 域配置
    * Registry.domain.register('api', { baseUrl: '...', ... });
    */
   export interface Registrars {
       [key: string]: RegistrarBase<any>;
   }
   ```

2. **为每个注册器添加使用示例**
   ```typescript
   /**
    * 系统配置注册器
    * 
    * @example
    * // 注册单个配置
    * Registry.system.register('locale', 'zh-CN');
    * 
    * // 批量注册
    * Registry.system.register({
    *     locale: 'zh-CN',
    *     timezone: 'UTC+8'
    * });
    * 
    * // 获取配置
    * const locale = Registry.system.get('locale');
    */
   export class SystemRegistrar extends RegistrarBase<Partial<SystemConfig>> {
       // ...
   }
   ```

### 后续考虑（中期）

1. **为每个注册器定义方法接口**
2. **更新 Registrars 接口**
3. **添加类型测试**

## 六、总结

### 问题本质

**类型定义的主要问题**：
1. `Registrars` 接口为空，依赖模块增强
2. 不同注册器的存储结构和方法签名不同
3. 泛型类型不够严格

**问题根源**：
- 不同注册器确实需要不同的注册内容（这是合理的设计）
- TypeScript 的泛型约束有限
- 设计时权衡了灵活性和类型安全

### 推荐方案

**短期**：改进文档和注释（务实）
**中期**：为每个注册器定义方法接口（类型安全）
**长期**：根据使用情况决定

**当前状态**：✅ **可以继续使用，渐进式改进**

类型定义的问题不影响运行时功能，但影响开发体验。建议按上述方案渐进式改进。
