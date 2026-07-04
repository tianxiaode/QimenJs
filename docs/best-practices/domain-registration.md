# Domain 注册最佳实践

## 为什么需要注册 Domain？

### 问题：不注册 Domain 的缺点

```typescript
// ❌ 不推荐：URL 散落在代码各处
const client = new HttpClient();
await client.get('https://api.example.com/v1/users');
await client.get('https://api.example.com/v1/products');
await client.get('https://api.example.com/v1/orders');
```

**问题**：
- ❌ URL 硬编码，难以维护
- ❌ 环境切换困难（开发/测试/生产）
- ❌ 代码审查困难
- ❌ 修改 baseUrl 需要改多处

### 解决方案：注册 Domain

```typescript
// ✅ 推荐：统一管理
Registry.domain.register('api', {
    baseUrl: 'https://api.example.com/v1',
    preset: 'default',
    pageSize: 20,
    pagesizes: [10, 20, 50],
});

const client = new HttpClient('api');
await client.get('/users');
await client.get('/products');
await client.get('/orders');
```

**优点**：
- ✅ URL 集中管理
- ✅ 环境切换方便
- ✅ 代码清晰易读
- ✅ 修改 baseUrl 只需改一处

## 如何注册 Domain

### 1. 基本注册

```typescript
import { Registry } from '@orbit-js/registry';

Registry.domain.register('api', {
    baseUrl: 'https://api.example.com',
    preset: 'default',
    pageSize: 20,
    pagesizes: [10, 20, 50],
});
```

### 2. 多环境配置

```typescript
// 根据环境变量选择 baseUrl
const baseUrl = process.env.NODE_ENV === 'production'
    ? 'https://api.example.com'
    : 'https://dev-api.example.com';

Registry.domain.register('api', {
    baseUrl,
    preset: 'default',
    pageSize: 20,
    pagesizes: [10, 20, 50],
});
```

### 3. 多个 Domain

```typescript
// 注册多个 API 域
Registry.domain.register('api', {
    baseUrl: 'https://api.example.com',
    preset: 'default',
    pageSize: 20,
    pagesizes: [10, 20, 50],
});

Registry.domain.register('auth', {
    baseUrl: 'https://auth.example.com',
    preset: 'default',
    pageSize: 20,
    pagesizes: [10, 20, 50],
});

Registry.domain.register('cdn', {
    baseUrl: 'https://cdn.example.com',
    preset: 'default',
    pageSize: 20,
    pagesizes: [10, 20, 50],
});
```

### 4. 共享配置

```typescript
// 创建共享配置
const defaultConfig = {
    preset: 'default',
    pageSize: 20,
    pagesizes: [10, 20, 50],
    timeout: 30000,
};

Registry.domain.register('api', {
    ...defaultConfig,
    baseUrl: 'https://api.example.com',
});

Registry.domain.register('auth', {
    ...defaultConfig,
    baseUrl: 'https://auth.example.com',
});
```

## 使用 Domain

### 1. 创建 Client

```typescript
import { HttpClient } from '@orbit-js/http';

// 使用已注册的 domain
const client = new HttpClient('api');

// 发送请求
const result = await client.get('/users').context;
```

### 2. Token 管理

```typescript
// 登录后更新 token
const loginResult = await login(username, password);
Registry.domain.updateToken(loginResult.token, 'api');

// 后续请求自动带上 token
const result = await client.get('/users').context;
```

### 3. 多域共享 Token

```typescript
// 一次更新多个域的 token
Registry.domain.updateToken(token, 'api', 'auth', 'cdn');
```

## 环境切换示例

### 开发环境

```typescript
// config/dev.ts
Registry.domain.register('api', {
    baseUrl: 'http://localhost:3000',
    preset: 'default',
    pageSize: 20,
    pagesizes: [10, 20, 50],
});
```

### 测试环境

```typescript
// config/test.ts
Registry.domain.register('api', {
    baseUrl: 'https://test-api.example.com',
    preset: 'default',
    pageSize: 20,
    pagesizes: [10, 20, 50],
});
```

### 生产环境

```typescript
// config/prod.ts
Registry.domain.register('api', {
    baseUrl: 'https://api.example.com',
    preset: 'default',
    pageSize: 20,
    pagesizes: [10, 20, 50],
});
```

## 最佳实践

### 1. 集中配置

```typescript
// config/domains.ts
import { Registry } from '@orbit-js/registry';

const domains = {
    api: {
        baseUrl: process.env.API_URL!,
        preset: 'default',
        pageSize: 20,
        pagesizes: [10, 20, 50],
    },
    auth: {
        baseUrl: process.env.AUTH_URL!,
        preset: 'default',
        pageSize: 20,
        pagesizes: [10, 20, 50],
    },
};

// 批量注册
Object.entries(domains).forEach(([name, config]) => {
    Registry.domain.register(name, config);
});
```

### 2. 类型安全

```typescript
// types/domains.ts
export type DomainName = 'api' | 'auth' | 'cdn';

// 使用类型约束
const client = new HttpClient('api' as DomainName);
```

### 3. 配置验证

```typescript
// 启动时验证配置
function validateDomainConfig() {
    const requiredDomains = ['api', 'auth'];
    
    requiredDomains.forEach(domain => {
        try {
            const config = Registry.domain.get(domain);
            if (!config) {
                throw new Error(`Domain '${domain}' is not configured`);
            }
            console.log(`✅ Domain '${domain}' configured: ${config.baseUrl}`);
        } catch (error) {
            console.error(`❌ Domain '${domain}' configuration error:`, error);
            process.exit(1);
        }
    });
}

validateDomainConfig();
```

## 迁移指南

### 从硬编码 URL 迁移

**步骤 1**：识别所有 API 域

```typescript
// 找出所有不同的 baseUrl
'https://api.example.com/v1/users'
'https://api.example.com/v1/products'
'https://auth.example.com/login'
'https://cdn.example.com/assets'
```

**步骤 2**：注册 Domain

```typescript
Registry.domain.register('api', {
    baseUrl: 'https://api.example.com/v1',
    preset: 'default',
    pageSize: 20,
    pagesizes: [10, 20, 50],
});

Registry.domain.register('auth', {
    baseUrl: 'https://auth.example.com',
    preset: 'default',
    pageSize: 20,
    pagesizes: [10, 20, 50],
});

Registry.domain.register('cdn', {
    baseUrl: 'https://cdn.example.com',
    preset: 'default',
    pageSize: 20,
    pagesizes: [10, 20, 50],
});
```

**步骤 3**：替换代码

```typescript
// 替换前
await fetch('https://api.example.com/v1/users');

// 替换后
const client = new HttpClient('api');
await client.get('/users').context;
```

## 总结

### ✅ 推荐做法

- 注册所有 API domain
- 集中管理配置
- 使用环境变量
- 类型安全
- 启动时验证

### ❌ 不推荐做法

- 硬编码 URL
- URL 散落在代码各处
- 不使用 domain 注册
- 混用多种方式

### 💡 核心优势

- **可维护性**：URL 集中管理
- **灵活性**：环境切换方便
- **可读性**：代码清晰易懂
- **安全性**：类型约束和验证
