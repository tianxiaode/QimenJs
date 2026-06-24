# Token 管理方案

## 设计理念

**极简 + 灵活 + 解耦**

- Token 存储在 DomainConfig
- DomainRegistrar 提供批量更新方法
- TokenInjector 根据 authInjector 配置注入
- 应用层完全控制 token 的获取和刷新

## 核心接口

### DomainConfig

```typescript
interface DomainConfig {
    baseUrl: string;
    // ... 其他配置
    
    // Token 存储
    token?: string;
    
    // 认证注入器
    // - 字符串：使用预定义方式（'bearer' | 'basic'）
    // - 函数：自定义注入，传入 RequestContext
    authInjector?: 'bearer' | 'basic' | ((context: RequestContext) => void | Promise<void>);
}
```

### DomainRegistrar

```typescript
class DomainRegistrar {
    /**
     * 更新 token
     * 
     * @param token - Token 字符串
     * @param domains - 域名列表（可变参数）
     */
    updateToken(token: string, ...domains: string[]): void;
    
    /**
     * 清除 token
     * 
     * @param domains - 域名列表（可变参数）
     */
    clearToken(...domains: string[]): void;
}
```

## 使用示例

### 1. Bearer Token（默认）

```typescript
import { Registry } from '@orbitjs/registry';
import { HttpClient } from '@orbitjs/http';

// 配置 domain
Registry.domain.register('api', {
    baseUrl: 'https://api.example.com',
    preset: 'default',
    pageSize: 20,
    pagesizes: [10, 20, 50],
    // authInjector 默认是 'bearer'，可以不写
});

// 登录后更新 token
const loginResult = await login(username, password);
Registry.domain.updateToken(loginResult.token, 'api');

// 发送请求（自动带上 token）
const client = new HttpClient('api');
const result = await client.get('/users').context;
```

### 2. 多域共享 Token

```typescript
// 配置多个 domain
Registry.domain.register('api-a', { baseUrl: '...', authInjector: 'bearer' });
Registry.domain.register('api-b', { baseUrl: '...', authInjector: 'bearer' });
Registry.domain.register('api-c', { baseUrl: '...', authInjector: 'bearer' });

// 一次更新所有域的 token
Registry.domain.updateToken(token, 'api-a', 'api-b', 'api-c');
```

### 3. Basic Auth

```typescript
Registry.domain.register('api', {
    baseUrl: '...',
    authInjector: 'basic',
});

Registry.domain.updateToken('credentials', 'api');
```

### 4. 自定义注入

#### 自定义 Header

```typescript
Registry.domain.register('api', {
    baseUrl: '...',
    authInjector: (context) => {
        const token = context.metadata.domainConfig.token;
        context.request.headers['X-Token'] = token;
    },
});
```

#### 签名方式

```typescript
import { md5 } from '@orbitjs/utils';

Registry.domain.register('api', {
    baseUrl: '...',
    authInjector: (context) => {
        const token = context.metadata.domainConfig.token;
        const timestamp = Date.now();
        const signature = md5(token + timestamp);
        
        context.request.headers['X-Token'] = token;
        context.request.headers['X-Timestamp'] = timestamp.toString();
        context.request.headers['X-Signature'] = signature;
    },
});
```

#### Query 参数

```typescript
Registry.domain.register('api', {
    baseUrl: '...',
    authInjector: (context) => {
        const token = context.metadata.domainConfig.token;
        context.request.queryParams = context.request.queryParams || {};
        context.request.queryParams['access_token'] = token;
    },
});
```

#### 完全自定义

```typescript
Registry.domain.register('api', {
    baseUrl: '...',
    authInjector: async (context) => {
        const token = context.metadata.domainConfig.token;
        
        // 可以做任何事
        // - 修改 headers
        // - 修改 queryParams
        // - 修改 body
        // - 调用其他服务
        // - 等等
        
        context.request.headers['Authorization'] = `Bearer ${token}`;
        context.request.headers['X-Request-Id'] = generateUUID();
    },
});
```

### 5. OAuth2 完整流程

```typescript
import { Registry } from '@orbitjs/registry';
import { HttpClient } from '@orbitjs/http';

// 配置 domain
Registry.domain.register('api', {
    baseUrl: 'https://api.example.com',
    preset: 'default',
    pageSize: 20,
    pagesizes: [10, 20, 50],
});

// 登录
async function login(username: string, password: string, rememberMe: boolean) {
    const client = new HttpClient('auth');
    
    const result = await client.post('/auth/login', {
        username,
        password,
        rememberMe,
    }).context;
    
    if (result.error) {
        throw result.error;
    }
    
    const { accessToken, refreshToken, expiresIn } = result.response.data;
    
    // 保存 refresh token
    if (rememberMe) {
        localStorage.setItem('refresh_token', refreshToken);
    } else {
        sessionStorage.setItem('refresh_token', refreshToken);
    }
    
    // 更新 token
    Registry.domain.updateToken(accessToken, 'api');
}

// 刷新 token
async function refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
    
    const response = await fetch('/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        }),
    });
    
    const data = await response.json();
    
    // 更新 refresh token
    localStorage.setItem('refresh_token', data.refresh_token);
    
    // 更新 access token
    Registry.domain.updateToken(data.access_token, 'api');
}

// 检查并刷新（应用层决定何时刷新）
async function ensureValidToken() {
    // 这里可以根据你的策略判断是否需要刷新
    // 例如：检查 localStorage 中的过期时间
    const expires = localStorage.getItem('token_expires');
    
    if (expires && Date.now() >= parseInt(expires) - 60000) {
        await refreshToken();
    }
}
```

## TokenInjector 处理器

```typescript
// src/http/actions/prepare/TokenInjector.ts
export const TokenInjectorHandler = async (context: RequestContext): Promise<void> => {
    const domainConfig = context.metadata.domainConfig;
    
    if (!domainConfig?.token) {
        return;
    }
    
    const token = domainConfig.token;
    const injector = domainConfig.authInjector || 'bearer';
    
    if (typeof injector === 'function') {
        await injector(context);
        return;
    }
    
    switch (injector) {
        case 'bearer':
            context.request.headers['Authorization'] = `Bearer ${token}`;
            break;
            
        case 'basic':
            context.request.headers['Authorization'] = `Basic ${token}`;
            break;
    }
};
```

## 注册 TokenInjector

```typescript
import { HttpActionRegistrar, HttpActionCategory } from '@orbitjs/http';
import { TokenInjectorHandler } from '@orbitjs/http/actions/prepare';

const registrar = HttpActionRegistrar.getInstance();

registrar.register({
    name: 'TokenInjector',
    category: HttpActionCategory.PREPARE,
    offset: 5, // 在 CommonParamsEnricher 之前
    handler: TokenInjectorHandler,
    description: 'Token 注入处理器',
});
```

## 优势

1. **极简**
   - DomainConfig 只有 2 个字段：token, authInjector
   - 不需要额外的接口和注册器

2. **灵活**
   - 字符串：使用预定义方式
   - 函数：完全自定义

3. **支持多域**
   - updateToken 支持可变参数
   - 一次更新多个域

4. **完全解耦**
   - Token 的获取和刷新由应用层控制
   - 框架只负责存储和注入

5. **完全控制**
   - 自定义函数可以访问 RequestContext
   - 可以修改 headers、queryParams、body 等
