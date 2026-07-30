# 事件体系设计：domEvents / childEvents / listens

> 日期：2026-07-29
> 状态：已实施

## 问题背景

旧方案中事件委托存在以下问题：

1. **emits 写在 TplNode 节点上**，事件定义分散在模板各处，难以全局把握
2. **action 只是事件数据**，不能驱动事件，必须配合 emits 才能工作
3. **COMPONENT_ROOT 阻断委托穿透**，父组件委托无法跨子组件边界
4. **无条件绑定**，tplEvents 声明了就绑定，不管有没有人监听
5. **ItemContainer 模式**靠 `$items` + `keyProp` 特殊处理，与普通节点逻辑不统一

## 事件体系三部分

| 部分 | 名称 | 机制 | 声明位置 | 说明 |
|------|------|------|---------|------|
| ① | `domEvents` | DOM 事件委托与转发 | 组件类 | DOM 事件 → 委托匹配 → handler/emits/entities |
| ② | `childEvents` | nodeMap 子组件事件订阅 | listens 内 | child.on() 订阅子组件事件 |
| ③ | `listens` | 外部事件监听 | listens | bridge/entity/system/route |

---

## ① domEvents — DOM 委托事件与转发

**全委托模式**——使用方在当前组件的 domEvents 中声明一切，DOM 事件绑在当前组件 el 上，通过组件路径 + action 直接定位目标，天然跨层穿透。

### 三层嵌套结构

```ts
{ [domEvent]: { [componentPath]: { [action]: eventConfig } } }
```

| 层级 | key 含义 | 示例 |
|------|---------|------|
| 第一层 | DOM 事件名 | `click` / `keypress` / `change` |
| 第二层 | 组件路径（`[nodeName].[componentName]...`，沿 nodeMap 逐层定位） | `'toolbar.Button'` |
| 第三层 | action 名（区分同类型多实例） | `'save'` / `'create'` |

### 完整示例

```ts
domEvents = {
    keypress: {
        'toolbar.Button': {
            'save':   { handler: true, emits: ['save'], entities: true },
            'create': { handler: true, emits: ['create'] },
        },
    },
    click: {
        'toolbar.Button': {
            'save':   { emits: ['save'] },
            'create': { emits: ['create'] },
        },
    },
}
```

### 关键规则

| 规则 | 说明 |
|------|------|
| **domEvents 是声明式监听** | 声明即意图，`handler: true` 是本地监听，`emits` 是转发，两者可共存 |
| **按钮不需要定义 domEvents** | 按钮完全被动，使用方在当前组件定义即可 |
| **action 统一用于路径定位** | 不用 name。action 是语义标识，name 是结构标识 |
| **跨层天然穿透** | `'toolbar.Button'` 直接穿透到目标，不需要层层 on 转发 |

### 组件路径解析

第二层 key 格式为 `[nodeName].[componentName]...`，首段必须是 **nodeName**（nodeMap 的 key），不是组件类型名。同名组件不同实例通过不同 nodeName 区分。

```ts
'toolbar.Button'
  → nodeMap 中找 nodeName='toolbar' 的子组件
  → 在该子组件的 nodeMap/items 中找 Button 子组件
  → el.contains(event.target) 判断事件目标是否在该 Button 内
```

### 前缀机制

组件定义时声明节点前缀（`prefix: 'drop'`），事件名 = prefix + eventName（首字母大写）：

| prefix | DOM 事件 | 组合事件名 |
|--------|---------|-----------|
| `''` | click | `click` |
| `'drop'` | click | `dropClick` |

### 组件事件能力声明

```ts
class EntityToolbar extends ToolbarComponent {
    static type = 'EntityToolbar';
    static actions = ['create', 'edit', 'delete', 'save', 'refresh', 'search'];
}
```

### eventConfig 配置项

| 配置 | 行为 |
|------|------|
| `handler: true` | DOM 事件委托 → 调用组件本地方法 |
| `emits: ['save']` | 转发为组件事件 |
| 两者都有 | 先执行 handler，再 emits |
| `entities: true` | 转发为实体操作 |
| `bridges: ['xxx']` | 转发为桥接事件 |
| `router: 'xxx'` | 转发为路由事件 |
| `system: ['xxx']` | 转发为系统事件 |
| `once / debounce / throttle` | 执行控制 |

---

## ② childEvents — nodeMap 子组件事件订阅

### 简单场景：listens childEvents

`listens` 的 `childEvents` 字段，直接订阅 nodeMap 子组件事件，方法名自动推导：

```ts
listens: [
    { childEvents: { toolbar: ['save', 'create'], grid: ['rowClick'] } },
]
// → nodeMap.toolbar.on('save', this.onToolbarSave)
// → nodeMap.toolbar.on('create', this.onToolbarCreate)
// → nodeMap.grid.on('rowClick', this.onGridRowClick)
```

- key = nodeName（仅直接子组件，FINALIZE 时已实例化）
- value = 事件名数组，方法名推导 `on${PascalCase(nodeName)}${PascalCase(event)}`
- 跨层不适用（子组件可能未实例化），跨层走桥接

### childEvents 详细配置

除简写 `string[]` 外，`childEvents` 支持详细配置，可声明转发：

```ts
listens: [
    { childEvents: {
        toolbar: {
            save:    { handler: true, emits: ['save'] },
            create:  { emits: ['create'] },
            delete:  { entities: 'remove' },
        },
    } },
]
```

| 配置 | 行为 |
|------|------|
| `handler: true` | 本地监听（方法名自动推导 `on${NodeName}${Event}`） |
| `emits: ['save']` | 转发为组件事件 |
| `bridges: ['xxx']` | 转发为桥接事件 |
| `entities: 'xxx'` | 转发为实体操作 |
| `router: 'xxx'` | 转发为路由事件 |
| `system: ['xxx']` | 转发为系统事件 |
| `once: true` | 只执行一次 |

转发统一走 `EventForwarder.forward()`，EventContext 结构与 DomEventsEngine 一致。

### 复杂场景：派生子组件

需要改行为、加状态、改模板时，派生子组件：

```ts
class MyToolbar extends EntityToolbarComponent {
    onAfterInit() {
        this.on('save', this.onSave.bind(this));
        this.on('create', this.onCreate.bind(this));
    }
    onSave(ctx) { /* ... */ }
    onCreate(ctx) { /* ... */ }
}

tpl: [{ name: 'toolbar', type: MyToolbar }]
```

---

## ③ listens — 外部事件监听（四路分流）

```ts
listens: [
    { source: 'entityPage', events: { save: 'onSave' } },
    { entity: 'users',     events: { listed: 'onUsersLoaded' } },
    { system: true,        events: { 'i18n:localeChange': 'onLocaleChange' } },
    { route: 'router',     events: { change: 'onRouteChange' } },
]
```

| 字段 | 机制 | 示例 |
|------|------|------|
| `source` | 桥接事件 EventBridge | `{ source: 'entityPage', events: { save: 'onSave' } }` |
| `entity` | 实体事件 EntityEventBus | `{ entity: 'users', events: { listed: 'onUsersLoaded' } }` |
| `system` | 系统事件 | `{ system: true,1 events: { 'i18n:localeChange': 'onLocaleChange' } }` |
| `route` | 路由事件 | `{ route: 'router', events: { change: 'onRouteChange' } }` |

### bridgeKey 向下传播

跨层事件通信走桥接，bridgeKey 从父组件向下传播：

| 子组件情况 | 处理 |
|-----------|------|
| 子组件有定义 bridgeKey 且 `fixed: true` | 保留子组件的值，不被父覆盖 |
| 子组件有定义 bridgeKey 且非 fixed | 替换为父组件的 bridgeKey |
| 子组件无定义 bridgeKey | 不管 |

bridgeKey/entityKey 均适用此规则。`fixed` 标志用于组件自身固有通道（如 Dialog、Toast）。

```ts
// EntityPage
bridgeKey: 'entityPage',
listens: [{ source: 'entityPage', events: { save: 'onSave' } }]

// Toolbar — 非 fixed，被替换为 'entityPage'
bridgeKey: 'toolbarEvents'  // → 运行时 = 'entityPage'

// Dialog — fixed，保留自身通道
bridgeKey: { key: 'dialogEvents', fixed: true }  // → 运行时 = 'dialogEvents'
```

### 同名容器同名 action 原则

容器自己声明 domEvents 转发为桥接事件，上层通过 `source` 路订阅（bridgeKey 统一），无需在上层 domEvents 中区分。每层管自己能区分的，区分不了的往下推一层。

---

## 运行时流程

### 三引擎 + Pipeline 阶段

```
MOUNT:     ensureNodeMap → selfMount → setupNodeProps → onInitState → onBeforeInit
FILL:      （预留）
INSTANTIATE: instantiateChildComponents
FINALIZE:  bindListens → bindChildEvents → bindDomEvents → onAfterInit
           ListensEngine  ChildEventsEngine  DomEventsEngine
```

| 引擎 | Pipeline 步骤 | 时机 | 依赖 | 职责 |
|------|-------------|------|------|------|
| `ListensEngine` | bindListens | FINALIZE 最先 | bridgeKey/entityKey（static） | 订阅桥接/实体/系统/路由事件 |
| `ChildEventsEngine` | bindChildEvents | bindListens 之后 | nodeMap 子组件已实例化 | child.on() 订阅子组件事件 |
| `DomEventsEngine` | bindDomEvents | bindChildEvents 之后 | el + nodeMap + 子组件 | DOM 事件委托绑定与分发 |

执行顺序理由：
- **ListensEngine 最先**：bridge/entity/system/route 不依赖子组件实例，越早订阅越早能收到事件
- **ChildEventsEngine 其次**：子组件已实例化（INSTANTIATE 阶段完成），可安全 child.on()
- **DomEventsEngine 最后**：DOM 委托需要所有前置条件就绪

### DomEventsEngine — 委托绑定

```
组件初始化
  → 遍历 domEvents 的第一层 key（DOM 事件名）
  → 在当前组件 el 上绑定对应 DOM 事件监听（如 click）
  → 一个 DOM 事件只绑定一次（多个路径共享同一个监听器）
```

### 事件触发与匹配

```
DOM 事件触发（如 click）
  → 查 domEvents[click]
  → 遍历每个组件路径 key（如 'toolbar.Button'）
  → 路径解析：
      'toolbar' → 从 nodeMap 找 nodeName='toolbar' 的子组件
      → toolbar.el+el.contains(event.target)? 否 → 跳过
      → 是 → 在 Toolbar 的 nodeMap/items 中找 Button
      → Button.el.contains(event.target)? 否 → 跳过
      → 是 → 到达目标组件
  → 遍历第三层 key（action 名）
  → 检查目标组件的 action 是否匹配
  → 匹配 → 执行 eventConfig（handler / emits / entities 等）
```

### handler 方法命名

`handler: true` 时：`on${PascalCase(componentPathLastPart)}${PascalCase(action)}${PascalCase(domEvent)}`

示例：`'toolbar.Button'` + `'save'` + `'click'` → `onButtonSaveClick()`

## 与旧方案的对比

| 维度 | 旧方案 | 新方案 |
|------|--------|--------|
| DOM 事件声明 | tplEvents 扁平路径式 | domEvents 三层嵌套 `{ domEvent → componentPath → action }` |
| 事件定义位置 | TplNode 节点上 emits | domEvents 统一声明 |
| action 角色 | 事件数据 | 路径定位 + 事件数据 |
| 绑定方式 | 声明即绑定 | 当前组件 el 上绑定，委托匹配 |
| 跨层 | COMPONENT_ROOT 阻断 | 组件路径直接穿透 |
| 跨层转发 | 层层 on 转发 | 全委托 / 桥接 |
| 子组件事件 | 无声明式机制 | childEvents 声明式订阅 |
| eventKey | 静态，无传播 | bridgeKey 向下传播 + fixed |

## 删除的东西

- ~~TplNode.emits~~ — 事件定义移到 domEvents
- ~~TplNode.action~~（作为事件驱动器）— action 在 domEvents 第三层 key 中
- ~~compileNodeEmits~~ — 改为按需编译
- ~~NODE_EVENT_META 遍历匹配~~ — 改为 el.contains + 路径定位
- ~~tplEvents~~ — 改为 domEvents
- ~~eventKey~~ — 改为 bridgeKey

## 新增的东西

- domEvents 三层嵌套结构 — `{ [domEvent]: { [componentPath]: { [action]: eventConfig } } }`
- 组件路径解析 — `'toolbar.Button'` → nodeMap 逐层查找（首段为 nodeName）
- `static actions` — 组件事件能力声明
- 当前组件 el 上绑定 DOM 事件 → 委托匹配目标组件
- 前缀匹配 — prefix + eventName 组合事件名
- bridgeKey/entityKey 向下传播 + `fixed` 标志
- childEvents — nodeMap 子组件事件订阅，方法名自动推导
- 三引擎拆分：DomEventsEngine / ChildEventsEngine / ListensEngine，各在 FINALIZE 不同步骤执行
- ~~DelegatedEventEngine~~ — 拆分为三引擎

## EntityToolbar 示例

```ts
// EntityToolbar 组件 — 声明能力
class EntityToolbar extends ToolbarComponent {
    static type = 'EntityToolbar';
    static actions = ['create', 'edit', 'delete', 'save', 'refresh', 'search',
                      'firstPage', 'prevPage', 'nextPage', 'lastPage'];
}

// ① DOM 委托事件
domEvents = {
    click: {
        'toolbar.Button': {
            'create':  { emits: ['create'] },
            'save':    { emits: ['save'] },
            'refresh': { emits: ['refresh'] },
        },
    },
    keypress: {
        'toolbar.Button': {
            'save':   { handler: true, emits: ['save'], entities: true },
            'create': { handler: true, emits: ['create'] },
        },
    },
}

// ② 子组件事件
listens: [
    { childEvents: { toolbar: ['save', 'create'] } },
]

// ③ 跨层桥接
bridgeKey: 'entityPage',
listens: [
    { source: 'entityPage', events: { save: 'onSave', create: 'onCreate' } },
]
```

无需 `_setupSemanticEvents`，无需 `data.name` 判断，三部分各司其职。

---

## 公共架构

### EventForwarder — 转发公共逻辑

三引擎的五路转发（emits/bridges/entities/router/system）统一由 `EventForwarder` 处理。

#### 路由表模式

五路各自封装为 `{ key, canExecute, execute }` 条目，注册在 `FORWARD_ROUTES` 数组中。
`forward()` 退化为纯调度循环，遍历路由表，两层过滤后执行：

```
for (const route of FORWARD_ROUTES) {
    if (!route.canExecute(ctx)) continue;       // 静态守卫
    if (allowed && !allowed.includes(route.key)) continue;  // 动态守卫
    route.execute(ctx);                          // 纯执行，零分支
}
```

- `canExecute` — 静态守卫：config 有配 + instance 有 key（如 `!!config.emits?.length`、`!!config.router && hasCustomData`）
- `execute` — 纯执行，内部无 if 分支，canExecute 已保证前置条件
- **扩展**：加路 = `FORWARD_ROUTES` push 一条，调度器不改

#### getForwardFilter — 动态路由过滤

组件可选实现 `getForwardFilter(domEvent?)` 方法，返回允许的 `ForwardRouteKey[]`（如 `['emit', 'router']`）。
不实现则全路放行（向后兼容）。用于运行时按状态决定发哪些路：

```ts
class MyComponent extends Component {
    getForwardFilter() {
        return this.disabled ? [] : ['emit', 'router'];
    }
}
```

#### API

- `EventForwarder.forward(instance, config, extraData?, domEvent?, actualAction?)` — 执行转发调度
- `EventForwarder.buildContext(...)` — 构建 EventContext（含 chain/sourceType）
- `EventForwarder.resolveKey(key)` — 解析 `string | { key, fixed? }` 格式
- `EventForwarder.collectEventData(instance, extraData?, precomputedCustomData?)` — 收集事件数据

### 事件数据收集

组件通过两层机制提供事件数据：

```ts
class FormComponent extends Component {
    // 类继承链 — getter + super 合并
    get defaultEventData() {
        return { ...super.defaultEventData, formId: this.formId };
    }

    // body 中定义 — 编译时挂原型
    getCustomEventData() {
        return { currentStep: this.step };
    }
}
```

转发时合并：`data = { ...defaultEventData, ...getCustomEventData(), ...extraData }`

### onCleanup 自动解绑

三个引擎不再维护 `_xxxOffs` 数组和 `unbindXxx` 方法。每个订阅注册时调用 `instance.onCleanup(offFn)`，dispose 时 ComposableBase 自动 LIFO 执行所有清理回调。

### 删除的东西（补充）

- ~~DelegatedEventEngine~~ — 拆分为三引擎 + EventForwarder
- ~~step-bind-delegated-events~~ — 替换为 step-bind-dom-events
- ~~step-bind-node-event-meta~~ — 替换为 step-bind-child-events + step-bind-listens
- ~~unbindXxx 方法~~ — 改为 onCleanup 自动解绑
- ~~_xxxOffs 数组~~ — 不再需要
