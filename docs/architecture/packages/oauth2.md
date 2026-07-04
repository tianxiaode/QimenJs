# @orbit-js/oauth2

OAuth2 认证流程包，提供完整的 Token 生命周期管理。

## 设计理念

OAuth2 只做三件事：**获取 Token**、**刷新 Token**、**401 自动重试**。不管 UI 怎么做、路由怎么跳。

这意味着：
- 不内置登录页面，UI 由应用层实现
- 不内置路由守卫，路由拦截由应用层实现
- 不绑定任何框架，通过事件通知 Vue/React 响应认证状态变化
- 401 自动刷新通过 HTTP 管道扩展实现，不修改 HTTP 默认管道

## 核心决策

### 为什么 401 处理不在 HTTP 默认管道中？

HTTP 默认管道的 8 个 Action 是通用的，适用于所有项目。401 自动刷新是 OAuth2 特有的业务逻辑：
- 不用 OAuth2 的项目不应该有任何 401 拦截逻辑
- 401 刷新需要知道 refresh_token、tokenEndpoint 等 OAuth2 配置
- 刷新请求自身不能触发 401 拦截（需要标记跳过）

因此采用**方案 A**：TokenRefreshHandler 由 `@orbit-js/oauth2` 自行注册到 HttpActionRegistrar，引入包即生效，不引入则零影响。

这与 `@orbit-js/pattern` 引入即自动注册验证模式、`@orbit-js/data-processor-abp` 引入即自动注册 ABP 处理器的模式完全一致。

## 快速开始

### 1. 配置 OAuth2

```typescript
import { oauth2 } from '@orbit-js/oauth2';
import { Registry } from '@orbit-js/registry';

// 配置 API 域名
Registry.domain.register('api', {
    baseUrl: 'https://api.example.com',
    preset: 'default',
    pageSize: 20,
    pagesizes: [10, 20, 50],
});

// 配置 OAuth2
oauth2.configure({
    tokenEndpoint: 'https://auth.example.com/oauth2/token',
    revokeEndpoint: 'https://auth.example.com/oauth2/revoke',
    clientId: 'my-app',
    clientSecret: 'secret',           // 公共客户端可省略
    redirectUri: 'https://app.example.com/callback',
    scopes: ['openid', 'profile'],
    domain: 'api',                    // 关联的域名（updateToken 目标）
});
```

### 2. 密码模式登录

```typescript
import { oauth2 } from '@orbit-js/oauth2';

const result = await oauth2.loginWithPassword({
    username: 'admin',
    password: '123456',
});

if (result.success) {
    console.log('登录成功', result.accessToken);
} else {
    console.log('登录失败', result.error);
}
```

### 3. 授权码模式

```typescript
import { oauth2 } from '@orbit-js/oauth2';

// 跳转到授权页面
oauth2.authorize();  // window.location.href = authorizationUrl

// 在回调页面用 code 换 token
const code = new URLSearchParams(location.search).get('code');
const result = await oauth2.loginWithCode(code);
```

### 4. 客户端凭证模式

```typescript
import { oauth2 } from '@orbit-js/oauth2';

const result = await oauth2.loginWithClientCredentials();
```

### 5. 401 自动刷新

引入 `@orbit-js/oauth2` 后自动生效，无需额外配置：

```typescript
// 请求发出 → 401 → 自动刷新 token → 重试原始请求
const client = new HttpClient('api');
const result = await client.get('/users').context;
// 如果 token 过期，会自动刷新并重试，调用方无感知
```

### 6. 登出

```typescript
await oauth2.logout();
```

## API

### OAuth2Manager

| 方法 | 说明 |
|------|------|
| `configure(config)` | 配置 OAuth2 参数 |
| `loginWithPassword(credentials)` | 密码模式登录 |
| `loginWithCode(code)` | 授权码换 token |
| `loginWithClientCredentials()` | 客户端凭证模式 |
| `refreshToken()` | 刷新 token（防并发去重） |
| `revokeToken()` | 撤销 token |
| `getToken()` | 获取当前有效 token |
| `isAuthenticated()` | 是否已认证 |
| `logout()` | 登出（清除 token + 撤销） |

### 事件

| 事件名 | 数据 | 说明 |
|--------|------|------|
| `oauth2:token-acquired` | `{ accessToken, refreshToken?, expiresIn? }` | 获取到新 token |
| `oauth2:token-refreshed` | `{ accessToken, refreshToken?, expiresIn? }` | token 刷新成功 |
| `oauth2:token-expired` | `{ domain }` | token 过期（401 触发） |
| `oauth2:refresh-failed` | `{ error }` | 刷新失败，需要重新登录 |

### TokenRefreshHandler（HTTP 管道扩展）

| 属性 | 值 |
|------|-----|
| 阶段 | ALIGN（对齐阶段） |
| offset | 20（在 DownloadInterceptor 之后） |
| shouldExecute | `status === 401 && 有 token && 非刷新请求自身` |
| handle | 刷新 token → updateToken → 重新执行原始请求管道 |

## 类型

```typescript
interface OAuth2Config {
    /** Token 端点 */
    tokenEndpoint: string;
    /** 撤销端点（可选） */
    revokeEndpoint?: string;
    /** 客户端 ID */
    clientId: string;
    /** 客户端密钥（机密客户端） */
    clientSecret?: string;
    /** 重定向 URI（授权码模式） */
    redirectUri?: string;
    /** 授权端点（授权码模式） */
    authorizationEndpoint?: string;
    /** 作用域 */
    scopes?: string[];
    /** 关联的域名（updateToken 目标，支持多个） */
    domain: string | string[];
    /** Token 存储方式 */
    storage?: 'memory' | 'localStorage' | 'sessionStorage';
    /** Token 提前刷新时间（毫秒，默认 60000 = 1 分钟） */
    refreshBuffer?: number;
}

interface TokenResponse {
    access_token: string;
    token_type: string;
    expires_in?: number;
    refresh_token?: string;
    scope?: string;
}

interface PasswordCredentials {
    username: string;
    password: string;
    scope?: string;
}

type GrantType = 'authorization_code' | 'password' | 'client_credentials' | 'refresh_token';
```

## 文件结构

```
src/oauth2/
  ├── types.ts              OAuth2Config, TokenResponse, GrantType 等
  ├── OAuth2Manager.ts      核心管理器（获取/刷新/撤销 token）
  ├── TokenStorage.ts       Token 持久化（memory/localStorage/sessionStorage）
  ├── TokenRefreshHandler.ts HTTP 管道扩展（401 拦截 + 自动刷新 + 重试）
  ├── register.ts           自动注册 TokenRefreshHandler
  └── index.ts              导出 + 自动注册
```

## 依赖关系

```
@orbit-js/oauth2 (L3)
  ├── @orbit-js/http        HTTP 管道扩展（TokenRefreshHandler）
  ├── @orbit-js/registry    DomainRegistrar.updateToken()
  ├── @orbit-js/events      事件通知（token 过期/刷新）
  └── @orbit-js/cache       Token 存储（TTL 过期检查）
```

## 并发刷新去重

多个请求同时 401 时，只发一次刷新请求：

```typescript
// OAuth2Manager 内部
private refreshPromise: Promise<boolean> | null = null;

async refreshToken(): Promise<boolean> {
    // 如果已经在刷新中，复用同一个 Promise
    if (this.refreshPromise) {
        return this.refreshPromise;
    }

    this.refreshPromise = this.doRefresh();
    try {
        return await this.refreshPromise;
    } finally {
        this.refreshPromise = null;
    }
}
```

## 刷新请求自身不触发 401 拦截

TokenRefreshHandler 的 shouldExecute 检查 `context.metadata.isTokenRefresh`：

```typescript
shouldExecute(context: RequestContext): boolean {
    return context.response.status === 401
        && !!context.metadata.domainConfig?.token
        && !context.metadata.isTokenRefresh;  // 刷新请求自身跳过
}
```

刷新请求在构建 RequestContext 时标记 `metadata.isTokenRefresh = true`，避免递归触发。

## 与现有 Token 管理方案的关系

OAuth2 包是对现有极简 Token 管理方案的**上层封装**，不是替代：

| 层级 | 职责 | 包 |
|------|------|-----|
| 底层 | Token 存储 + 注入 | `@orbit-js/registry` (DomainConfig.token) + `@orbit-js/http` (TokenInjector) |
| 上层 | Token 获取 + 刷新 + 401 重试 | `@orbit-js/oauth2` (OAuth2Manager + TokenRefreshHandler) |

不用 OAuth2 的项目仍然可以直接用 `DomainRegistrar.updateToken()` + `TokenInjector`，完全不受影响。
