# ItemGroup 最佳实践

> 日期：2026-07-25
> 状态：当前有效

## 一、ItemGroup 是什么

ItemGroup 是轻量排列容器，通过 `items` 数组动态管理子组件实例。核心设计理念：

1. **事件委托声明** — 通过 `tplEvents.$items` 声明子组件事件转发规则，`getTargetItem` 自动匹配，零手动绑定
2. **两种模式分离** — `ItemGroupPooledComponent`（池化复用）和 `ItemGroupStaticComponent`（静态生灭），按场景选择
3. **生命周期自动链式** — `replace()` 派生时，生命周期钩子自动先调基类再调子类，无需手动 `_initItemGroupComponent`

## 二、两种模式

### 2.1 池化模式 — ItemGroupPooledComponent

**核心**：数据驱动，索引即位置，子项隐藏/显示复用，不销毁。

**适用场景**：同质子项，频繁增减，子项类型固定（如 TabBar、ButtonGroup、Accordion、NavItemGroup）。

**要求**：子项**必须实现 `update()` 方法**，否则池化更新时数据变更不会反映到视图，框架会输出 logger 警告。

```typescript
// TabBar — 同质子项，池化复用
export let TabBarComponent = ItemGroupPooledComponent.replace({
    type: 'TabBar',
    cls: 'q-tab-bar',
    itemsCls: 'q-tab-bar__items',
    config: {
        direction: 'horizontal',
        gap: '0',
        defaultItemType: 'Toggle',
    },
    tplEvents: {
        $items: {
            keyProp: 'name',
            Toggle: { toggle: { emits: ['toggle'] } },
        },
    },
    body: { ... },
});
```

### 2.2 静态模式 — ItemGroupStaticComponent

**核心**：使用 `order` 控制顺序，组件随数据生灭（移除即销毁），支持 `sort()`/`move()`。

**适用场景**：异质子项，含分隔符，子项类型不固定（如 Menu、Toolbar）。

```typescript
// Menu — 异质子项（MenuItem + MenuSeparator），静态生灭
export let MenuComponent = ItemGroupStaticComponent.replace({
    type: 'Menu',
    cls: 'q-menu',
    itemsCls: 'q-menu__content',
    config: {
        direction: 'vertical',
        defaultItemType: 'MenuItem',
    },
    tplEvents: {
        $items: {
            keyProp: 'name',
            MenuItem: { click: { emits: ['click'] }, select: { emits: ['select'] } },
        },
    },
    body: { ... },
});
```

### 2.3 选择依据

| 特征 | 池化 (Pooled) | 静态 (Static) |
|------|:---:|:---:|
| 同质子项 | ✅ | ✅ |
| 异质子项/分隔符 | ❌ | ✅ |
| 频繁增减 | ✅ 复用 | ⚠️ 销毁重建 |
| 子项需要 `update()` | ✅ 必须 | 不需要 |
| `sort()`/`move()` | ❌ | ✅ |
| 内存占用 | 较高（池保留） | 较低（即时销毁） |

## 三、核心配置

### 3.1 defaultItemType — 默认子项类型

当 item 没有指定 `type` 时，使用 `defaultItemType` 作为兜底：

```typescript
config: {
    defaultItemType: 'Toggle',  // items 中无 type 字段时默认创建 Toggle
}
```

### 3.2 defaultItem — 子项默认配置

`defaultItem` 用于非事件相关的子项默认配置（如 cls、initConfig 等）。

> **注意**：事件声明在 `tplEvents.$items` 中（见第四节），`defaultItem` 不再包含 `events` 字段。

### 3.3 tplEvents.$items — 子组件事件委托声明

`tplEvents.$items` 在 `tplEvents` 内部声明 ItemGroup 子组件的事件转发规则，与模板节点事件统一在 `tplEvents` 中。

**key = 子组件类型名**（如 `Toggle`、`MenuItem`、`NavItem`），**value = 该类型的事件声明**。

```typescript
tplEvents: {
    $items: {
        keyProp: 'name',
        Toggle: { toggle: { emits: ['toggle'] } },
        MenuItem: { click: { emits: ['click'] }, select: { emits: ['select'] } },
        NavItem: { click: { emits: ['click'] }, close: { emits: ['close'] } },
    },
}
```

#### $items 特有字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `keyProp` | `string` | 默认 `'name'`，从 item 组件取属性值作为事件名前缀 |
| `data` | `Record<string, string>` | 属性取值和 get 方法引用，按事件类型区分 |

#### TplEventAction 字段（$items 内部复用）

| 字段 | 类型 | 说明 |
|------|------|------|
| `emits` | `string[]` | 转发为组件事件，emit `${keyProp}:${emitName}` 和 `${emitName}` |
| `bridges` | `string[]` | 转发为桥接事件（通过 EventBridge 解耦转发） |
| `entities` | `string \| true` | 转发为实体操作；`true` 时自动用 keyProp 解析 |
| `router` | `string \| true` | 转发为路由事件；`true` 时自动用 keyProp 解析 |
| `system` | `string \| string[]` | 转发为系统事件 |
| `handler` | `true` | 自动路由到 `on${KeyProp}${Event}` 方法，零分支 |

## 四、事件委托机制

### 4.1 工作原理

ItemGroup 的子组件事件通过 **containsElement + getTargetItem** 自动匹配：

```
子组件 DOM 事件冒泡 → ItemGroup root el
  → DelegatedEventEngine.handleDelegatedEvent
  → TemplateComponent.containsElement(nodeName, target) 匹配模板节点
  → ItemGroupBaseComponent.getTargetItem(target) 匹配 item 组件
  → 查 tplEvents.$items[type][event]
  → 按 TplEventAction 分发
```

### 4.2 containsElement + getTargetItem

- **TemplateComponent.containsElement(nodeName, target)**：检查 target 是否在指定 nodeName 的模板节点 DOM 范围内
- **ItemGroupBaseComponent.getTargetItem(target)**：遍历 `_items`，找到 target 所属的 item 组件实例，返回 `{ data, component, el }`

替代了旧的 `data-cmp-id` + `nodeElMap` + `childEventIndex` 机制，无需在 DOM 上设置额外属性。

### 4.3 keyProp — 事件名前缀

`keyProp` 默认为 `'name'`，从 item 组件取属性值作为事件名前缀：

```typescript
tplEvents: {
    $items: {
        keyProp: 'name',
        Toggle: { toggle: { emits: ['toggle'] } },
    },
}

// 监听方
group.on('toggle', (data) => { ... });           // 通用事件
group.on('item1:toggle', (data) => { ... });     // 带 keyProp 值前缀的精确事件
```

### 4.4 handler: true — 零分支自动路由

`handler: true` + `keyProp` 自动路由到 `on${KeyProp}${Event}` 方法，无需 if-else 分支：

```typescript
tplEvents: {
    $items: {
        keyProp: 'name',
        Button: { click: { handler: true } },
    },
}

// item name='save' → 自动调用 this.onSaveClick(domEvent)
// item name='delete' → 自动调用 this.onDeleteClick(domEvent)
```

### 4.5 emits — 组件事件转发（推荐）

```typescript
tplEvents: {
    $items: {
        keyProp: 'name',
        Toggle: { toggle: { emits: ['toggle'] } },
    },
}
```

### 4.6 bridges — 桥接事件转发

```typescript
tplEvents: {
    $items: {
        keyProp: 'name',
        Button: { click: { bridges: ['click'] } },
    },
}
```

### 4.7 entities — 实体操作

```typescript
tplEvents: {
    $items: {
        keyProp: 'name',
        Button: { click: { entities: 'create' } },
    },
}
// 事件流：按钮 click → 委托 → entityEmit → EntityManager.create()

// entities: true 时自动用 keyProp 解析
tplEvents: {
    $items: {
        keyProp: 'name',
        Button: { click: { entities: true } },
    },
}
// item name='save' → entityEmit('save', ...)
```

### 4.8 多路可共存

```typescript
tplEvents: {
    $items: {
        keyProp: 'name',
        Button: { click: { emits: ['click'], entities: 'save' } },
    },
}
```

## 五、事件通信三层模型

ItemGroup 的事件通信遵循三层模型：

| 层级 | 机制 | 解决的问题 | 配置方式 |
|------|------|-----------|---------|
| tplEvents | DOM 委托 | 组件内部 DOM 事件 → 委托到 root el | `tplEvents: { ... }` |
| emits | 组件事件 | 组件对外 emit() → 消费者 .on() 监听 | `tplEvents.$items: { Type: { event: { emits: [...] } } }` |
| bridges | EventBridge | 跨组件解耦通信 | `tplEvents.$items: { Type: { event: { bridges: [...] } } }` |

**关键规则**：
- tplEvents 不跨组件边界做委托
- ItemGroup 是硬边界，子组件事件走 tplEvents.$items 声明 + getTargetItem 匹配
- ItemGroup 用 emits + keyProp（不用 bridges），事件名格式 `${keyProp}:${eventName}`

## 六、replace() 合并规则

`replace()` 派生时，`tplEvents` 统一合并（含 `$items`）：

### tplEvents 合并

- 同 nodeName 对象级浅合并，不同 nodeName 追加
- `$items` 内同 type 事件级浅合并，不同 type 追加
- 合并后重新 compileTplEvents

```typescript
// 基类
const Base = ItemGroupPooledComponent.replace({
    tplEvents: {
        $items: {
            keyProp: 'name',
            Toggle: { toggle: { emits: ['toggle'] } },
        },
    },
});

// 派生类追加
const Derived = Base.replace({
    tplEvents: {
        $items: {
            Button: { click: { emits: ['click'] } },
        },
    },
});
// 结果：Toggle + Button 两种类型的 $items 事件
```

## 七、生命周期自动链式调用

`replace()` 派生时，生命周期钩子（`onBeforeInit`/`onAfterInit`/`onMounted`/`onUpdated`/`onBeforeDispose`/`onDisposed`）自动链式调用：**先调基类，再调子类**。

子类**不需要**手动调用 `_initItemGroupComponent`，基类的 `onAfterInit` 会自动执行，处理 `direction`、`gap`、`defaultItemType` 等配置。

```typescript
// ✅ 正确 — 子类 onAfterInit 自动链式，基类初始化已执行
export let TabBarComponent = ItemGroupPooledComponent.replace({
    config: { direction: 'horizontal', defaultItemType: 'Toggle', ... },
    tplEvents: { $items: { keyProp: 'name', Toggle: { toggle: { emits: ['toggle'] } } } },
    body: {
        onAfterInit(props) {
            // 基类 onAfterInit 已自动执行，direction/defaultItemType 已设置
            this.on('toggle', (data) => this._onItemToggle(data));
        },
    },
});

// ❌ 旧写法 — 不再需要手动 _initItemGroupComponent
onAfterInit(props) {
    this._initItemGroupComponent(props);  // 冗余，基类已自动调用
    ...
}
```

## 八、内部数据结构

### 8.1 核心状态

| 状态 | 类型 | 职责 |
|------|------|------|
| `_items` | `Array<{data, component, el}>` | 有序可见项列表，控制 DOM 顺序 |
| `_hiddenItems`（仅池化） | 同上 | 隐藏项池，可复用 |
| `_defaultItemType` | `string` | 默认子组件类型 |
| `_defaultItem` | `DefaultItemConfig` | 按 type 索引的默认配置 |


### 8.2 池化复用流程

```
add(data)
  → _reuseFromPool(data.type ?? defaultItemType)   // 按 type 匹配池中隐藏项
  → 找到 → update(data) + hidden=false + 移入 _items
  → 没找到 → _createItem(data)                      // 正常创建
```

### 8.3 事件委托流程

```
DOM 事件冒泡到 ItemGroup root el
  → DelegatedEventEngine.handleDelegatedEvent
  → 1. TemplateComponent.containsElement(nodeName, target) → 模板节点规则
  → 2. ItemGroupBaseComponent.getTargetItem(target) → item 组件匹配
     → 查 tplEvents.$items[componentType][eventType]
     → 按 TplEventAction 分发（emits/bridges/entities/router/system/handler）
```

## 九、派生组件定义模式

### 各组件配置速查

| 组件 | 基类 | defaultItemType | tplEvents.$items | 事件 |
|------|------|-----------------|------------------|------|
| TabBar | Pooled | Toggle | `Toggle: { toggle: { emits } }` | toggle → emits |
| ButtonGroup | Pooled | Toggle | `Toggle: { toggle: { emits } }` | toggle → emits |
| Accordion | Pooled | Panel | `Panel: { click: { emits } }` | click → emits |
| NavItemGroup | Pooled | NavItem | `NavItem: { click/close: { emits } }` | click/close → emits |
| Menu | Static | MenuItem | `MenuItem: { click/select: { emits } }` | click/select → emits |
| Toolbar | Static | — | — | — |

### 派生模板

```typescript
export let MyComponent = ItemGroupPooledComponent.replace({  // 或 ItemGroupStaticComponent
    type: 'MyComponent',
    cls: 'q-my',
    itemsCls: 'q-my__items',
    config: {
        direction: 'horizontal',       // 'horizontal' | 'vertical'
        gap: '4px',                    // CSS gap 值
        defaultItemType: 'Toggle',     // 默认子组件类型
    },
    tplEvents: {                      // 子组件事件委托声明
        $items: {
            keyProp: 'name',
            Toggle: { toggle: { emits: ['toggle'] } },
        },
    },
    body: {
        onInitState() {
            return { _myState: null };
        },
        onAfterInit(props) {
            // 基类初始化已自动执行
        },
    },
});
```

## 十、CRUD 工具栏完整示例

```typescript
export let CrudToolbarComponent = ItemGroupStaticComponent.replace({
    type: 'CrudToolbar',
    cls: 'q-toolbar',
    itemsCls: 'q-toolbar__items',
    config: {
        direction: 'horizontal',
        gap: '4px',
    },
    tplEvents: {
        $items: {
            keyProp: 'name',
            button: { click: { emits: ['click'] } },
        },
    },
    body: {},
});

// 使用
new CrudToolbarComponent({
    items: [
        { type: 'button', text: '新建' },
        { type: 'button', text: '保存' },
        { type: 'button', text: '删除' },
    ],
});
```

## 十一、设计决策记录

### 为什么拆分 Pooled/Static 而不是 itemDestroy 开关？

1. **类型安全** — 池化模式子项必须实现 `update()`，静态模式不需要，混在一个类里无法表达这个约束
2. **API 清晰** — 池化没有 `sort()`/`move()`，静态有，混在一起容易误用
3. **避免隐式行为** — `itemDestroy` 开关让同一个类有两种截然不同的行为模式，容易踩坑

### 为什么生命周期钩子自动链式？

1. **避免遗漏** — 旧模式子类覆写 `onAfterInit` 后基类初始化丢失，`config` 中的默认值不生效
2. **减少样板** — 不再需要每个子类手动 `_initItemGroupComponent(props)`
3. **符合直觉** — 生命周期钩子"先基类后子类"是 OOP 的自然期望

### 为什么用 tplEvents.$items 统一替代 itemEvents？

1. **架构统一** — `itemEvents` 与 `tplEvents` 同级但职责重叠，`$items` 将子组件事件纳入 `tplEvents` 统一声明，一套编译/合并/分发流程
2. **委托事件引擎统一** — 所有 DOM 事件走 DelegatedEventEngine，不再有 `_dispatchItemEvent` 的独立分发链路
3. **containsElement + getTargetItem 匹配** — 替代 `data-cmp-id` + `nodeElMap` + `childEventIndex`，无需在 DOM 上设置额外属性，直接通过组件实例匹配
4. **keyProp 动态解析** — `handler: true` + `keyProp` 自动路由到 `on${KeyProp}${Event}` 方法，`entities: true` / `router: true` 支持动态解析，零分支
5. **replace() 合并** — `$items` 随 `tplEvents` 统一合并，不再需要独立的 `itemEvents` 合并逻辑
