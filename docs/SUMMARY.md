# OrbitJS 文档导航

> 最后更新：2026-07-01

## 项目概览

OrbitJS 是一个 TypeScript 基础设施框架，采用单仓库（monorepo）多包架构，共 21 个包分 5 层。

## 包列表

| 层级 | 包名 | 说明 | 依赖 |
|------|------|------|------|
| L0 | `error` | 错误类型体系 | - |
| L0 | `logger` | 日志系统 | - |
| L0 | `utils` | 工具函数集 | - |
| L0 | `async` | 异步工具（debounce/throttle） | - |
| L0 | `runtime` | 运行时环境检测 | - |
| L0 | `crypto` | 加密工具（md5/sha/base64） | - |
| L0 | `types` | 全局共享类型定义 | - |
| L1 | `registry` | 注册器体系 | error |
| L1 | `cache` | 缓存抽象 | logger, utils |
| L1 | `events` | 事件总线 | logger, utils |
| L1 | `validation` | 校验框架 | registry |
| L1 | `task` | 任务调度 | logger, utils, error, runtime |
| L1 | `context` | 请求上下文 | registry |
| L2 | `schema` | Schema 注册与管理 | registry |
| L2 | `pipeline` | 管道执行器 | logger, context |
| L2 | `composable` | 可组合能力系统 | logger, async |
| L2 | `event-dom` | DOM 事件适配器 | events, utils, runtime, logger, error, async |
| L3 | `data-processor` | 数据处理器 | registry, context, pipeline |
| L3 | `http` | HTTP 客户端 | context, pipeline, registry, task |
| L3 | `system-abilities` | 系统能力集 | events, composable, registry, event-dom |
| L4 | `entity` | 实体管理框架 | composable, schema, context, http, cache, error, system-abilities, data-processor, registry, utils |

## 核心架构

### AbilityDefinition 模式

所有能力（Ability）均为 `AbilityDefinition` 纯对象，通过 `ComposableBase` 的原型链复制机制注入宿主：

```typescript
// 定义能力
const MyAbility: AbilityDefinition = {
    myMethod() { return this.name; },           // 方法：自动 bind 到宿主
    computed: { get() { return `[${this.name}]`; } }, // getter/setter
    constant: 42,                                // 普通值
};

// 使用能力
class MyHost extends ComposableBase {
    static readonly abilities = [MyAbility];
    constructor(public name: string) { super(); }
}
```

### ComposableBase API

| 方法 | 说明 |
|------|------|
| `abilityState(key, creator?)` | 获取/创建能力私有状态（per-host 隔离） |
| `setAbilityState(key, value)` | 设置能力私有状态 |
| `debounce(key, fn, wait?, immediate?)` | 获取/创建防抖函数（per-host 隔离） |
| `onCleanup(callback)` | 注册清理回调（dispose 时逆序执行） |
| `getStatic(key)` / `setStatic(key, value)` | 类级缓存（跨实例共享） |
| `dispose()` | 销毁：执行清理 → 取消防抖 → 清空状态 |

## 文档目录

### 架构文档
- [architecture/README.md](architecture/README.md) - 架构总览与层级结构
- [architecture/packages/](architecture/packages/) - 各包详细文档
- [architecture/principles/](architecture/principles/) - 架构原则

### 构建进度
- [build-progress/README.md](build-progress/README.md) - 构建进度总览
- [build-progress/layer-*/](build-progress/) - 各层包进度详情

### 设计决策
- [design-decisions/](design-decisions/) - 架构决策记录（ADR）

### 最佳实践
- [best-practices/](best-practices/) - 使用最佳实践
- [guides/](guides/) - 使用指南

### 每日总结
- [daily-summaries/](daily-summaries/) - 开发日志

## 已归档概念

以下概念已从代码中移除，仅存在于 git 历史中：

- **kernel** - 旧版核心包，功能已拆分到 context、pipeline、composable、http 等包
- **AbilityBase / DebounceAbilityBase** - 旧版能力基类，已迁移为 AbilityDefinition 纯对象
- **ComposableRegistrar** - 旧版能力注册器，已不再需要
- **AbilityProxy** - 旧版能力代理，已不再需要
