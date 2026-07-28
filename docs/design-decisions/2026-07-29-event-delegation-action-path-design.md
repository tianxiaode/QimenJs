# 事件委托新方案：全委托模式（三层嵌套 tplEvents）

> 日期：2026-07-29
> 状态：设计确认，待实施

## 问题背景

旧方案中事件委托存在以下问题：

1. **emits 写在 TplNode 节点上**，事件定义分散在模板各处，难以全局把握
2. **action 只是事件数据**，不能驱动事件，必须配合 emits 才能工作
3. **COMPONENT_ROOT 阻断委托穿透**，父组件委托无法跨子组件边界
4. **无条件绑定**，tplEvents 声明了就绑定，不管有没有人监听
5. **ItemContainer 模式**靠 `$items` + `keyProp` 特殊处理，与普通节点逻辑不统一

## 新方案核心：全委托模式

**不是层层 on 转发模式，而是全委托模式**——使用方在当前组件的 tplEvents 中声明一切，DOM 事件绑在当前组件 el 上，通过组件路径 + action 直接定位目标，天然跨层穿透。

### tplEvents 三层嵌套结构

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
// 使用方组件 — 在 tplEvents 中声明所有委托
tplEvents = {
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
| **tplEvents 是声明式监听** | 声明即意图，`handler: true` 是本地监听，`emits` 是转发，两者可共存 |
| **按钮不需要定义 tplEvents** | 按钮完全被动，使用方在当前组件定义即可 |
| **action 统一用于路径定位** | 不用 name。action 是语义标识，name 是结构标识 |
| **跨层天然穿透** | `'toolbar.Button'` 直接穿透到目标，不需要层层 on 转发 |

### 组件路径解析

第二层 key 是组件路径，格式为 `[nodeName].[componentName]...`，用 `.` 分隔，沿 nodeMap 逐层定位：

- **第一段必须是 nodeName**（nodeMap 的 key），不是组件类型名
- 这样同名组件不同实例可通过不同 nodeName 区分（如 `mainToolbar.Button` vs `secondaryToolbar.Button`）

```ts
'toolbar.Button'
  → nodeMap 中找 nodeName='toolbar' 的子组件
  → 在该子组件的 nodeMap/items 中找 Button 子组件
  → el.contains(event.target) 判断事件目标是否在该 Button 内
```

> **同名容器同名 action 的处理原则**：当多个同名容器需要转发同名 action 时，
> 不应在上层 tplEvents 中尝试区分，而应让**容器自己声明 tplEvents** 转发事件，
> 上层通过桥接（bridges）或 `on()` 监听来接收。这是全委托模式的职责边界——
> 每层管自己能区分的，区分不了的往下推一层。

### 前缀机制

组件定义时声明节点前缀（`prefix: 'drop'`），事件名 = prefix + eventName（首字母大写）：

| prefix | DOM 事件 | 组合事件名 |
|--------|---------|-----------|
| `''` | click | `click` |
| `''` | keypress | `keypress` |
| `'drop'` | click | `dropClick` |
| `'drop'` | keypress | `dropKeypress` |

前缀解决**同一组件内多节点**的同事件区分（root vs dropIcon）。

### 组件事件能力声明

组件通过 `static actions` 声明对外暴露的事件能力，使用方据此知道能 on 什么：

```ts
class EntityToolbar extends ToolbarComponent {
    static type = 'EntityToolbar';
    static actions = ['create', 'edit', 'delete', 'save', 'refresh', 'search'];
}
```

### eventConfig 配置项

```ts
{
    handler: true,       // DOM 事件委托 → 调用组件本地方法
    emits: ['save'],     // 转发为组件事件
    entities: true,      // 转发为实体操作
    bridges: ['xxx'],    // 转发为桥接事件
    router: 'xxx',       // 转发为路由事件
    system: ['xxx'],     // 转发为系统事件
    once: true,          // 只执行一次
    debounce: 300,       // 防抖
    throttle: 100,       // 节流
}
```

| 配置 | 行为 |
|------|------|
| `handler: true` | DOM 事件委托 → 调用组件本地方法 |
| `emits: ['save']` | 转发为组件事件 |
| 两者都有 | 先执行 handler，再 emits |
| `entities: true` | 转发为实体操作 |

### listens — 声明式事件订阅（五路分流）

`listens` 是声明式事件订阅，**不涉及 DOM 事件**，定义在 tpl-body.ts。

```ts
listens: [
    { handlers: { toolbar: ['save', 'create'], grid: ['rowClick'] } },
    { source: 'formKey',    events: { save: 'onSave' } },
    { entity: 'users',     events: { listed: 'onUsersLoaded' } },
    { system: true,        events: { 'i18n:localeChange': 'onLocaleChange' } },
    { route: 'router',     events: { change: 'onRouteChange' } },
]
```

| 字段 | 机制 | 示例 |
|------|------|------|
| `handlers` | 子组件事件 `child.on()`，仅直接子组件 | `{ handlers: { toolbar: ['save', 'create'] } }` |
| `source` | 桥接事件 EventBridge | `{ source: 'formKey', events: { save: 'onSave' } }` |
| `entity` | 实体事件 EntityEventBus | `{ entity: 'users', events: { listed: 'onUsersLoaded' } }` |
| `system` | 系统事件 | `{ system: true, events: { 'i18n:localeChange': 'onLocaleChange' } }` |
| `route` | 路由事件 | `{ route: 'router', events: { change: 'onRouteChange' } }` |

`handlers` 路说明：
- key = nodeName（nodeMap key，仅直接子组件）
- value = 事件名数组，方法名自动推导 `on${PascalCase(nodeName)}${PascalCase(event)}`
- 例：`toolbar: ['save']` → `nodeMap.toolbar.on('save', this.onToolbarSave)`
- 仅限简单转发，复杂逻辑推荐派生子组件

### 子组件事件监听：派生子组件

复杂场景（需要改行为、加状态、改模板），推荐派生子组件：

```ts
// 派生子组件，实现监听 + 逻辑
class MyToolbar extends EntityToolbarComponent {
    onAfterInit() {
        this.on('save', this.onSave.bind(this));
        this.on('create', this.onCreate.bind(this));
    }
    onSave(ctx) { /* ... */ }
    onCreate(ctx) { /* ... */ }
}

// 模板中使用派生类
tpl: [{ name: 'toolbar', type: MyToolbar }]
```

### 跨层事件通信：桥接 + eventKey 向下传播

跨层监听走桥接（`source` 路），eventKey 从父组件向下传播：

**eventKey 向下传播规则**：父组件有 eventKey 时，实例化子组件时自动传播：

| 子组件情况 | 处理 |
|-----------|------|
| 子组件有定义 eventKey 且 `fixed: true` | 保留子组件的值，不被父覆盖 |
| 子组件有定义 eventKey 且非 fixed | 替换为父组件的 eventKey |
| 子组件无定义 eventKey | 不管 |

eventKey/entityKey 均适用此规则。`fixed` 标志用于组件自身固有通道（如 Dialog、Toast），不应被父组件覆盖。

```ts
// EntityPage — 定义 eventKey
body: {
    eventKey: 'entityPage',
    listens: [
        { source: 'entityPage', events: { save: 'onSave', create: 'onCreate' } },
    ],
}

// Toolbar / Form — 非 fixed，实例化时被替换为 'entityPage'
body: { eventKey: 'toolbarEvents' }
// → 运行时 eventKey = 'entityPage'

// Dialog — fixed，保留自身通道
body: { eventKey: { key: 'dialogEvents', fixed: true } }
// → 运行时 eventKey = 'dialogEvents'，不被父覆盖
```

**同名容器同名 action 的处理原则**：容器自己声明 tplEvents 转发为桥接事件，
上层通过 `source` 路订阅（eventKey 统一），无需在上层 tplEvents 中区分。

## 运行时流程

### Pipeline 阶段

```
MOUNT:     ensureNodeMap → selfMount → setupNodeProps → onInitState → onBeforeInit
FILL:      （预留）
INSTANTIATE: instantiateChildComponents
FINALIZE:  bindNodeEventMeta → bindDelegatedEvents → bindListens → onAfterInit
                                              ↑ 新增步骤 ↑
```


### 委托绑定

```
组件初始化
  → 遍历 tplEvents 的第一层 key（DOM 事件名）
  → 在当前组件 el 上绑定对应 DOM 事件监听（如 click）
  → 一个 DOM 事件只绑定一次（多个路径共享同一个监听器）
```

### 事件触发与匹配

```
DOM 事件触发（如 click）
  → 查 tplEvents[click]
  → 遍历每个组件路径 key（如 'toolbar.Button'）
  → 路径解析：
      'toolbar' → 从 nodeMap 找 nodeName='toolbar' 的子组件
      → toolbar.el.contains(event.target)? 否 → 跳过
      → 是 → 在 Toolbar 的 nodeMap/items 中找 Button
      → Button.el.contains(event.target)? 否 → 跳过
      → 是 → 到达目标组件
  → 遍历第三层 key（action 名）
  → 检查目标组件的 action 是否匹配
  → 匹配 → 执行 eventConfig（handler / emits / entities 等）
```

### handler 方法命名

`handler: true` 时，调用组件的本地方法，命名规则：

```
on${PascalCase(componentPathLastPart)}${PascalCase(action)}${PascalCase(domEvent)}
```

示例：`'toolbar.Button'` + `'save'` + `'click'` → `onButtonSaveClick()`

## 与旧方案的对比

| 维度 | 旧方案 | 新方案 |
|------|--------|--------|
| tplEvents 结构 | 扁平路径式 `'toolbar.save'` | 三层嵌套 `{ domEvent → componentPath → action }` |
| 事件定义位置 | TplNode 节点上 emits | tplEvents 统一声明 |
| action 角色 | 事件数据 | 路径定位 + 事件数据 |
| 绑定方式 | 声明即绑定 | 当前组件 el 上绑定，委托匹配 |
| 跨层 | COMPONENT_ROOT 阻断 | 组件路径直接穿透 |
| ItemContainer | $items + keyProp 特殊处理 | 组件路径 + action 统一 |
| 同组件多节点 | emits 枚举 | prefix 自动组合 |
| 同类型多实例 | 无法区分 | action 区分 |
| 跨层转发 | 层层 on 转发 | 全委托，无需转发 |

## 删除的东西

- ~~TplNode.emits~~ — 事件定义移到 tplEvents
- ~~TplNode.action~~（作为事件驱动器）— action 在 tplEvents 第三层 key 中
- ~~compileNodeEmits~~ — 改为按需编译
- ~~NODE_EVENT_META 遍历匹配~~ — 改为 el.contains + 路径定位
- ~~扁平路径式 tplEvents key~~ — 改为三层嵌套

## 新增的东西

- tplEvents 三层嵌套结构 — `{ [domEvent]: { [componentPath]: { [action]: eventConfig } } }`
- 组件路径解析 — `'toolbar.Button'` → nodeMap 逐层查找（首段为 nodeName）
- `static actions` — 组件事件能力声明
- 当前组件 el 上绑定 DOM 事件 → 委托匹配目标组件
- 前缀匹配 — prefix + eventName 组合事件名
- eventKey/entityKey 向下传播 + `fixed` 标志
- 子组件事件监听：派生子组件实现（推荐）或桥接

## EntityToolbar 示例

```ts
// EntityToolbar 组件 — 声明能力
class EntityToolbar extends ToolbarComponent {
    static type = 'EntityToolbar';
    static actions = ['create', 'edit', 'delete', 'save', 'refresh', 'search',
                      'firstPage', 'prevPage', 'nextPage', 'lastPage'];
}

// 使用方 — 在当前组件 tplEvents 中声明委托
tplEvents = {
    click: {
        'toolbar.Button': {
            'create':  { emits: ['create'] },
            'save':    { emits: ['save'] },
            'refresh': { emits: ['refresh'] },
        },
    },
    change: {
        'toolbar.SearchInput': {
            'search': { emits: ['searchChange'] },
        },
    },
    keypress: {
        'toolbar.Button': {
            'save':   { handler: true, emits: ['save'], entities: true },
            'create': { handler: true, emits: ['create'] },
        },
    },
}

// 监听
toolbar.on('create', (ctx) => { /* 创建 */ });
toolbar.on('save', (ctx) => { /* 保存 */ });
toolbar.on('searchChange', (ctx) => { /* 搜索 */ });
```

无需 `_setupSemanticEvents`，无需 `data.name` 判断，tplEvents 三层嵌套 + 组件路径自动路由。
