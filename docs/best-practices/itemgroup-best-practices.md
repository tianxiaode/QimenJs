# ItemGroup 最佳实践

> 日期：2026-07-20
> 状态：当前有效

## 一、ItemGroup 是什么

ItemGroup 是轻量排列容器，通过 `items` 数组动态管理子组件实例。核心设计理念：

1. **子项即 nodeMap 节点** — 每个子项注册进 `nodeMap`，事件转发由 `EventForwardAbility` 统一处理
2. **数据驱动声明** — 通过 `defaultItem` 声明子项的默认事件定义，读配置即知事件流向
3. **池化可选** — `itemDestroy` 控制移除时是销毁还是隐藏复用

## 二、核心配置

### 2.1 defaultItem — 子项默认事件定义

`defaultItem` 支持两种形态，根据子项是否同质选择：

#### 简单形式（同质子项）

当所有子项类型相同（通过 `itemType` 指定），使用简单形式，不需要 type key：

```typescript
// TabBar — 所有子项都是 Toggle
{
    type: 'TabBar',
    itemType: 'Toggle',
    defaultItem: { events: { toggle: { bridges: ['toggle'] } } },
    items: [
        { text: '首页' },
        { text: '设置' },
    ]
}

// Menu — 所有子项都是 MenuItem
{
    type: 'Menu',
    itemType: 'MenuItem',
    defaultItem: { events: { click: { bridges: ['click'] }, select: { bridges: ['select'] } } },
    items: [
        { text: '新建' },
        { text: '打开' },
    ]
}
```

#### Map 形式（异质子项）

当子项类型不同（如 Toolbar），使用 Map 形式，按 type 索引：

```typescript
{
    type: 'Toolbar',
    defaultItem: {
        button: { events: { click: { bridges: ['click'] } } },
        input:  { events: { input: { bridges: ['input'] } } },
    },
    items: [
        { type: 'button', text: '保存' },
        { type: 'input', placeholder: '搜索' },
    ]
}
```

**区分规则**：`defaultItem.events` 存在 → 简单形式，否则 → Map 形式。

### 2.2 事件合并规则

item 自身的 `events` 与 `defaultItem` 深合并，item 优先：

```typescript
// defaultItem 定义公共事件
defaultItem: { events: { click: { handler: true, bridges: ['click'] } } }

// item 补充差异
{ type: 'button', text: '新建', events: { click: { entities: 'create' } } }

// 合并结果
// click: { handler: true, bridges: ['click'], entities: 'create' }
```

### 2.3 itemDestroy — 池化模式

| 值 | 行为 | 适用场景 |
|----|------|---------|
| `true`（默认） | 移除时销毁，从 nodeMap 删除 | Menu、Toolbar（异质/有分隔符） |
| `false` | 移除时隐藏，保留在池中可复用 | TabBar（同质，频繁增减） |

```typescript
// TabBar — 池化复用
{
    type: 'TabBar',
    itemDestroy: false,
    itemType: 'Toggle',
    defaultItem: { events: { toggle: { bridges: ['toggle'] } } },
}
```

## 三、事件三路分发

子项注册进 nodeMap 后，事件声明遵循 `DomEventDecl` 规范，支持三路分发：

```
子项事件 → _handleDomEvent → 按 DomEventDecl 分发
    ├── handler: true     → this.on{Name}{Event}()   内部处理
    ├── bridges: ['click'] → this.bridgeEmit()        桥接转发
    └── entities: 'save'   → this.entityEmit()        实体操作
```

### 3.1 bridges — 桥接转发

子项事件通过 EventBridge 转发，持有方通过 `bridgeOn` 监听：

```typescript
// TabBar 的 tab 点击转发为桥接事件
defaultItem: { events: { toggle: { bridges: ['toggle'] } } }

// 监听方
bridge.bridgeOn('tabBar', 'toggle', (data) => { ... });
```

### 3.2 entities — 实体操作

CRUD 按钮直接触发实体操作，不走桥接：

```typescript
// Toolbar 的 CRUD 按钮
{
    type: 'Toolbar',
    defaultItem: {
        button: { events: { click: { handler: true } } },
    },
    items: [
        { type: 'button', text: '新建', events: { click: { entities: 'create' } } },
        { type: 'button', text: '保存', events: { click: { entities: 'save' } } },
        { type: 'button', text: '删除', events: { click: { entities: 'delete' } } },
    ]
}
```

事件流：`按钮 click → _handleDomEvent → entities: 'create' → entityEmit → EntityManager.create()`

### 3.3 handler — 内部处理

组件自身处理事件，自动推导方法名 `on{Name}{Event}`：

```typescript
// TabBar 内部处理 toggle 逻辑
defaultItem: { events: { toggle: { handler: true, bridges: ['toggle'] } } }

// body 中定义处理方法
body: {
    onItemToggle(data) { this.selectAt(data.index); }
}
```

### 3.4 三路可共存

同一个事件可以同时走多条通道：

```typescript
// 内部处理 + 桥接转发 + 实体操作
{ type: 'button', events: { click: { handler: true, bridges: ['click'], entities: 'save' } } }
```

## 四、内部数据结构

### 4.1 三个核心状态

| 状态 | 类型 | 职责 |
|------|------|------|
| `_visibleNames` | `string[]` | 有序可见 name 列表，控制 DOM 顺序和数据映射 |
| `_hiddenNames` | `string[]` | 池化可用 name 列表（itemDestroy=false 时） |
| `nodeMap[name]` | `NodeEntry` | 实例 + 事件声明（"具体是什么"） |

```
_visibleNames: ['item_1', 'item_2', 'item_3']   ← 顺序 + 可见性
_hiddenNames:  ['item_0']                        ← 池中可用
nodeMap: {
    'item_0': { component, el, events: { click: { bridges: ['click'] } } },
    'item_1': { component, el, events: { click: { bridges: ['click'] } } },
    ...
}
```

### 4.2 name 生成规则

- item 有 `name` 字段 → 使用该 name
- item 无 `name` → 使用 `getId('item')` 生成唯一 name

### 4.3 池化复用流程

```
add(data)
  → _findReusableHidden(data.type)   // 查找池中同类型隐藏项
  → 找到 → update(data) + hidden=false + 移入 _visibleNames
  → 没找到 → _createAndRegister(data)  // 正常创建
```

## 五、派生组件定义模式

使用 `replace` 从 ItemGroupComponent 派生：

```typescript
export let TabBarComponent = ItemGroupComponent.replace({
    type: 'TabBar',
    cls: 'q-tab-bar',
    itemsCls: 'q-tab-bar__items',
    config: {
        direction: 'horizontal',
        gap: '0',
        itemType: 'Toggle',
        itemDestroy: false,
        defaultItem: { events: { toggle: { bridges: ['toggle'] } } },
    },
    body: {
        onInitState() {
            return { _selectedIndex: -1 };
        },
        onAfterInit(props) {
            this.on('toggle', (data) => this._onItemToggle(data));
        },
        selectAt(index, silent = false) { ... },
    },
});
```

### 各组件配置速查

| 组件 | itemType | itemDestroy | defaultItem 形式 | 事件 |
|------|----------|-------------|-----------------|------|
| TabBar | Toggle | false | 简单 | toggle → bridges |
| Menu | MenuItem | true（默认） | 简单 | click/select → bridges |
| Accordion | Panel | true（默认） | 简单 | click → bridges |
| ButtonGroup | Toggle | true（默认） | 简单 | toggle → bridges |
| NavItemGroup | NavItem | true（默认） | 简单 | click/close → bridges |
| Toolbar | — | true（默认） | Map | 按钮各自声明 |

## 六、CRUD 工具栏完整示例

```typescript
// 实体工具栏 — entities 直接触发实体操作
export let CrudToolbarComponent = ItemGroupComponent.replace({
    type: 'CrudToolbar',
    cls: 'q-toolbar',
    itemsCls: 'q-toolbar__items',
    config: {
        direction: 'horizontal',
        gap: '4px',
        defaultItem: {
            button: { events: { click: { handler: true } } },
        },
    },
    body: {},
});

// 使用
new CrudToolbarComponent({
    items: [
        { type: 'button', text: '新建', events: { click: { entities: 'create' } } },
        { type: 'button', text: '保存', events: { click: { entities: 'save' } } },
        { type: 'button', text: '删除', events: { click: { entities: 'delete' } } },
    ],
});
```

事件流：

```
[新建] click → entities: 'create' → entityEmit → EntityManager.create()
[保存] click → entities: 'save'   → entityEmit → EntityManager.save()
[删除] click → entities: 'delete' → entityEmit → EntityManager.delete()
```

## 七、设计决策记录

### 为什么用 defaultItem 而不是 eventKey + events？

旧方案通过 `eventKey` + `events` 列表配置事件转发，存在以下问题：

1. **语义层级不对** — `bridges`/`handler` 是 TplNode 层概念，放在 ItemGroup 配置里层级混乱
2. **两套事件声明** — 子项自身有 TplNode events，ItemGroup 又有 events 列表，容易冲突
3. **无法区分三路分发** — 只知道转发哪些事件名，不知道走 bridges 还是 entities

新方案 `defaultItem` 直接使用 `DomEventDecl` 声明，与 TplNode 事件声明完全一致：

```typescript
// 旧方案 — 只有事件名，不知道走什么通道
eventKey: 'tab', events: ['toggle']

// 新方案 — 完整声明事件流向
defaultItem: { events: { toggle: { bridges: ['toggle'] } } }
```

### 为什么子项注册进 nodeMap？

1. **复用 EventForwardAbility** — `_bindComponentEvent` 已能处理组件级事件绑定，不需要 ItemGroup 自己实现
2. **统一事件管线** — 所有事件走 `_handleDomEvent` → 三路分发，与静态模板节点完全一致
3. **handler 自动推导** — `close: { handler: true }` 自动推导 `onItem0Close`，ItemGroup body 中直接写处理方法

### 为什么 _visibleNames/_hiddenNames 替换 _pool？

1. **职责分离** — `_visibleNames` 管顺序，`_hiddenNames` 管池化，`nodeMap` 管数据
2. **按 name 索引** — 不依赖数组位置，removeAt 中间项不会导致错位
3. **池化更自然** — hidden name 列表就是池，不需要额外的 `_pool` 数组