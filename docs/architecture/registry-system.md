# 注册表系统

> QimenJS 的注册表（Registry）系统提供集中化的配置管理，支持域、系统、MIME、模式等多种注册表，通过锁定机制保证运行时稳定性。

## 概述

注册表系统是 QimenJS 的**配置中枢**，解决的核心问题是：

- **集中管理**：URL、系统配置、MIME 映射、正则模式等不再散落代码各处
- **环境切换**：开发/测试/生产环境只需修改注册表配置
- **多平台对接**：域注册表的 `preset` 字段是连接 HTTP 管道与数据处理器管道的桥梁
- **运行时安全**：启动完成后锁定，禁止修改

## 架构

```
RegistryHub (静态类)
  ├── Registry (Proxy 代理 → Registry.domain 等价于 RegistryHub.get('domain'))
  │
  ├── DomainRegistrar     → name: 'domain'    → Map<string, DomainConfig>
  ├── SystemRegistrar     → name: 'system'    → Partial<SystemConfig>
  ├── MimeTypeRegistrar   → name: 'mimeType'  → Map<string, Set<string>> + reverseStorage
  └── PatternRegistrar    → name: 'pattern'   → Map<string, RegExp>
```

**Proxy 代理**：`Registry.domain` 通过 ES6 Proxy 直接映射到 `RegistryHub.registars.get('domain')`。

## RegistrarBase 基类

所有注册器的抽象基类，提供：

| API | 说明 |
|-----|------|
| `register(key, value, force?)` | 注册条目，冲突时抛 `RegistrarConflictError` |
| `unregister(key)` | 删除条目 |
| `get(key)` | 获取条目 |
| `clear()` | 清空所有条目 |
| `lock()` | 锁定后禁止注册/注销 |
| `inspect()` | 调试输出 |

**单例模式**：`getInstance<T>()` 使用构造函数作为键，确保每种注册器只有一个实例。

**双层锁定**：
1. `RegistryHub.lock()` → 禁止新增注册器
2. 各注册器 `lock()` → 禁止修改数据

## 域注册表（DomainRegistrar）

域注册表是**多平台对接的核心**，每个域名对应一个后端服务。

### DomainConfig 结构

```typescript
interface DomainConfig {
    baseUrl: string;           // API 基地址
    preset: PresetType;        // 预设类型：'abp' | 'spring' | string
    pageSize: number;          // 默认分页大小
    pagesizes: number[];       // 可选分页大小列表
    timeout?: number;          // 超时时间
    token?: string;            // Token 存储
    authInjector?: 'bearer' | 'basic' | ((context: any) => void);  // 认证注入器
    commonParams?: Record<string, any> | ((...args: any[]) => Record<string, any>);  // URL 公共参数
    commonBody?: Record<string, any> | ((...args: any[]) => Record<string, any>);    // Body 公共参数
    custom?: Record<string, any>;  // 自定义扩展
}
```

### 基本使用

```typescript
import { Registry } from '@qimenjs/registry';

// 注册域
Registry.domain.register('api', {
    baseUrl: 'https://api.example.com/v1',
    preset: 'abp',
    pageSize: 20,
    pagesizes: [10, 20, 50],
});

// 使用域
const client = new HttpClient('api');
await client.get('/users').context;
```

### 多域配置

```typescript
// 多个后端服务
Registry.domain.register('api', { baseUrl: 'https://api.example.com', preset: 'abp', ... });
Registry.domain.register('auth', { baseUrl: 'https://auth.example.com', preset: 'spring', ... });
Registry.domain.register('file', { baseUrl: 'https://cdn.example.com', preset: 'default', ... });
```

### preset 与数据处理器管道的联动

`preset` 是连接域配置与数据处理器管道的桥梁：

```
DomainRegistrar.register('main', { preset: 'abp', ... })
    ↓
CoreEntityManager.getDomainConfig() → Registry.domain.get(this.domain)
    ↓
CoreEntityManager.getDataProcessorPreset() → domainConfig.preset
    ↓
DataProcessorRegistrar.getPipeline('abp', 'pre')  // 自动过滤 ABP 处理器链
    ↓
DataProcessorExecutor.execute(context, handlers, 'pre')
```

同一套前端代码，只需切换 `preset` 即可适配不同后端平台。

### Token 管理

```typescript
// 登录后更新 token（支持多域共享）
Registry.domain.updateToken(token, 'api', 'auth', 'cdn');

// 登出清除 token
Registry.domain.clearToken('api', 'auth', 'cdn');
```

### 认证注入

- `'bearer'` → 自动注入 `Authorization: Bearer {token}`
- `'basic'` → 自动注入 Basic Auth
- 自定义函数 → 完全控制注入逻辑

### 环境切换

```typescript
// config/dev.ts
Registry.domain.register('api', { baseUrl: 'http://localhost:3000', preset: 'abp', ... });

// config/prod.ts
Registry.domain.register('api', { baseUrl: 'https://api.example.com', preset: 'abp', ... });
```

## 系统注册表（SystemRegistrar）

管理全局系统配置，存储结构为 `Partial<SystemConfig>`：

```typescript
Registry.system.register('locale', 'zh-CN');
Registry.system.register('dateFormat', 'yyyy-MM-dd');
Registry.system.register('currentUser', { id: 1, name: 'Admin' });
Registry.system.register('tenantId', 'default');

// 批量注册
Registry.system.registerAll({
    env: 'production',
    locale: 'zh-CN',
    timezone: 'Asia/Shanghai',
});
```

**SystemConfig 字段**：env、locale、dateFormat、datetimeFormat、timezone、currentUser、tenantId、password 策略等。

## MIME 注册表（MimeTypeRegistrar）

管理文件扩展名与 MIME 类型的**双向映射**：

```typescript
// 注册
Registry.mimeType.register('jpg', ['image/jpeg']);
Registry.mimeType.register('png', ['image/png']);

// 正向查找：扩展名 → MIME
Registry.mimeType.get('jpg');  // → ['image/jpeg']

// 反向查找：MIME → 扩展名
Registry.mimeType.getByMime('image/jpeg');  // → 'jpg'
```

**双向维护**：注册/注销时 `storage`（ext → Set\<mime\>）和 `reverseStorage`（mime → Set\<ext\>）同步更新。

## 模式注册表（PatternRegistrar）

管理命名正则表达式：

```typescript
// 注册
Registry.pattern.register('email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
Registry.pattern.register('phone', /^1[3-9]\d{9}$/);

// 使用
const pattern = Registry.pattern.get('email');  // → RegExp
pattern.test('user@example.com');  // → true
```

**与验证系统联动**：验证管道的 `format`/`pattern` 处理器可直接引用注册表中的模式名。

## 锁定与启动流程

```typescript
// 应用启动时注册所有配置
Registry.domain.register('api', { ... });
Registry.system.registerAll({ ... });

// 启动完成后锁定
RegistryHub.lock();  // 禁止新增注册器
Registry.domain.lock();  // 禁止修改域配置
```

锁定后任何 `register`/`unregister` 操作都会抛出 `RegistrarLockedError`。

## 参见

- [域注册最佳实践](../best-practices/domain-registration.md)
- [HTTP 管道与平台适配](./http-pipeline.md)
- [验证管道与 Schema](./validation-pipeline.md)