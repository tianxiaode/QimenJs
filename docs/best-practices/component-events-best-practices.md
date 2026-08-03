# 组件事件最佳实践

## 事件架构核心原理

QimenJs 的事件系统基于 **scopeId 隔离**：每个 EventScope 有唯一的 scopeId，`emit` 只触发同一 scopeId 下的 handler，不广播到其他 scope。

### 事件体系三部分

| 体系 | 声明位置 | 方向 | 作用 | 配置方式 |
|------|---------|------|------|---------|
| ① domEvents | Component 类属性 | 发布端 | DOM 事件委托与转发 | `domEvents: DomEventsMap` |
| ② node 事件 | body.listens 数组 | 订阅端 | 子组件事件订阅（扁平化） | `listens: [{ node: 'xxx', events: {...} }]` |
| ③ 外部事件 | body.listens 数组 | 订阅端 | 跨组件/实体/系统事件订阅 | `listens: [{ source/entity/system/route/file }]` |

**核心规则**：
- **domEvents 是发布端**：在组件 root el 上绑定 DOM 事件，通过转发配置（emits/bridges/entities 等）将事件分发出去
- **listens 是订阅端**：在 body 中声明，运行时绑定到对应的事件总线
- **统一转发**：所有 listens 类型都支持 `handler` 本地处理 + `EventForwarder` 六路转发，handler 处理后自动走转发，无需手写代码
- 一出进，不应混谈

### scopeId 隔离规则

```
EventBus 内部数据结构：Map<scopeId, Map<event, Set<handler>>>

emit(event, data, source, scopeId) → 只查找 scopeId 对应的 handler
on(event, handler, scopeId)        → handler 注册到 scopeId 下
```

- **组件 A** `this.emit('click')` → 只触发组件 A scope 下的 `click` handler
- **组件 B** `this.on('click', handler)` → handler 注册在组件 B scope 下
- **ComponentEventBus** `componentEmit(ctx)` → 按 `component:sourceId:eventName` 路由
- **EntityEventBus** `entityEmit(ctx)` → 按 `entity:entityKey:eventName` 路由

### 事件转发六路

`EventForwarder` 提供统一的六路转发调度，`domEvents` 和所有 `listens` 类型的事件配置都走这套机制：

| 转发类型 | 运行时方法 | 目标总线 |
|---------|-----------|---------|
| `emits` | `this.emit(name)` | 组件自己的 EventScope |
| `bridges` | `this.componentEmit(ctx)` | ComponentEventBus |
| `entities` | `this.entityEmit(ctx)` | EntityEventBus |
| `router` | `this.routerEmit(ctx)` | RouteEventBus |
| `system` | `this.systemEmit(ctx)` | SystemEventBus |
| `file` | `this.fileEmit(ctx)` | FileEventBus |

---

## 一、domEvents — DOM 事件委托与转发

`domEvents` 是组件模板级的 DOM 事件发布机制。在组件 root el 上绑定 DOM 事件，事件触发时通过路径匹配定位目标子组件，然后按 eventConfig 配置的转发类型执行。

### 三层嵌套结构

```typescript
domEvents = {
    [domEvent]: {                    // 第一层：DOM 事件名
        [componentPath]: {           // 第二层：组件路径（nodeName 或 类型）
            [action]: eventConfig    // 第三层：action 区分同类型多实例
        }
    }
}
```

**方法名推导**（基于 componentPath 首段 nodeName）：
- 无 action：`on{NodeName}{Event}` → `onCloseBtnClick`
- 有 action：`on{NodeName}{Action}{Event}` → `onToolbarSaveClick`

### 三种语法

**1. 隐式 root 简写**（最常用）：

```typescript
domEvents = {
    input: { handler: '_onInput' },          // → root 委托
    click: { emits: ['close'] },              // → root 委托
};
```

**2. 两层模式**（`[action]` 占位符自动匹配）：

```typescript
domEvents = {
    click: {
        'Button': {                           // 路径 = 'Button'
            handler: '_onButtonClick',
            entities: '[action]',              // action 替换 [action]
        },
    },
};
```

**3. 三层模式**（显式 action）：

```typescript
domEvents = {
    click: {
        'toolbar.Button': {                   // 路径 = 'toolbar.Button'
            save:   { handler: true, emits: ['save'] },
            delete: { emits: ['delete'] },
        },
    },
};
```

### eventConfig 配置项

```typescript
interface DomEventConfig {
    // 本地监听
    handler?: boolean | string;       // true 自动推导方法名，string 自定义方法名
    once?: boolean;                    // 只执行一次
    debounce?: number;                 // 防抖时间(ms)
    throttle?: number;                 // 节流时间(ms)
    data?: string[];                   // 事件数据声明

    // 六路转发（可共存）
    emits?: string[];                 // 转发为组件事件
    bridges?: string[];               // 转发到 ComponentEventBus
    entities?: string;                // 转发为实体操作
    router?: string;                  // 转发为路由事件
    system?: string[];                // 转发为系统事件
    file?: string;                    // 转发为文件命令
}
```

### 运行时流程

```
DOM 事件触发
  → DomEventsEngine 查 domEvents[click]
  → 取 componentPath 首段 → nodeMap[nodeName] 定位目标组件
  → el.contains(event.target) 匹配
  → 检查 action 匹配
  → 执行 eventConfig:
      - handler: 调用组件方法
      - emits/bridges/entities/router/system/file: EventForwarder 六路转发
```

### 实际示例

**EntityToolbarComponent — 委托 Button 点击**：

```typescript
domEvents = {
    click: {
        Button: {
            handler: '_onButtonClick',
            entities: '[action]',  // action 作为实体事件名
        },
    },
};
```

```typescript
_onButtonClick(domEvt: any): void {
    const item = self.getTargetItem?.(domEvt?.target);
    const action = item.component?.action;

    if (PAGINATION_ITEM_NAMES.has(action)) {
        self.emit(PAGINATION_EVENTS.CHANGE, { action, page: self._currentPage });
    } else if (CRUD_ITEM_NAMES.has(action)) {
        self.emit(CRUD_EVENTS.ACTION, { action });
    }
}
```

---

## 二、listens — 统一事件订阅

`listens` 是 body 中的统一事件订阅数组，声明组件需要从各种事件总线接收事件。运行时在 Pipeline FINALIZE 阶段绑定。

### 统一 EventMapping

所有 listens 类型共用 `EventMapping`，支持本地监听 + 六路转发：

```typescript
type EventMapping =
    | string                                          // 纯本地监听，handler 方法名
    | true                                            // 纯本地监听，方法名自动推导（仅 node）
    | {
          handler?: string | true;                    // 本地处理方法
          once?: boolean;                             // 只执行一次
          emits?: string[];                          // 转发为组件事件
          bridges?: string[];                        // 转发到 ComponentEventBus
          entities?: string;                          // 转发为实体操作
          file?: string;                              // 转发为文件命令
          router?: string;                            // 转发为路由事件
          system?: string[];                          // 转发为系统事件
      };
```

**三种用法**：

```typescript
events: {
    save: 'onSave',                                    // 纯本地
    close: true,                                       // 纯本地，方法名自动推导（仅 node）
    submit: { handler: 'onSubmit', once: true },       // 本地 + 选项
    deleted: { bridges: ['removed'] },                 // 纯转发
    updated: { handler: 'onUpdated', emits: ['ok'] },  // 本地 + 转发
}
```

### 八种监听类型

```typescript
type ListenItem =
    | NodeListen         // 子组件事件（nodeMap 子组件订阅）
    | ComponentListen    // 组件间事件（ComponentEventBus）
    | EntityListen       // 实体事件（EntityEventBus）
    | FloatListen        // 浮动层事件
    | DragListen         // 拖拽事件
    | SystemListen       // 系统事件
    | RouteListen        // 路由事件
    | FileListen;        // 文件事件
```

### 各类型配置示例

**1. node — 子组件事件订阅**：

```typescript
listens: [
    // 简写：方法名自动推导（onToolbarSave）
    { node: 'toolbar', events: { save: true, create: true } },

    // 带转发：handler 处理 + EventForwarder 六路转发
    { node: 'toolbar', events: {
        save:   { handler: 'onToolbarSave', emits: ['saved'] },
        create: { emits: ['created'] },
        delete: { entities: 'remove' },
    }},
]
```

**2. source — ComponentEventBus 组件间事件**（支持转发）：

```typescript
listens: [
    // 纯订阅
    { source: 'formKey', events: { save: 'onSave', cancel: 'onCancel' } },

    // 订阅 + 转发：收到 save 后转发到 ComponentEventBus
    { source: 'formKey', events: {
        save: { handler: 'onSave', bridges: ['confirmed'] },
    }},
]
```

运行时：
- `ComponentEventBus.componentOn('formKey', 'save', onSave)` — 按 `component:formKey:save` 路由
- handler 处理后自动 `EventForwarder.forward(instance, { bridges: ['confirmed'] }, data)`

**3. entity — EntityEventBus 实体事件**（支持转发）：

```typescript
listens: [
    { entity: true, events: {
        listed: 'onUsersListed',
        created: { handler: 'onUserCreated', emits: ['refreshed'] },
    }},
]
```

**4. system — SystemEventBus 系统事件**（支持转发）：

```typescript
listens: [
    { system: true, events: {
        'i18n:localeChange': { handler: 'onLocaleChange', emits: ['updated'] },
    }},
]
```

**5. route — RouteEventBus 路由事件**（支持转发）：

```typescript
listens: [
    { route: 'router', events: { change: 'onRouteChange' } },
]
```

**6. float — FloatEventBus 浮动层事件**：

```typescript
listens: [
    { float: 'dropBtn', events: { close: 'onClose', open: 'onOpen' } },
]
```

**7. drag — DragEventBus 拖拽事件**：

```typescript
listens: [
    { drag: 'handle', events: { start: 'onDragStart', end: 'onDragEnd' } },
]
```

**8. file — FileEventBus 文件事件**：

```typescript
listens: [
    { file: 'avatars', events: { uploaded: 'onFileUploaded' } },
]
```

### 转发数据传递

handler 处理后，`EventForwarder.collectEventData()` 自动合并三路数据：

```
forwardedData = { ...defaultEventData, ...getCustomEventData(), ...receivedData }
```

| 数据 | 来源 | 说明 |
|------|------|------|
| `defaultEventData` | getter | 组件默认事件数据 |
| `getCustomEventData()` | 方法 | 运行时收集的自定义数据 |
| `receivedData` | 事件参数 | 事件触发时传入的原始数据 |

`receivedData` 优先级最高，会覆盖前两者的同名字段。

### 实际示例

**EntityToolbarComponent — 监听实体事件**：

```typescript
listens = [
    {
        entity: true,
        events: {
            'list:loading': '_onListLoading',
            'list:success': '_onListSuccess',
            listed: '_onListed',
        },
    },
];
```

**Table 组件 — 接收桥接事件 + 转发**：

```typescript
listens: [
    // 接收 toolbar 的 crudaction，处理后再转发到 ComponentEventBus
    { source: 'userToolbar', events: {
        crudaction: { handler: 'onCrudAction', bridges: ['actionHandled'] },
    }},

    // 监听实体事件，刷新后 emit 组件事件
    { entity: true, events: {
        listed: { handler: 'onUsersListed', emits: ['dataRefreshed'] },
    }},
];
```

---

## 三、ComponentEventBus — 组件间事件总线

`ComponentEventBus` 是跨组件解耦通信的单例事件总线。发送方通过 `componentEmit` 发射事件，接收方通过 `listens: [{ source: ... }]` 订阅。

### 核心 API

```typescript
// 发送方（在组件方法中）
const ctx = EventContextBuilder.create()
    .withEvent('crudaction')
    .withType('crudaction')
    .withSource('toolbarId')
    .withSourceType('ToolbarComponent')
    .withData({ action: 'create' })
    .build();

this.componentEmit(ctx);  // → 内部编码为 component:toolbarId:crudaction

// 接收方（在 listens 中声明）
listens: [
    { source: 'toolbarId', events: { crudaction: 'onCrudAction' } },
]
```

### 事件编码规则

```
内部事件名 = component:{sourceId}:{eventName}

sourceId = this.eventKey  // 组件的 eventKey 属性
eventName = 事件名         // 如 crudaction, pagechange
```

### 与 entityKey 对比

| 维度 | ComponentEventBus | EntityEventBus |
|------|-------------------|----------------|
| 发送方标识 | `eventKey` | `entityKey` |
| 接收方订阅 | `{ source: 'xxx' }` | `{ entity: true }` |
| 典型场景 | Toolbar → Table（组件间联动） | Table → StatusPanel（实体事件同步） |
| 事件粒度 | 单个事件（crudaction） | 一组事件（created/listed/deleted） |

### LifecycleAbility 自动发射

组件生命周期事件（mounted/unmounted）如果有 `eventKey`，会自动通过 `componentEmit` 发射：

```typescript
// LifecycleAbility 内部
if (eventKey && typeof this.componentEmit === 'function') {
    const ctx = EventContextBuilder.create()
        .withEvent('lifecycle:mounted')
        .withType('lifecycle:mounted')
        .withSource(eventKey)
        .withSourceType(this.constructor.name)
        .build();
    this.componentEmit(ctx);
}
```

---

## 四、决策指南：选择哪种事件机制

```
用户操作需要触发什么？
│
├── 组件内部 DOM 事件处理
│   └── 使用 domEvents（隐式 root 简写）
│       domEvents: { click: { handler: '_onClick' } }
│
├── 子组件事件（直接子组件 on()）
│   └── 使用 listens.node
│       listens: [{ node: 'toolbar', events: { save: true } }]
│
├── 跨组件通信（Toolbar → Table）
│   ├── 属于 CRUD/分页/选择
│   │   └── domEvents 中用 bridges 转发
│   │       domEvents: { click: { Button: { bridges: ['crudaction'] } } }
│   │
│   └── 自定义事件
│       └── ComponentEventBus + listens.source
│           发送方: this.componentEmit(ctx)
│           接收方: listens: [{ source: 'toolbarId', events: {...} }]
│
├── 需要 handler 处理后再转发
│   └── EventMapping 直接支持，无需手写代码
│       listens: [{ source: 'x', events: {
│           event: { handler: 'onEvent', bridges: ['forwarded'] }
│       }}]
│
├── 实体事件组（created/listed/deleted）
│   └── listens.entity 订阅
│       listens: [{ entity: true, events: { listed: 'onListed' } }]
│
├── 系统/路由/文件事件
│   └── listens 对应类型
│       listens: [{ system: true, events: {...} }]
```

### 快速对比

| 需求 | 机制 | 声明位置 | 示例 |
|------|------|---------|------|
| DOM 事件处理 | `domEvents` | 组件类属性 | `domEvents: { click: { handler: '_onClick' } }` |
| 子组件事件 | `listens.node` | body | `listens: [{ node: 'toolbar', events: {...} }]` |
| 组件间通信 | `listens.source` + `componentEmit` | body + 代码 | `listens: [{ source: 'toolbar' }]` |
| 实体事件 | `listens.entity` | body | `listens: [{ entity: true, events: {...} }]` |
| 系统事件 | `listens.system` | body | `listens: [{ system: true, events: {...} }]` |
| 路由事件 | `listens.route` | body | `listens: [{ route: 'router' }]` |
| handler + 转发 | `EventMapping` 扩展 | body | `{ handler: 'onX', bridges: ['y'] }` |

---

## 五、事件常量定义规范

当添加新的事件类型时，遵循以下规范：

### 1. 在 `@qimenjs/events` 中定义常量

```typescript
// src/events/component-events.ts

export const PAGINATION_EVENTS = {
    CHANGE: 'pagechange',
} as const;

export const CRUD_EVENTS = {
    ACTION: 'crudaction',
} as const;

export const SELECTION_EVENTS = {
    CHANGE: 'selectionchange',
} as const;
```

### 2. 命名规范

| 事件类型 | 常量命名 | 事件名格式 | 示例 |
|---------|---------|-----------|------|
| 能力级事件 | `{CAPABILITY}_EVENTS` | 小写无分隔符 | `pagechange`、`crudaction` |
| 实体事件 | `ENTITY_EVENTS` | `entity:` + 小写 | `entity:created` |
| 系统事件 | `SYSTEM_EVENTS` | 小写无分隔符 | `theme:change` |

### 3. 使用 `as const` 确保类型安全

```typescript
export const PAGINATION_EVENTS = {
    CHANGE: 'pagechange',
} as const;
// PAGINATION_EVENTS.CHANGE 类型为 'pagechange'，不会宽化为 string
```

---

## 六、完整事件流示例

以"用户管理"页面的 Toolbar → Table 为例，展示完整的事件流：

### 发送方：Toolbar 组件

```typescript
class EntityToolbarComponent extends ToolbarComponent {
    // domEvents — 委托 Button 点击，转发实体事件 + emit 组件事件
    domEvents = {
        click: {
            Button: {
                handler: '_onButtonClick',
                entities: '[action]',  // action → 实体事件名
            },
        },
    };

    _onButtonClick(domEvt: any) {
        const item = this.getTargetItem?.(domEvt?.target);
        const action = item.component?.action;

        if (PAGINATION_ITEM_NAMES.has(action)) {
            this.emit(PAGINATION_EVENTS.CHANGE, { action, page: this._currentPage });
        } else if (CRUD_ITEM_NAMES.has(action)) {
            this.emit(CRUD_EVENTS.ACTION, { action });
        }
    }
}
```

### 接收方：Table 组件

```typescript
const UserTable = Component.withTemplate({
    tpl: '...',
    body: {
        type: 'Table',
        eventKey: 'userTable',
        entityKey: 'users',

        // 订阅 Toolbar 的分页 + CRUD 组件事件
        listens: [
            { source: 'userToolbar', events: { pagechange: 'onPageChange' } },
            { source: 'userToolbar', events: { crudaction: 'onCrudAction' } },

            // 订阅实体事件
            { entity: true, events: { listed: 'onUsersListed' } },
        ],

        onPageChange(data: any) { /* 处理分页变更 */ },
        onCrudAction(data: any) { /* 处理 CRUD 操作 */ },
        onUsersListed(data: any) { /* 刷新列表 */ },
    },
});
```

### 事件流图

```
┌───────────────────────────────────────────────────────────────────────┐
│ 1. 用户点击 Toolbar 的"新建"按钮                                       │
│                                                                       │
│    DOM click                                                          │
│      → DomEventsEngine 匹配 domEvents.click.Button                    │
│      → eventConfig: handler + entities: '[action]'                    │
│      → _onButtonClick(domEvt)                                         │
│      → emit(CRUD_EVENTS.ACTION, { action: 'create' })                │
│      → entityEmit('create', ...)                                      │
└───────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────┐
│ 2. Table 收到事件                                                     │
│                                                                       │
│    a) entityEmit('create') → EntityListenAbility._handleCrudAction    │
│       → mgr.create(data)                                              │
│       → EntityEmitAbility._forwardEvent('created')                   │
│       → entityEmit('entity:created', { item })                       │
│                                                                       │
│    b) listens: [{ source: 'userToolbar' }]                           │
│       → ComponentEventBus.componentOn('userTable', 'crudaction', ...) │
│       → onCrudAction(data)                                            │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 七、向后兼容说明

> **命名迁移说明**：原 `EventBridge` 已重命名为 `ComponentEventBus`，原 `EventBridgeAbility` 已重命名为 `ComponentEventBusAbility`。为保持向后兼容，以下命名保留不变：
> - 事件配置中的 `bridges` 字段名（运行时调用 `componentEmit`）
> - Layout 配置中的 `eventBridge` 属性名
> - `ListensEngine` 中的 `source` 字段（等价于 `ComponentListen.source`）
>
> 这些配置项在运行时都通过 `ComponentEventBus` 路由，仅命名保持不变。
