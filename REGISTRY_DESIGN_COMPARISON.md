# Registry 设计方案对比分析

## 一、方案对比

### 方案 A：当前设计（多个独立注册器）

**设计思路**：
```typescript
// 不同的注册器，不同的功能
Registry.system      // 系统配置
Registry.domain      // 域配置
Registry.mimeType    // MIME 类型
Registry.pattern     // 正则模式
Registry.validator   // 验证器
Registry.schema      // 实体模式
```

**使用方式**：
```typescript
// 简单直接
Registry.system.register('locale', 'zh-CN');
Registry.domain.register('api', { baseUrl: '...' });
Registry.mimeType.register('image/png', {...});
Registry.validator.register('email', {...});
```

**优点**：
- ✅ 使用简单，语义清晰
- ✅ 每个注册器职责单一
- ✅ 类型提示完整
- ✅ 易于理解和维护
- ✅ 符合直觉

### 方案 B：统一注册表 + 注入注册器

**设计思路**：
```typescript
// 统一注册表
class UnifiedRegistry {
    private storage = new Map<string, Map<string, any>>();
    
    // 注册不同类型的项
    register(type: string, key: string, value: any): void {
        if (!this.storage.has(type)) {
            this.storage.set(type, new Map());
        }
        this.storage.get(type)!.set(key, value);
    }
    
    // 获取项
    get(type: string, key: string): any {
        return this.storage.get(type)?.get(key);
    }
}

// 使用
const registry = new UnifiedRegistry();
registry.register('system', 'locale', 'zh-CN');
registry.register('domain', 'api', { baseUrl: '...' });
registry.register('mimeType', 'image/png', {...});
```

**问题**：
- ❌ 使用复杂，需要传递类型参数
- ❌ 类型安全性差（都是 string 和 any）
- ❌ 语义不清晰
- ❌ 难以提供特定功能

## 二、复杂度对比

### 1. 使用复杂度

**方案 A（当前）**：
```typescript
// ✅ 简单：2 个参数
Registry.system.register('locale', 'zh-CN');

// ✅ 语义清晰
Registry.domain.register('api', config);
```

**方案 B（统一）**：
```typescript
// ❌ 复杂：3 个参数
registry.register('system', 'locale', 'zh-CN');

// ❌ 容易出错
registry.register('systme', 'locale', 'zh-CN');  // 拼写错误
```

### 2. 类型安全复杂度

**方案 A（当前）**：
```typescript
// ✅ 类型安全
Registry.system.register('locale', 'zh-CN');  // ✅ 正确
Registry.system.register('unknown', 'value'); // ❌ 编译时报错（如果定义了严格类型）

// ✅ 返回类型明确
const locale: string = Registry.system.get('locale');
```

**方案 B（统一）**：
```typescript
// ❌ 类型不安全
registry.register('system', 'locale', 'zh-CN');  // ✅ 运行时正确
registry.register('system', 'locale', 123);      // ❌ 运行时错误，编译时不报错

// ❌ 返回类型不明确
const locale = registry.get('system', 'locale');  // any 类型
```

### 3. 功能扩展复杂度

**方案 A（当前）**：
```typescript
// ✅ 每个注册器可以有特定功能
class DomainRegistrar extends RegistrarBase {
    // 特定功能
    getByBaseUrl(url: string): DomainConfig | undefined {
        // ...
    }
    
    // 特定验证
    register(name: string, config: DomainConfig, force = false): void {
        // 特定验证逻辑
        if (!config.baseUrl) {
            throw new Error('baseUrl is required');
        }
        // ...
    }
}

// 使用
const config = Registry.domain.getByBaseUrl('https://api.example.com');
```

**方案 B（统一）**：
```typescript
// ❌ 难以提供特定功能
class UnifiedRegistry {
    // 只能提供通用功能
    register(type: string, key: string, value: any): void {
        // 无法针对特定类型提供特定验证
    }
    
    // 无法提供特定查询方法
    // getByBaseUrl？那需要为每个类型写特殊逻辑
}
```

### 4. 维护复杂度

**方案 A（当前）**：
```typescript
// ✅ 每个注册器独立维护
// 修改 SystemRegistrar 不影响 DomainRegistrar
// 添加新功能不影响其他注册器

// ✅ 测试独立
// SystemRegistrar 的测试不影响 DomainRegistrar
```

**方案 B（统一）**：
```typescript
// ❌ 统一注册表需要处理所有类型
// 修改任何功能都可能影响其他功能
// 添加新类型需要修改统一注册表

// ❌ 测试复杂
// 所有类型的测试都在一起
```

## 三、具体问题分析

### 问题 1：类型参数传递

**方案 B 的问题**：
```typescript
// 每次使用都要传递类型参数
registry.register('system', 'locale', 'zh-CN');
registry.register('domain', 'api', config);
registry.register('mimeType', 'image/png', mimeConfig);
registry.register('validator', 'email', validatorConfig);

// 问题：
// 1. 类型参数容易拼写错误
// 2. 没有类型提示
// 3. 运行时才能发现错误
```

**方案 A 的优势**：
```typescript
// 不需要类型参数
Registry.system.register('locale', 'zh-CN');
Registry.domain.register('api', config);
Registry.mimeType.register('image/png', mimeConfig);
Registry.validator.register('email', validatorConfig);

// 优势：
// 1. 不需要拼写类型参数
// 2. IDE 自动补全
// 3. 编译时就能发现错误
```

### 问题 2：特定功能实现

**方案 B 的问题**：
```typescript
// 如何实现 DomainRegistrar 的特定功能？
class UnifiedRegistry {
    // 通用方法
    register(type: string, key: string, value: any): void { }
    
    // 特定功能？只能这样：
    getDomainByBaseUrl(url: string): DomainConfig | undefined {
        // 但这样统一注册表就变得臃肿
        // 而且需要为每个类型添加特定方法
    }
    
    // 或者这样：
    get(type: string, key: string, options?: { byUrl?: string }): any {
        // 但这样参数复杂，难以理解
    }
}
```

**方案 A 的优势**：
```typescript
// 每个注册器可以有特定功能
class DomainRegistrar {
    // 通用功能
    register(name: string, config: DomainConfig): void { }
    
    // 特定功能
    getByBaseUrl(url: string): DomainConfig | undefined {
        for (const config of this.storage.values()) {
            if (config.baseUrl === url) {
                return config;
            }
        }
        return undefined;
    }
}

// 使用简单
const config = Registry.domain.getByBaseUrl('https://api.example.com');
```

### 问题 3：验证逻辑

**方案 B 的问题**：
```typescript
class UnifiedRegistry {
    register(type: string, key: string, value: any): void {
        // 如何验证不同类型的值？
        if (type === 'domain') {
            // DomainConfig 验证
            if (!value.baseUrl) {
                throw new Error('baseUrl is required');
            }
        } else if (type === 'system') {
            // SystemConfig 验证
            // ...
        } else if (type === 'mimeType') {
            // MimeTypeConfig 验证
            // ...
        }
        // 问题：所有验证逻辑混在一起
    }
}
```

**方案 A 的优势**：
```typescript
// 每个注册器有自己的验证逻辑
class DomainRegistrar {
    register(name: string, config: DomainConfig): void {
        // 只验证 DomainConfig
        if (!config.baseUrl) {
            throw new Error('baseUrl is required');
        }
        // ...
    }
}

class SystemRegistrar {
    register(key: string, value: any): void {
        // 只验证 SystemConfig
        // ...
    }
}

// 优势：验证逻辑分离，易于维护
```

## 四、实际场景对比

### 场景 1：配置系统配置

**方案 A**：
```typescript
// ✅ 简单直接
Registry.system.register('locale', 'zh-CN');
Registry.system.register('timezone', 'UTC+8');

// 或者批量
Registry.system.register({
    locale: 'zh-CN',
    timezone: 'UTC+8',
    dateFormat: 'YYYY-MM-DD'
});
```

**方案 B**：
```typescript
// ❌ 繁琐
registry.register('system', 'locale', 'zh-CN');
registry.register('system', 'timezone', 'UTC+8');

// 批量？需要额外实现
registry.registerBatch('system', {
    locale: 'zh-CN',
    timezone: 'UTC+8',
    dateFormat: 'YYYY-MM-DD'
});
```

### 场景 2：配置多个 API 域

**方案 A**：
```typescript
// ✅ 清晰
Registry.domain.register('api', {
    baseUrl: 'https://api.example.com',
    preset: 'spring',
    pageSize: 20
});

Registry.domain.register('auth', {
    baseUrl: 'https://auth.example.com',
    preset: 'abp',
    pageSize: 10
});

// ✅ 特定功能
const apiConfig = Registry.domain.getByBaseUrl('https://api.example.com');
```

**方案 B**：
```typescript
// ❌ 繁琐
registry.register('domain', 'api', {
    baseUrl: 'https://api.example.com',
    preset: 'spring',
    pageSize: 20
});

registry.register('domain', 'auth', {
    baseUrl: 'https://auth.example.com',
    preset: 'abp',
    pageSize: 10
});

// ❌ 特定功能难以实现
const apiConfig = registry.getDomainByBaseUrl('https://api.example.com');
// 或者
const apiConfig = registry.get('domain', 'api', { byUrl: 'https://api.example.com' });
```

### 场景 3：添加新类型的注册器

**方案 A**：
```typescript
// ✅ 简单：创建新注册器
class CacheRegistrar extends RegistrarBase<Map<string, CacheConfig>> {
    public readonly name = 'cache';
    // ...
}

// ✅ 添加类型定义
declare module '@qimenjs/registry' {
    interface Registrars {
        cache: CacheRegistrar;
    }
}

// ✅ 使用
Registry.cache.register('memory', { maxSize: 100 });
```

**方案 B**：
```typescript
// ❌ 需要修改统一注册表
class UnifiedRegistry {
    register(type: string, key: string, value: any): void {
        // 添加 'cache' 类型的处理逻辑
        if (type === 'cache') {
            // CacheConfig 验证
            // ...
        }
        // ...
    }
}

// ❌ 使用
registry.register('cache', 'memory', { maxSize: 100 });
```

## 五、总结

### 复杂度对比表

| 维度 | 方案 A（当前） | 方案 B（统一） |
|------|--------------|--------------|
| 使用复杂度 | ⭐ 简单 | ⭐⭐⭐ 复杂 |
| 类型安全 | ⭐⭐⭐⭐⭐ 强 | ⭐ 弱 |
| 功能扩展 | ⭐⭐⭐⭐⭐ 容易 | ⭐⭐ 困难 |
| 维护复杂度 | ⭐⭐⭐⭐⭐ 低 | ⭐⭐ 高 |
| 语义清晰度 | ⭐⭐⭐⭐⭐ 清晰 | ⭐⭐ 模糊 |
| 特定功能 | ⭐⭐⭐⭐⭐ 支持 | ⭐ 难以支持 |

### 为什么当前设计更好

**核心理由**：

1. **使用简单**：
   - 不需要传递类型参数
   - 语义清晰，符合直觉
   - IDE 自动补全支持

2. **类型安全**：
   - 编译时类型检查
   - 返回类型明确
   - 减少运行时错误

3. **功能强大**：
   - 每个注册器可以有特定功能
   - 特定验证逻辑
   - 特定查询方法

4. **易于维护**：
   - 每个注册器独立
   - 修改不影响其他注册器
   - 测试独立

5. **易于扩展**：
   - 添加新注册器简单
   - 不需要修改现有代码
   - 符合开闭原则

### 方案 B 的问题

**核心问题**：

1. **使用复杂**：需要传递类型参数，容易出错
2. **类型不安全**：都是 string 和 any，编译时无法检查
3. **功能受限**：难以提供特定功能
4. **维护困难**：所有逻辑混在一起
5. **扩展困难**：添加新类型需要修改统一注册表

### 最终结论

**当前设计（方案 A）是正确的选择！**

**理由**：
- ✅ 使用简单，开发体验好
- ✅ 类型安全，减少错误
- ✅ 功能强大，易于扩展
- ✅ 易于维护，职责清晰
- ✅ 符合软件设计原则

**方案 B（统一注册表）的问题**：
- ❌ 复杂度高
- ❌ 使用不方便
- ❌ 类型安全性差
- ❌ 难以扩展

**你的判断完全正确**：统一注册表的方案复杂度更高，使用不方便，当前设计是更好的选择。

## 六、设计原则验证

### 当前设计符合的原则

1. **单一职责原则（SRP）**：
   - 每个注册器只负责一种类型的配置
   - ✅ 符合

2. **开闭原则（OCP）**：
   - 对扩展开放，对修改关闭
   - 添加新注册器不需要修改现有代码
   - ✅ 符合

3. **里氏替换原则（LSP）**：
   - 所有注册器都继承自 RegistrarBase
   - ✅ 符合

4. **接口隔离原则（ISP）**：
   - 每个注册器有自己的接口
   - ✅ 符合

5. **依赖倒置原则（DIP）**：
   - 依赖抽象（RegistrarBase），不依赖具体实现
   - ✅ 符合

**结论**：当前设计完全符合 SOLID 原则，是一个优秀的设计。
