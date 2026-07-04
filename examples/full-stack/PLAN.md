# QimenJS 示例改造实施计划

## 目标

1. 将示例改为管理模板样式（侧边栏 + 顶栏 + 仪表盘布局）
2. 内联 mock 后端（Vite 插件拦截请求，去掉 Express 依赖，支持 GitHub Pages 部署）
3. 示例尽量覆盖目前所有功能
4. 尽量展示现有模块的功能

---

## 当前状态

### 已有文件（上一轮已创建）

| 文件 | 状态 | 说明 |
|------|------|------|
| `client/src/styles/theme.ts` | 已创建 | Linear Aesthetic 暗色主题 CSS |
| `client/src/layout/index.ts` | 已创建 | 侧边栏 + 顶栏 + 内容区布局组件 |
| `client/src/main.ts` | 已创建 | 路由入口（动态 import 各页面） |
| `client/src/pages/login.ts` | 已创建 | 登录页（3 种 OAuth2 模式） |
| `client/src/pages/dashboard.ts` | 已创建 | 仪表盘（统计卡片 + Manager 类型对照表 + 模块一览） |
| `client/src/pages/abp-users.ts` | 已创建 | ABP 用户列表（RemoteCrudEntityManager） |
| `client/src/pages/abp-products.ts` | 已创建 | ABP 产品列表（RemoteCrudEntityManager） |
| `client/src/pages/spring-orders.ts` | 已创建 | Spring 订单列表（分页导航） |
| `client/src/pages/spring-items.ts` | 已创建 | Spring 商品列表（RemoteReadonlyEntityManager） |
| `client/src/pages/departments.ts` | 已创建 | 部门树（RemoteTreeEntityManager） |
| `client/src/pages/notifications.ts` | 已创建 | 本地通知（LocalReadonlyEntityManager） |
| `client/src/pages/tags.ts` | 已创建 | 本地标签（LocalCrudEntityManager） |
| `client/src/pages/validation.ts` | 已创建 | 表单验证展示 |
| `client/src/pages/i18n.ts` | 已创建 | 国际化展示 |
| `client/src/pages/cache.ts` | 已创建 | 缓存系统展示 |
| `client/src/pages/crypto.ts` | 已创建 | 加密工具展示 |
| `client/src/pages/runtime.ts` | 已创建 | 运行时检测展示 |
| `client/src/pages/callback.ts` | 已创建 | OAuth2 回调页 |

### 需要修复的问题

1. **Manager 类型声明**：当前 Manager 类只 `extends` 基类，能力方法（list/get/create 等）通过运行时 Ability 注入，TypeScript 类型层面不可见。需要用 `export interface` 拼接能力接口，让 Manager 类获得完整类型提示。
2. **index.html**：仍使用旧的内联样式，需更新为暗色主题。
3. **config.ts**：baseUrl 指向 localhost，内联 mock 后需改为相对路径。
4. **login.ts**：登录成功后的页面切换逻辑不完整（onPageChange 回调为空）。

---

## 步骤 1：改示例为管理模板样式

### 1.1 为 Manager 类添加 `export interface` 能力类型拼接

**原则**：不能用 `implements`（会报"类未实现接口方法"错误），只能用 `export interface` extends 拼接。

**方案**：在 `managers/` 目录下为每种 Manager 类型创建组合接口，然后让 Manager 类通过声明合并（declaration merging）获得完整类型。

```typescript
// managers/abp.ts

// 1. 用 export interface 拼接能力接口
export interface AbpUserManager
    extends IFlatRemoteListAbility<any>,
        IFlatRemoteGetAllAbility<any>,
        IRemoteGetAbility<any>,
        IFlatRemoteQueryAbility,
        IFlatRemoteStateAbility<any>,
        IRemoteCreateAbility<any>,
        IRemoteUpdateAbility<any>,
        IRemoteDeleteAbility,
        IRemoteToggleAbility<any>,
        ISchemaAbility,
        IStateCacheAbility,
        IStateDirtyAbility<any>,
        IStateSearchAbility<any, any> {}

// 2. 类声明（运行时通过 Ability 注入实现）
export class AbpUserManager extends RemoteCrudEntityManager {
    domain = 'abp';
    entityName = 'User';
    url = '/api/app/user';
    schema = UserSchema;
}
```

**需要修改的文件**：

| 文件 | 添加的接口 |
|------|-----------|
| `managers/abp.ts` | `AbpUserManager` 接口（Remote CRUD 全能力）、`AbpProductManager` 接口 |
| `managers/spring.ts` | `SpringOrderManager` 接口（Remote CRUD）、`SpringItemManager` 接口（Remote Readonly） |
| `managers/local.ts` | `LocalNotificationManager` 接口（Local Readonly）、`LocalTagManager` 接口（Local CRUD） |
| `managers/tree.ts` | `DepartmentManager` 接口（Tree 全能力） |

**需要导入的能力接口**（来自 `@qimenjs/entity` 的 types 导出）：

- `IFlatRemoteListAbility`, `IFlatRemoteGetAllAbility`, `IRemoteGetAbility`
- `IFlatRemoteQueryAbility`, `IFlatRemoteStateAbility`
- `IRemoteCreateAbility`, `IRemoteUpdateAbility`, `IRemoteDeleteAbility`, `IRemoteToggleAbility`
- `ILocalListAbility`, `ILocalGetAbility`
- `IFlatLocalMutationAbility`, `IFlatLocalDeleteAbility`, `IFlatLocalStateAbility`
- `ITreeManagerAbility`, `ITreeRemoteStateAbility`
- `ISchemaAbility`, `IStateCacheAbility`, `IStateDirtyAbility`, `IStateSearchAbility`

### 1.2 更新 index.html

- 移除旧的内联样式
- 添加 Inter 字体 CDN
- 设置暗色背景

### 1.3 修复 login.ts 页面切换逻辑

- 登录成功后正确调用 `showApp()` 逻辑
- 统一使用 main.ts 中的 `showApp` 函数

### 1.4 更新 config.ts

- baseUrl 改为相对路径（为内联 mock 做准备）
- 添加注释说明 mock 模式下的配置

---

## 步骤 2：内联 mock 后端（Vite 插件）

### 2.1 创建 Vite mock 插件

**文件**：`client/vite-plugins/mock-server.ts`

**原理**：使用 Vite 的 `configureServer` 钩子，在开发模式下拦截 HTTP 请求，返回 mock 数据。构建时（GitHub Pages）使用 Service Worker 或直接内联数据。

**需要 mock 的 API**：

| 域 | 端点 | 格式 |
|----|------|------|
| auth | `POST /oauth2/token` | OAuth2 Token 响应 |
| auth | `POST /oauth2/revoke` | 空成功响应 |
| auth | `GET /oauth2/authorize` | 授权码重定向 |
| abp | `GET /api/app/user` | `{ totalCount, items }` |
| abp | `GET /api/app/product` | `{ totalCount, items }` |
| abp | `GET /api/departments` | `{ totalCount, items }` |
| spring | `GET /api/orders` | Spring Page<T> 格式 |
| spring | `GET /api/items` | Spring Page<T> 格式 |

### 2.2 创建 mock 数据文件

**文件**：`client/src/mock/data.ts`

将现有 Express 服务器中的数据（users, products, orders, items, departments）提取为 TypeScript 常量。

### 2.3 创建 mock 响应处理器

**文件**：`client/src/mock/handlers.ts`

实现各 API 端点的请求解析和响应生成逻辑，包括：
- ABP PagedResultDto 格式（skipCount + maxResultCount → { totalCount, items }）
- Spring Page<T> 格式（page + size → { content, totalElements, ... }）
- OAuth2 Token 端点（password/authorization_code/client_credentials/refresh_token）
- 简单的 JWT 模拟（使用 btoa/atob 代替 jsonwebtoken）

### 2.4 更新 vite.config.ts

- 引入 mock 插件
- 添加 `base` 配置用于 GitHub Pages 部署

### 2.5 更新 package.json

- 移除 express/cors/jsonwebtoken 依赖
- 添加 `build` 和 `preview` 脚本

---

## 步骤 3：补充功能展示页面

### 3.1 已有页面（需检查和修复）

| 页面 | 模块 | 展示内容 |
|------|------|---------|
| validation.ts | @qimenjs/validation | 字符串/数字/密码验证 + 批量验证 |
| i18n.ts | @qimenjs/i18n | 中/英/日三语切换 + 插值变量 |
| cache.ts | @qimenjs/cache | Memory/LocalStorage/SessionStorage 缓存操作 |
| crypto.ts | @qimenjs/crypto | Hash/Base64/AES 加解密 |
| runtime.ts | @qimenjs/runtime | 浏览器环境检测 + 特性支持 + 性能指标 |

### 3.2 需要新增的展示页面

| 页面 | 模块 | 展示内容 |
|------|------|---------|
| schema.ts | @qimenjs/schema | Schema 注册/查询/字段定义展示 |
| events.ts | @qimenjs/events | 事件总线 on/once/emit/off 演示 |
| pipeline.ts | @qimenjs/pipeline | 管道处理链（中间件模式）演示 |
| task.ts | @qimenjs/task | 任务调度/取消/超时演示 |
| logger.ts | @qimenjs/logger | 日志级别/格式化输出演示 |

### 3.3 更新 layout/index.ts 导航

- 在"功能展示"分组中添加新页面导航项

### 3.4 更新 main.ts 路由

- 添加新页面的动态 import 路由

---

## 步骤 4：创建 GitHub Actions workflow

### 4.1 创建 workflow 文件

**文件**：`.github/workflows/deploy-examples.yml`

**流程**：
1. 触发条件：push to main / 手动触发
2. 安装依赖 + 构建 QimenJS 源码
3. 构建示例（vite build）
4. 部署到 GitHub Pages

### 4.2 配置 Vite 构建输出

- `base` 路径设置为 `/qimenjs/`（或仓库名）
- 输出目录 `dist`
- mock 数据内联到构建产物中

---

## 实施顺序

1. **步骤 1**（管理模板样式）— 视觉基础，所有页面依赖
2. **步骤 2**（内联 mock）— 去掉 Express 依赖，支持独立运行
3. **步骤 3**（功能展示页面）— 丰富内容
4. **步骤 4**（GitHub Actions）— 自动部署

每个步骤完成后进行验证，确保 `vite build` 和 `vite dev` 均可正常运行。
