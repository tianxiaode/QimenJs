# 组件事件最佳实践

## 概述

QimenJs 的事件系统分为三层，每层解决不同的问题：

| 层级 | 机制 | 解决的问题 | 配置方式 |
|------|------|-----------|---------|
| DOM 交互层 | `handlers` | 用户操作 → 组件动作 | Layout 定义 |
| 组件通信层 | `eventBridge` | 组件间事件桥接 | Layout 定义 |
| 实体数据层 | `EntityEmitAbility` / `EntityListenAbility` | EntityManager ↔ 组件事件双向同步 | 组件内置 |

---

## 场景一：工具栏自定义按钮（不复用）

当自定义按钮只在一个页面使用，不需要跨组件通信时，直接使用 `handlers`。

### 方式 A：handlers 中直接写函数（推荐）

```typescript
const layout = {
    type: 'Toolbar',
    id: 'myToolbar',
    items: [
        { type: 'Button', text: '新建', name: 'create' },
        { type: 'Button', text: '自定义导出', name: 'customExport' },
    ],
    handlers: {
        // 直接写函数，this 指向触发事件的组件实例
        click(component, domEvent) {
            const data = table.getData();
            downloadExcel(data);
        },
    },
};
```

### 方式 B：handlers 中使用字符串映射

```typescript
const layout = {
    type: 'Toolbar',
    id: 'myToolbar',
    items: [
        { type: 'Button', text: '新建', name: 'create' },
        { type: 'Button', text: '自定义导出', name: 'customExport' },
    ],
    handlers: {
        // 字符串映射：从 render 时传入的 handlers 表中查找
        click: 'handleCustomExport',
    },
};

// 渲染时传入 handlers
const handlers = {
    handleCustomExport(component, domEvent) {
        const data = table.getData();
        downloadExcel(data);
    },
};

const result = await Renderer.getInstance().render(layout, { handlers });
```

### 适用场景

- 一次性操作，不需要其他组件响应
- 操作逻辑简单，不需要经过 EntityManager
- 处理函数由应用层提供，不涉及组件间协作

---

## 场景二：工具栏自定义按钮（复用，需组件间通信）

当自定义按钮需要触发其他组件（如表格）的响应时，使用 `eventBridge`。

### 方式 A：使用内置 CRUD 桥接 + meta 注入能力

不再需要定义派生类，直接在 Layout 中通过 `meta` 注入能力：

```typescript
const layout = {
    type: 'VBox',
    children: [
        {
            type: 'Toolbar',
            id: 'userToolbar',
            // 通过 meta 注入 CrudAbility，无需定义 MyToolbar 派生类
            meta: {
                abilities: [CrudAbility],
            },
            // CrudAbility 的按钮会自动发射 crudaction 事件
        },
        {
            type: 'Table',
            id: 'userTable',
            eventBridge: {
                crud: 'userToolbar',           // 监听工具栏的 CRUD 事件
                pagination: 'userToolbar',     // 监听工具栏的分页事件
            },
        },
    ],
};
```

### 方式 B：使用自定义事件桥接 + meta 注入方法和能力

```typescript
const layout = {
    type: 'VBox',
    children: [
        {
            type: 'Toolbar',
            id: 'exportBar',
            meta: {
                abilities: [ClickAbility, TextAbility],
                // 通过 meta 注入方法，this 指向组件实例
                doExport() {
                    this.emit('export', { format: 'excel', scope: 'all' });
                },
                doApprove() {
                    this.emit('approve', { ids: this.getSelectedIds() });
                },
            },
        },
        {
            type: 'Table',
            id: 'userTable',
            eventBridge: {
                pagination: 'exportBar',
                crud: { source: 'exportBar', actions: ['create', 'delete'] },
                // 自定义桥接：监听 exportBar 的 'export' 事件，调用 this.onExport
                export: 'exportBar',
                // 自定义桥接：监听 exportBar 的 'approve' 事件，调用 this.onApprove
                approve: { source: 'exportBar', event: 'approve', handler: 'onApprove' },
            },
        },
    ],
};
```

### 自定义桥接的默认值规则

| 配置项 | 默认值 | 示例 |
|--------|--------|------|
| `event` | 等于 key 名 | `export: 'bar'` → 监听 `'export'` 事件 |
| `handler` | `'on'` + 首字母大写 key | `export: 'bar'` → 调用 `this.onExport` |

完整配置形式：

```typescript
eventBridge: {
    // 简写：source 为 'bar'，event 为 'export'，handler 为 'onExport'
    export: 'bar',

    // 完整配置
    export: {
        source: 'bar',        // 事件源组件 id
        event: 'export',      // 监听的事件名
        handler: 'onExport',  // 目标处理方法名
        enabled: true,        // 是否启用
    },
}
```

---

## 场景三：扩展事件桥——类似实体能力的一组事件

当需要监听一组相关事件（如实体 CRUD 的 created/updated/deleted），`EventBridgeAbility` 的自定义 key 可以逐个声明，但如果事件组有统一的模式，更好的做法是创建一个专门的 Ability 来管理。

### 方案：创建 EntityBridgeAbility

```typescript
// src/component-abilities/entity/EntityBridgeAbility.ts
import type { AbilityDefinition } from '@qimenjs/composable';
import { ComponentManager } from '@qimenjs/component-core';
import { ENTITY_EVENTS } from '@qimenjs/events';

/**
 * 实体事件桥接配置
 */
export interface EntityBridgeConfig {
    /** 事件源组件 id（通常是拥有 EntityManager 的组件） */
    source: string;
    /** 需要监听的实体事件列表，不传则监听所有 */
    events?: string[];
    /** 是否启用 */
    enabled?: boolean;
}

/**
 * EntityBridgeAbility 实体事件桥接能力
 *
 * 监听源组件的 entity:* 事件，自动转发到目标组件。
 * 与 EventBridgeAbility 类似，但专门处理实体事件组。
 */
export const EntityBridgeAbility: AbilityDefinition = {
    entityBridge: {
        get(): Record<string, EntityBridgeConfig> {
            return this.abilityState('EntityBridgeAbility:config', () => ({}));
        },
        set(value: Record<string, EntityBridgeConfig>): void {
            this.setAbilityState('EntityBridgeAbility:config', value);
        },
    },

    initEntityBridge(): void {
        const config = this.entityBridge;
        if (!config) return;

        const mgr = ComponentManager.getInstance();

        for (const [key, cfg] of Object.entries(config)) {
            if (cfg.enabled === false) continue;

            const source = mgr.get(cfg.source);
            if (!source) continue;

            // 监听源组件的所有 entity:* 事件
            const eventsToListen = cfg.events || [
                ENTITY_EVENTS.CREATED,
                ENTITY_EVENTS.UPDATED,
                ENTITY_EVENTS.DELETED,
                ENTITY_EVENTS.LISTED,
                ENTITY_EVENTS.DATA_CHANGE,
            ];

            for (const eventName of eventsToListen) {
                const fullEventName = `${source.eventKey}:${eventName}`;
                const off = source.on?.(fullEventName, (e: any) => {
                    // 构造处理方法名：onEntity + 事件名首字母大写
                    // entity:created → onEntityCreated
                    // entity:datachange → onEntityDataChange
                    const handlerName = `onEntity${string.capitalize(eventName.replace('entity:', ''))}`;
                    if (typeof this[handlerName] === 'function') {
                        this[handlerName](e);
                    }
                });

                if (typeof off === 'function') {
                    this.onCleanup(off);
                }
            }
        }
    },

    __initProps(props: Record<string, any>): void {
        if (props.entityBridge) {
            this.entityBridge = props.entityBridge;
            queueMicrotask(() => {
                if (!this.destroyed) {
                    this.initEntityBridge();
                }
            });
        }
    },
};
```

### 布局定义

```typescript
const layout = {
    type: 'VBox',
    children: [
        {
            type: 'Table',
            id: 'userTable',
            // Table 拥有 EntityManager，通过 EntityEmitAbility 发射 entity:* 事件
        },
        {
            type: 'StatusPanel',
            // 监听 userTable 的实体事件
            entityBridge: {
                userTable: {
                    source: 'userTable',
                    events: ['entity:created', 'entity:deleted', 'entity:datachange'],
                },
            },
        },
    ],
};
```

### 与 EventBridgeAbility 的对比

| 维度 | EventBridgeAbility | EntityBridgeAbility |
|------|-------------------|-------------------|
| 事件源 | 组件级事件（pagechange、crudaction） | 实体级事件（entity:created、entity:listed） |
| 事件粒度 | 单个事件 → 单个方法 | 一组事件 → 统一命名规则的方法 |
| 配置方式 | 按 key 声明桥接 | 按 source 声明，events 过滤 |
| 典型场景 | Toolbar → Table | Table → StatusPanel/LogPanel |

---

## 场景四：完整流程——从按钮点击到数据更新

以"用户管理"页面为例，展示完整的事件流：

```
┌──────────────────────────────────────────────────────────────┐
│  Layout 定义（声明式配置）                                      │
│                                                              │
│  Toolbar (id: userToolbar)                                   │
│    ├── [新建] ──click──> CrudAbility.emit('crudaction',       │
│    │                       { action: 'create' })              │
│    ├── [删除] ──click──> CrudAbility.emit('crudaction',       │
│    │                       { action: 'delete' })              │
│    └── [导出] ──click──> handlers.handleExport()              │
│                                                              │
│  Table (id: userTable)                                       │
│    eventBridge:                                               │
│      crud: 'userToolbar'        ← 监听 CRUD 事件              │
│      pagination: 'userToolbar'  ← 监听分页事件                 │
│      export: 'userToolbar'      ← 监听自定义导出事件           │
│                                                              │
│    EntityListenAbility:                                       │
│      crudaction → onCreate/onEdit/onDelete → mgr.create/...  │
│                                                              │
│    EntityEmitAbility:                                        │
│      mgr.on('created') → emit('entity:created')              │
│      mgr.on('listed')  → emit('entity:listed')               │
└──────────────────────────────────────────────────────────────┘
```

### 布局定义

```typescript
const userPageLayout = {
    type: 'VBox',
    children: [
        {
            type: 'Toolbar',
            id: 'userToolbar',
            // 通过 meta 注入 CrudAbility 和 PaginationAbility
            meta: {
                abilities: [CrudAbility, PaginationAbility],
                // 导出按钮的处理方法
                onExport(e) {
                    const table = ComponentManager.getInstance().get('userTable');
                    if (table) {
                        const data = table.mgr?.rawData;
                        downloadExcel(data, 'users.xlsx');
                    }
                },
            },
            showCreate: true,
            showDelete: true,
            currentPage: 1,
            totalPages: 10,
        },
        {
            type: 'Table',
            id: 'userTable',
            entityConfig: {
                domain: 'user',
                schema: userSchema,
                type: 'remoteCrud',
            },
            eventBridge: {
                crud: { source: 'userToolbar', actions: ['create', 'delete'] },
                pagination: 'userToolbar',
                // 自定义桥接：导出
                export: 'userToolbar',
            },
            columns: [
                { field: 'id', label: 'ID' },
                { field: 'name', label: '姓名' },
                { field: 'email', label: '邮箱' },
            ],
        },
    ],
};
```

### 事件流详解

**1. 点击"新建"按钮：**

```
Toolbar.Button click
  → CrudAbility.emit('crudaction', { action: 'create' })
  → EventBridgeAbility._bridgeOn('userToolbar', 'crudaction', handler)
  → Table.onCreate(e)
  → EntityListenAbility._handleCrudAction(e)
  → mgr.create(data)
  → EntityEmitAbility._forwardEvent('created')
  → Table.emit('entity:created', { item })
```

**2. 点击"导出"按钮：**

```
Toolbar.Button click
  → handlers.handleExport(component, domEvent)
  → 直接执行导出逻辑（不经过事件桥）
```

**3. 翻页：**

```
Toolbar.Pagination gotoPage(2)
  → PaginationAbility.emit('pagechange', { page: 2, pageSize: 20 })
  → EventBridgeAbility._bridgeOn('userToolbar', 'pagechange', handler)
  → Table.onPageChange(e)
  → EntityListenAbility._handlePageChange(e)
  → mgr.loadPage(2)
  → EntityEmitAbility._forwardEvent('listed')
  → Table.emit('entity:listed', { items, total, page, pageSize })
```

---

## meta 字段详解

`meta` 是 Layout 中的元数据字段，用于在 JS 对象字面量 Layout 中声明额外的能力、方法和自定义数据，渲染时自动注入到组件实例，无需定义派生类。

### 注入规则

| meta 中的值类型 | 注入方式 | 示例 |
|---------------|---------|------|
| `abilities` 数组 | 展开后逐个注入 | `abilities: [CrudAbility, PaginationAbility]` |
| 函数 | bind 到组件实例后注入 | `onExport(e) { ... }` |
| getter/setter 对象 | 直接作为 PropertyDescriptor 注入 | `count: { get() { ... }, set(v) { ... } }` |
| 普通值 | 直接注入 | `customTitle: '我的工具栏'` |

### 完整示例

```typescript
const layout = {
    type: 'Toolbar',
    id: 'userToolbar',
    meta: {
        // 注入能力
        abilities: [CrudAbility, PaginationAbility],

        // 注入方法（this 指向组件实例）
        onEntityCreated(data) {
            this.mgr.reload();
        },
        beforeList() {
            console.log('loading...');
        },

        // 注入 getter/setter
        filterKeyword: {
            get() { return this.abilityState('filterKeyword', () => ''); },
            set(v) { this.setAbilityState('filterKeyword', v); this.mgr?.filter(v); },
        },

        // 注入自定义数据
        customTitle: '用户管理工具栏',
        exportFormat: 'excel',
    },
    showCreate: true,
    currentPage: 1,
    totalPages: 10,
};
```

### 与定义派生类的对比

```typescript
// 旧方式：需要定义派生类
class UserToolbar extends ComponentBase {
    static readonly abilities = [CrudAbility, PaginationAbility];

    onEntityCreated(data) {
        this.mgr.reload();
    }
}

// 新方式：直接在 Layout 中声明，无需派生类
const layout = {
    type: 'Toolbar',
    meta: {
        abilities: [CrudAbility, PaginationAbility],
        onEntityCreated(data) { this.mgr.reload(); },
    },
};
```

---

## 决策指南：选择哪种事件机制

```
用户操作需要触发什么？
│
├── 仅执行一次性逻辑（导出、跳转、弹窗）
│   └── 使用 handlers
│       handlers: { click: (component, event) => { ... } }
│
├── 需要其他组件响应（Toolbar → Table）
│   ├── 属于 CRUD/分页/选择
│   │   └── 使用 EventBridgeAbility 内置桥接
│   │       eventBridge: { crud: 'toolbarId', pagination: 'toolbarId' }
│   │
│   └── 自定义事件
│       └── 使用 EventBridgeAbility 自定义 key
│           eventBridge: { export: 'toolbarId' }
│
└── 需要监听 EntityManager 的事件组
    └── 创建专门的 EntityBridgeAbility
        entityBridge: { source: 'tableId', events: [...] }
```

---

## 事件常量定义规范

当添加新的事件类型时，遵循以下规范：

### 1. 在 `@qimenjs/events` 中定义常量

```typescript
// src/events/component-events.ts

// 导出事件
export const EXPORT_EVENTS = {
    EXCEL: 'exportexcel',
    PDF: 'exportpdf',
} as const;

// 审批事件
export const APPROVAL_EVENTS = {
    SUBMIT: 'approvesubmit',
    APPROVE: 'approve',
    REJECT: 'reject',
} as const;
```

### 2. 命名规范

| 事件类型 | 常量命名 | 事件名格式 | 示例 |
|---------|---------|-----------|------|
| 能力级事件 | `{CAPABILITY}_EVENTS` | 小写无分隔符 | `pagechange`、`crudaction` |
| 实体转发事件 | `ENTITY_{CATEGORY}_EVENTS` | `entity:` + 小写无分隔符 | `entity:created` |
| 组件级事件 | `{COMPONENT}_EVENTS` | `{组件名}:` + 小写无分隔符 | `table:create` |
| 自定义事件 | `{DOMAIN}_EVENTS` | 小写无分隔符 | `exportexcel` |

### 3. 使用 `as const` 确保类型安全

```typescript
// 正确：类型为 'pagechange'，不会被宽化为 string
export const PAGINATION_EVENTS = {
    CHANGE: 'pagechange',
} as const;

// 错误：类型为 string，失去类型推断
export const PAGINATION_EVENTS = {
    CHANGE: 'pagechange',
};
```
