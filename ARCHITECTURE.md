# OrbitJS 架构说明

## 项目概述

OrbitJS 是一个纯 TypeScript 基础设施库，采用 monorepo 架构，单一 package.json + 多入口模式。所有 22 个包通过 `exports` 字段暴露，每个入口提供 ESM、CJS 和类型声明三种格式。

**核心原则**：
- 严格分层，低层不依赖高层
- 零循环依赖
- 每个包职责单一、可独立使用

## 包层级与依赖关系

### 第 0 层：核心基础包（8 个，零依赖）

| 包名 | 说明 |
|------|------|
| `@orbitjs/error` | 错误处理基类与错误码 |
| `@orbitjs/logger` | 日志系统 |
| `@orbitjs/utils` | 工具函数（array, string, object, date, cookie 等） |
| `@orbitjs/async` | 异步工具（debounce, throttle） |
| `@orbitjs/runtime` | 运行时环境检测（locale, platform, features 等） |
| `@orbitjs/crypto` | 加密工具（md5, sha, xxhash, base64） |
| `@orbitjs/types` | 跨包共享基础类型（RequestContext, ExecutionStep） |
| `@orbitjs/i18n` | 国际化（语言检测、翻译、动态加载语言包） |

### 第 1 层：基础设施工具包（6 个）

| 包名 | 依赖 | 说明 |
|------|------|------|
| `@orbitjs/registry` | error | 注册器系统（RegistryHub + 多种 Registrar） |
| `@orbitjs/cache` | logger, utils | 缓存系统（CacheFactory + MemoryProvider） |
| `@orbitjs/events` | logger, utils | 事件系统（EventBus + EventScope） |
| `@orbitjs/task` | logger, utils, error, runtime | 任务系统 |
| `@orbitjs/composable` | logger, async | 可组合能力系统（ComposableBase + AbilityDefinition） |
| `@orbitjs/context` | registry | 请求上下文（RequestContextBuilder） |

### 第 2 层：功能工具包（5 个）

| 包名 | 依赖 | 说明 |
|------|------|------|
| `@orbitjs/schema` | registry | Schema 定义与注册 |
| `@orbitjs/validation` | registry | 验证系统（ValidatorRegistrar + 引擎） |
| `@orbitjs/pipeline` | logger, context | 管道执行器 |
| `@orbitjs/event-dom` | events, utils, runtime, logger, error, async | DOM 事件适配器（手势：Tap, Swipe, Drag, LongPress） |
| `@orbitjs/i18n` | 无 | 国际化（归入第 0 层，此处不重复） |

### 第 3 层：高级功能包（3 个）

| 包名 | 依赖 | 说明 |
|------|------|------|
| `@orbitjs/data-processor` | registry, context, pipeline | 数据处理器（注册 + 管道执行） |
| `@orbitjs/http` | context, pipeline, registry, task | HTTP 客户端（HttpClient + StreamClient） |
| `@orbitjs/system-abilities` | events, composable, registry, event-dom | 系统能力集（Domain, Event, System, DomEvents） |

### 第 4 层：业务包（1 个）

| 包名 | 依赖 | 说明 |
|------|------|------|
| `@orbitjs/entity` | composable, schema, context, http, cache, error, system-abilities, data-processor, registry, utils | 实体管理框架（Manager + State + 25 个 Ability） |

## 依赖关系图

```
entity (L4)
  ├─ composable (L1)
  ├─ schema (L2)
  ├─ context (L1)
  ├─ http (L3)
  ├─ cache (L1)
  ├─ error (L0)
  ├─ system-abilities (L3)
  ├─ data-processor (L3)
  ├─ registry (L1)
  └─ utils (L0)

system-abilities (L3)
  ├─ events (L1)
  ├─ composable (L1)
  ├─ registry (L1)
  └─ event-dom (L2)

http (L3)
  ├─ context (L1)
  ├─ pipeline (L2)
  ├─ registry (L1)
  └─ task (L1)

data-processor (L3)
  ├─ registry (L1)
  ├─ context (L1)
  └─ pipeline (L2)

event-dom (L2)
  ├─ events (L1)
  ├─ utils (L0)
  ├─ runtime (L0)
  ├─ logger (L0)
  ├─ error (L0)
  └─ async (L0)

pipeline (L2)
  ├─ logger (L0)
  └─ context (L1)

validation (L2)
  └─ registry (L1)

schema (L2)
  └─ registry (L1)

context (L1)
  └─ registry (L1)

composable (L1)
  ├─ logger (L0)
  └─ async (L0)

task (L1)
  ├─ logger (L0)
  ├─ utils (L0)
  ├─ error (L0)
  └─ runtime (L0)

events (L1)
  ├─ logger (L0)
  └─ utils (L0)

cache (L1)
  ├─ logger (L0)
  └─ utils (L0)

registry (L1)
  └─ error (L0)

i18n (L0)
  └─ (无依赖)
```

## 核心架构模式

### ComposableBase + AbilityDefinition

OrbitJS 的能力组合系统采用纯对象模式：

```typescript
// 能力定义为普通对象
const CounterAbility: AbilityDefinition = {
  count: {
    get() { return this.abilityState('CounterAbility:count', () => 0); },
  },
  increment() {
    const current = this.abilityState('CounterAbility:count', () => 0)!;
    this.setAbilityState('CounterAbility:count', current + 1);
  },
};

// 宿主声明所需能力
class MyHost extends ComposableBase {
  static readonly abilities = [CounterAbility];
}
```

核心机制：
- **AbilityDefinition** 是普通对象，不是类
- **ComposableBase.setupAbilities()** 将能力属性通过 `Object.defineProperty` 复制到宿主
- **abilityState()** 管理能力私有状态，per-host 隔离
- **debounce()** 基于能力状态的防抖管理
- **onCleanup()** 注册清理回调，dispose 时自动执行

### RegistryHub + Registrar

注册器系统提供统一的注册与查找：

```typescript
const hub = new RegistryHub();
hub.use(new ValidatorRegistrar());  // 注册验证器
hub.use(new SchemaRegistrar());     // 注册 Schema
hub.use(new DataProcessorRegistrar()); // 注册数据处理器
```

### EventBus + EventScope

事件系统支持作用域隔离：

```typescript
const bus = new EventBus();
const scope = bus.createEventScope();  // 独立作用域
scope.on('change', handler);
scope.emit('change', data);
scope.dispose();  // 自动解绑所有事件
```

### Pipeline

管道执行器支持中间件模式：

```typescript
const result = await pipeline(context)
  .use(prepareStep)
  .use(exchangeStep)
  .use(processStep)
  .execute();
```

## 构建系统

- 构建脚本：`scripts/build.js`
- 构建配置：`scripts/build-config.json`
- 输出格式：ESM + CJS + 类型声明 + SourceMap
- 编译器：TypeScript (tsc)

```bash
# 构建所有包
npm run build

# 构建单个包
node scripts/build.js --package i18n
```

## 统计信息

| 指标 | 数值 |
|------|------|
| 总包数 | 22 |
| 零依赖包 | 8 |
| 测试套件 | 204 |
| 测试用例 | 2263 |
