# OrbitJS 全栈示例

OAuth2 认证 + ABP API + Spring API + 前端多域数据获取的完整示例。

## 架构

```
┌─────────────────────────────────────────────────┐
│                   前端 (:5173)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ @orbitjs │  │ @orbitjs │  │ @orbitjs │       │
│  │  /oauth2 │  │ /data-   │  │ /data-   │       │
│  │          │  │processor │  │processor │       │
│  │ Token    │  │   -abp   │  │ -spring  │       │
│  │ 管理     │  │          │  │          │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
│       │             │             │              │
│  ┌────┴─────────────┴─────────────┴─────┐       │
│  │         @orbit-js/http                 │       │
│  │   HttpClient + TokenInjector          │       │
│  └────────────────┬──────────────────────┘       │
└───────────────────┼──────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│  auth    │ │   abp    │ │  spring  │
│  server  │ │   api    │ │   api    │
│  :3000   │ │  :3001   │ │  :3002   │
│          │ │          │ │          │
│ /oauth2/ │ │ /api/app/│ │ /api/    │
│  token   │ │  user    │ │  orders  │
│  auth    │ │  product │ │  items   │
│  revoke  │ │          │ │          │
└──────────┘ └──────────┘ └──────────┘
```

## 快速开始

### 1. 安装依赖

```bash
cd examples/full-stack
npm install
```

### 2. 一键启动

```bash
npm start
```

这会同时启动：
- **auth-server** (:3000) — OAuth2 认证服务
- **abp-api** (:3001) — 模拟 ABP 后端
- **spring-api** (:3002) — 模拟 Spring 后端
- **client** (:5173) — 前端应用（自动打开浏览器）

### 3. 单独启动

```bash
# 只启动某个服务
npm run auth      # 认证服务
npm run abp       # ABP API
npm run spring    # Spring API
npm run client    # 前端
```

## 测试账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | 123456 | 管理员 |
| user | 123456 | 普通用户 |
| guest | 123456 | 访客 |

## 功能演示

### 1. 密码模式登录

输入用户名密码，调用 `oauth2.loginWithPassword()`，获取 token 后自动应用到 ABP 和 Spring 两个域。

### 2. 授权码模式

点击"授权码登录"，跳转到 auth-server 的授权页面，用户同意后回调到前端，用 code 换 token。

### 3. 客户端凭证模式

点击"客户端凭证登录"，直接用 clientId/clientSecret 获取 token（无用户上下文）。

### 4. 多域数据获取

登录后仪表盘同时展示：
- **ABP 域**：用户列表（PagedResultDto 格式）、产品列表
- **Spring 域**：订单列表（Page\<T\> 格式）、商品列表

两个域的请求都自动带上 Bearer Token。

### 5. 验证错误测试

点击"创建 ABP 用户（验证错误测试）"，发送空数据触发 ABP 验证错误，展示 `fieldErrors` 字段级错误映射。

### 6. 401 自动刷新

当 token 过期时，HTTP 管道会自动拦截 401 响应，刷新 token 后重试原始请求。

## OrbitJS 包使用

| 包 | 用途 |
|-----|------|
| `@orbit-js/registry` | 域名注册（auth/abp/spring 三个域） |
| `@orbit-js/http` | HTTP 客户端 + TokenInjector |
| `@orbit-js/oauth2` | OAuth2 认证 + 401 自动刷新 |
| `@orbit-js/data-processor-abp` | ABP 数据处理管道 |
| `@orbit-js/data-processor-spring` | Spring 数据处理管道 |

## 停止服务

```bash
npm run stop
```

或按 `Ctrl+C` 停止一键启动的所有服务。
