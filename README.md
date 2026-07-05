# QimenJS

> 现代化 TypeScript 基础设施库 — 奇门遁甲，排兵布阵

QimenJS 是一个模块化的 TypeScript 基础设施库，提供事件系统、数据管道、实体管理、国际化、HTTP 客户端等 27 个独立子包，覆盖前端应用的基础层到服务层。

名字取自"奇门遁甲"——古代排兵布阵的术数体系。正如奇门以八门九星组合千变万化的格局，QimenJS 通过能力组合（Ability）和数据管道（Pipeline）构建灵活的前端架构。

## 状态

**0.1.1** — 初始开发阶段，核心 API 已可用，UI 组件层尚未实现。API 可能在后续版本中发生变化。

## 快速开始

```bash
# 安装
pnpm install

# 构建
npm run build

# 运行完整 Demo（前端 + 后端）
cd examples/full-stack
npm start
```

或使用 GitHub Codespaces 一键启动完整演示环境。

## 包列表

### 基础层 (Layer 0)

| 包 | 说明 |
|---|------|
| `@qimen-lab/error` | 统一错误体系，错误码 + 错误链 |
| `@qimen-lab/logger` | 日志系统，多级别 + 多输出 |
| `@qimen-lab/utils` | 通用工具函数 |
| `@qimen-lab/async` | 异步工具（重试、并发控制、超时） |
| `@qimen-lab/runtime` | 运行时环境检测 |
| `@qimen-lab/crypto` | 哈希与编解码（MD5/SHA/XXHash/Base64） |
| `@qimen-lab/i18n` | 国际化，loadScript 动态加载语言包 |
| `@qimen-lab/context` | 请求上下文，贯穿数据处理管道 |

### 核心层 (Layer 1)

| 包 | 说明 |
|---|------|
| `@qimen-lab/registry` | 注册表，领域隔离的注册中心 |
| `@qimen-lab/events` | 事件总线，发布/订阅 |
| `@qimen-lab/cache` | 缓存管理，LRU + TTL |
| `@qimen-lab/pipeline` | 数据管道，可组合的处理链 |
| `@qimen-lab/composable` | 能力组合，定义可复用的能力描述符 |
| `@qimen-lab/task` | 任务调度，队列 + 优先级 |
| `@qimen-lab/schema` | Schema 定义，字段 + 验证规则 |

### 数据层 (Layer 2)

| 包 | 说明 |
|---|------|
| `@qimen-lab/data-processor` | 数据处理器框架，管道式请求/响应处理 |
| `@qimen-lab/validation` | 验证引擎，规则 + 链式验证 |
| `@qimen-lab/event-dom` | DOM 事件适配，手势识别 |
| `@qimen-lab/mime` | MIME 类型解析 |
| `@qimen-lab/pattern` | 设计模式工具（观察者、策略、工厂等） |

### 服务层 (Layer 3)

| 包 | 说明 |
|---|------|
| `@qimen-lab/http` | HTTP 客户端，拦截器 + 重试 + 缓存 |
| `@qimen-lab/oauth2` | OAuth2 认证，授权码/密码/客户端模式 |
| `@qimen-lab/data-processor-abp` | ABP 框架数据处理器，分页/过滤/排序参数转换 |
| `@qimen-lab/data-processor-spring` | Spring Data 数据处理器，Page\<T\> 格式适配 |
| `@qimen-lab/system-abilities` | 系统能力集，搜索/分页/CRUD 能力定义 |

### 应用层 (Layer 4)

| 包 | 说明 |
|---|------|
| `@qimen-lab/entity` | 实体管理框架，Manager + Ability 架构 |
| `@qimen-lab/types` | 公共类型定义 |

## 架构特点

- **分层设计** — 从基础层到应用层，依赖方向单一，不跨层引用
- **能力组合** — 实体管理器通过 AbilityDefinition 动态组合能力，按需装配
- **管道式处理** — 数据请求/响应通过可插拔的处理器管道，ABP/Spring 开箱即用
- **环境适配** — 核心包环境无关，浏览器/Node.js 通用；特定功能包环境专用
- **类型安全** — 完整的 TypeScript 类型定义

## 示例

`examples/full-stack/` 包含完整的全栈演示：

- OAuth2 认证（密码模式 + 授权码模式 + 客户端凭证）
- ABP API 用户管理（分页、搜索、排序）
- Spring Data 订单管理（Page\<T\> 分页）
- 27 个 QimenJS 子包的功能演示页面
- 国际化（i18n 预编译 + 动态语言切换）

## 文档

- [架构说明](./docs/architecture/README.md)
- [包说明](./docs/architecture/packages/)
- [最佳实践](./docs/best-practices/)
- [API 参考](./docs/api/)

## 开发

```bash
# 安装依赖
pnpm install

# 构建
npm run build

# 运行测试
npm run test

# 代码检查
npm run lint

# 生成 API 文档
npm run docs
```

## 版本

当前版本：**0.1.1** — 详见 [VERSION](./VERSION) 文件和 [CHANGELOG](./CHANGELOG.md)。

版本号遵循 [SemVer](https://semver.org/lang/zh-CN/) 规范。`0.x.x` 表示初始开发阶段，API 不保证稳定。

## AI 辅助开发声明

**本项目是 AI 辅助开发的项目，大部分代码由 AI 生成。**

感谢以下 AI 工具的贡献：

- **华为 CodeArts** — 完成了项目的大部分代码，是本项目的主力开发工具
- ChatGPT — 架构设计和代码审查
- DeepSeek — 代码生成和优化
- Gemini — 文档和测试辅助
- 通义千问 — 代码审查和优化建议
- FitEncode — 代码生成辅助

特别感谢 **华为 CodeArts**，本项目的绝大部分代码是在 CodeArts 智能体的辅助下完成的，从架构设计到代码实现，从 Bug 修复到文档编写，CodeArts 都发挥了关键作用。

## License

MIT
