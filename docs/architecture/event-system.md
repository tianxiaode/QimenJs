# 事件系统

> QimenJS 事件系统采用**分层总线 + scopeId 隔离**架构，提供 7 种专用事件总线，支持组件间通信、实体事件、DOM 事件委托、系统级事件等场景。

## 概述

事件系统是 QimenJS 的**通信中枢**，核心设计原则：

- **隔离性**：每个 EventScope 拥有唯一 scopeId，事件只在同 scope 内传播
- **分层专用**：不同领域使用不同总线，避免事件名冲突
- **统一接口**：所有总线共享 `on`/`emit`/`once`/`off` 接口
- **自动清理**：组件 dispose 时通过 `onCleanup` 自动解绑所有订阅

## 全局事件总线架构

```
GlobalEventBus (单例, rootScope 永不销毁)
  ├── EntityEventBus     → entityScope   → 编码: entity:{entityKey}:{eventName}
  ├── ComponentEventBus  → componentScope → 编码: component:{sourceId}:{eventName}
  ├── DragEventBus       → dragScope     → 编码: drag:{dragKey}:{action}
  ├── FileEventBus       → fileScope     → 编码: file:{fileKey}:{action}
  ├── RouteEventBus      → routeScope    → 编码: route:{routeKey}:{eventName}
  ├── OverlayEventBus    → overlayScope  → 编码: overlay:{overlayKey}:{action}
  └── SystemEventBus     → systemScope   → 直接事件名 (i18n:*, window:*, permission:*, app:*)
```

### 核心存储结构

EventBus 内部为**三级 Map**：

```
Map<scopeId, Map<event, Set<handler>>>
```

`emit` 时只触发同一 scopeId 下的 handler，不广播到其他 scope。

### 各总线特点

| 总线 | 编码规则 | 特殊行为 |
|------|---------|---------|
| **EntityEventBus** | `entity:{entityKey}:{eventName}` | `connect`/`disconnect` 为广播事件（不带 entityKey），其他按 entityKey 隔离 |
| **ComponentEventBus** | `component:{sourceId}:{eventName}` | sourceId 即 eventKey，组件间通信通道 |
| **DragEventBus** | `drag:{dragKey}:{action}` | 维护全局 `activeDrag` 状态，同一时刻只允许一个活跃拖拽；`move` 不走总线 |
| **FileEventBus** | `file:{fileKey}:{action}` | "直接 API + 反馈总线"非对称模式：命令直接调 FileDispatchCenter，反馈走总线 |
| **RouteEventBus** | `route:{routeKey}:{eventName}` | 路径转事件名：`/users/list` → `change:users:list` |
| **OverlayEventBus** | `overlay:{overlayKey}:{action}` | 事件数据携带 component 实例和 anchor 元素 |
| **SystemEventBus** | 直接事件名 | **懒桥接**：i18n/window 事件有订阅时才注册回调，拒绝外部 emit i18n/window 前缀事件 |

### EventSourceRegistrar

独立的单例注册器，**校验 eventKey 的全局唯一性**。组件声明 eventKey 时必须注册，重复注册（不同组件使用同一 eventKey）会抛错，从源头防止事件名冲突。

## EventScope 生命周期

```typescript
// 创建
const scope = globalEventBus.createEventScope();  // 生成唯一 scopeId

// 使用
scope.on('click', handler);   // 注册到 EventBus 的 scopedListeners[scopeId]['click']
scope.emit('click', data);    // 自动补回 ctx.scopeId，委托 bus.emit()

// 销毁
scope.dispose();  // 遍历 disposers 数组，依次执行所有 off 函数
```

**引用计数**：`EventBus.emit` 时设置 `ctx._refCount = handlers.size`，每个 handler 执行后递减，为后续 `cleanupContext`（一级深度 nullify）提供归零检测。

## 组件事件机制

### domEvents — DOM 事件委托

**三层嵌套结构**：

```typescript
domEvents = {
  [domEvent]: {           // 第一层：DOM 事件名 (click, input, etc.)
    [componentPath]: {    // 第二层：组件路径 (root, closeBtn, header.action)
      [action]: config    // 第三层：action → DomEventConfig
    }
  }
}
```

**三种语法**：

```typescript
// 1. 三层模式（显式 action）
{ click: { closeBtn: { submit: { handler: true } } } }

// 2. 两层模式（action 为空，wildcardAction=true）
{ click: { closeBtn: { handler: true } } }

// 3. 隐式 root 简写
{ input: { handler: '_onInput' } }
```

**事件分发流程**：

```
DOM 事件触发
  → handleDelegatedEvent(eventType, domEvent)
  → 遍历 rules，匹配 event 类型
  → _matchPath：沿 componentPath 在 nodeMap 中逐段定位目标组件
  → _matchAction：匹配组件的 action 属性
  → _dispatchRule：先调 handler，再走 EventForwarder 转发
```

**handler 默认命名规则**：

```
on${PascalCase(componentPath)}${PascalCase(action)}${PascalCase(domEvent)}
```

示例：
- `closeBtn` + `submit` + `click` → `onCloseBtnSubmitClick`
- `root` + `''` + `input` → `onRootInput`
- `header.action` + `click` → `onHeaderActionClick`

支持 `handler: 'customMethodName'` 覆盖默认推导。

### listens — 统一事件订阅

**六种监听源**：

| 类型 | 判断字段 | 绑定目标 | 绑定方法 |
|------|---------|---------|---------|
| `NodeListen` | `node` | 子组件实例 | `child.on/off` |
| `ComponentListen` | `source` | ComponentEventBus | `bus.componentOn` |
| `EntityListen` | `entity` | EntityEventBus | `bus.entityOn` |
| `SystemListen` | `system` | SystemEventBus | `bus.on` |
| `RouteListen` | `route` | RouteEventBus | `bus.routeOn` |
| `FileListen` | `file` | FileEventBus | `bus.fileOn` |

**Pipeline 分两阶段**：
- FINALIZE 早期：source/entity/system/route/file（不依赖子组件实例）
- FINALIZE 晚期：node 类型（依赖 nodeMap 已实例化）

**handler 默认命名规则**：

```
on${PascalCase(nodeName)}${PascalCase(eventName)}
```

示例：`toolbar` + `click` → `onToolbarClick`

### childEvents — 子组件事件

在父组件上声明子组件的事件处理器，编译时自动转换为 `listens` 中的 `NodeListen`。

## 事件数据收集与传递

### EventForwarder 六路转发

```
事件触发
  → collectEventData()  → { ...defaultEventData, ...getCustomEventData(), ...extraData }
  → buildContext()      → 自动维护事件链 chain
  → 六路转发：
      1. componentEmit  → ComponentEventBus
      2. entityEmit     → EntityEventBus
      3. overlayEmit    → OverlayEventBus
      4. dragEmit       → DragEventBus
      5. systemEmit     → SystemEventBus
      6. routeEmit      → RouteEventBus
```

### 数据合并顺序

```
data = { ...defaultEventData, ...getCustomEventData(), ...extraData }
```

- `defaultEventData`：getter 属性，子类通过 super 天然合并
- `getCustomEventData()`：运行时方法，动态收集
- `extraData`：事件触发时的即时数据

### DomEventsEngine 数据收集

- 自动附加 `{ action: actualAction }`
- `rule.data` 指定字段列表，从 instance 上收集：
  - `get` 开头的方法 → 调用方法，合并返回值
  - 其他字段 → 直接取 instance 属性值

### 动态过滤

组件可实现 `getForwardFilter(domEvent)` 返回允许的路由键数组，实现运行时转发控制。

## ComponentEntityDispatch 调度中心

封装实体操作的完整生命周期：loading → success/error。

```
dispatch(instance, entityKey, action, data)
  ├── 1. 查找 ACTION_PAIRS[action] → { success, error, loading } 事件名
  ├── 2. 订阅 loading 事件 → onEntityLoading(entityKey, true)
  ├── 3. 订阅 success 事件 → cleanup() + onEntityLoading(false) + onEntityActionSuccess()
  ├── 4. 订阅 error 事件   → cleanup() + onEntityLoading(false) + onEntityError()
  └── 5. 发射 action 事件 → entityEmit({ event: action, source: entityKey, data })
```

**关键设计**：success/error 触发后自动 cleanup（取消所有三个订阅），避免内存泄漏。

### ACTION_PAIRS 映射表

| action | success | error | loading |
|--------|---------|-------|---------|
| connect | connected | connect:error | connect:loading |
| list | listed | list:error | list:loading |
| get | got | get:error | get:loading |
| create | created | create:error | create:loading |
| update | updated | update:error | update:loading |
| delete | deleted | delete:error | delete:loading |
| searchBy | searched | search:error | search:loading |
| prev | prevDone | prev:error | prev:loading |
| next | nextDone | next:error | next:loading |
| expand | expanded | expand:error | expand:loading |
| collapse | collapsed | collapse:error | collapse:loading |

**命名规则**：success 用过去式，error 用 `:error` 后缀，loading 用 `:loading` 后缀。

## 参见

- [组件事件最佳实践](../best-practices/component-events-best-practices.md)
- [实体事件最佳实践](../best-practices/entity-event-best-practices.md)
- [ComposableBase 能力模式](./composable-ability-pattern.md)