# ItemGroup 最佳实践

> 日期：2026-07-21
> 状态：当前有效

## 一、ItemGroup 是什么

ItemGroup 是轻量排列容器，通过 `items` 数组动态管理子组件实例。核心设计理念：

1. **数据驱动声明** — 通过 `defaultItem` 声明子项的默认事件定义，读配置即知事件流向
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
        defaultItem: {
            Toggle: { events: { toggle: { bridges: ['toggle'] } } },
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
        defaultItem: {
            MenuItem: {
                events: { click: { bridges: ['click'] }, select: { bridges: ['select'] } },
            },
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

### 3.2 defaultItem — 子项默认事件定义

`defaultItem` 支持两种形态，根据子项是否同质选择：

#### 简单形式（同质子项）

当所有子项类型相同（通过 `defaultItemType` 指定），使用简单形式：

```typescript
{
    defaultItemType: 'Toggle',
    defaultItem: { events: { toggle: { bridges: ['toggle'] } } },
}
```

#### Map 形式（异质子项）

当子项类型不同，使用 Map 形式，按 type 索引：

```typescript
{
    defaultItem: {
        button: { events: { click: { bridges: ['click'] } } },
        input:  { events: { input: { bridges: ['input'] } } },
    },
}
```

**区分规则**：`defaultItem.events` 存在 → 简单形式，否则 → Map 形式。

### 3.3 事件合并规则

item 自身的 `events` 与 `defaultItem` 深合并，item 优先：

```typescript
// defaultItem 定义公共事件
defaultItem: { events: { click: { handler: true, bridges: ['click'] } } }

// item 补充差异
{ type: 'button', text: '新建', events: { click: { entities: 'create' } } }

// 合并结果
// click: { handler: true, bridges: ['click'], entities: 'create' }
```

## 四、事件三路分发

子项事件声明遵循 `DomEventDecl` 规范，支持三路分发：

```
子项事件 → _handleDomEvent → 按 DomEventDecl 分发
    ├── handler: true     → this.on{Name}{Event}()   内部处理
    ├── bridges: ['click'] → this.bridgeEmit()        桥接转发
    └── entities: 'save'   → this.entityEmit()        实体操作
```

### 4.1 bridges — 桥接转发

```typescript
defaultItem: { events: { toggle: { bridges: ['toggle'] } } }

// 监听方
bridge.bridgeOn('tabBar', 'toggle', (data) => { ... });
```

### 4.2 entities — 实体操作

```typescript
{ type: 'button', text: '新建', events: { click: { entities: 'create' } } }
// 事件流：按钮 click → _handleDomEvent → entities: 'create' → entityEmit → EntityManager.create()
```

### 4.3 handler — 内部处理

自动推导方法名 `on{Name}{Event}`：

```typescript
defaultItem: { events: { toggle: { handler: true, bridges: ['toggle'] } } }

// body 中定义处理方法
body: {
    onItemToggle(data) { this.selectAt(data.index); }
}
```

### 4.4 三路可共存

```typescript
{ type: 'button', events: { click: { handler: true, bridges: ['click'], entities: 'save' } } }
```

## 五、生命周期自动链式调用

`replace()` 派生时，生命周期钩子（`onBeforeInit`/`onAfterInit`/`onMounted`/`onUpdated`/`onBeforeUnmount`/`onBeforeDispose`/`onDisposed`）自动链式调用：**先调基类，再调子类**。

子类**不需要**手动调用 `_initItemGroupComponent`，基类的 `onAfterInit` 会自动执行，处理 `direction`、`gap`、`defaultItemType`、`defaultItem` 等配置。

```typescript
// ✅ 正确 — 子类 onAfterInit 自动链式，基类初始化已执行
export let TabBarComponent = ItemGroupPooledComponent.replace({
    config: { direction: 'horizontal', defaultItemType: 'Toggle', ... },
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

## 六、内部数据结构

### 6.1 核心状态

| 状态 | 类型 | 职责 |
|------|------|------|
| `_items` | `Array<{data, component, el, events?}>` | 有序可见项列表，控制 DOM 顺序 |
| `_hiddenItems`（仅池化） | 同上 | 隐藏项池，可复用 |
| `_defaultItemType` | `string` | 默认子组件类型 |
| `_defaultItem` | `DefaultItemConfig` | 按 type 索引的默认配置 |

### 6.2 池化复用流程

```
add(data)
  → _reuseFromPool(data.type ?? defaultItemType)   // 按 type 匹配池中隐藏项
  → 找到 → update(data) + hidden=false + 移入 _items
  → 没找到 → _createItem(data)                      // 正常创建
```

### 6.3 事件绑定/解绑

```
_bindItemEvents(item)
  → item.component.on(domEvent, callback) → 收集 off 到 item._unsubs
_unbindItemEvents(item)
  → 遍历 item._unsubs 调用 off()
```

## 七、派生组件定义模式

### 各组件配置速查

| 组件 | 基类 | defaultItemType | defaultItem 形式 | 事件 |
|------|------|-----------------|-----------------|------|
| TabBar | Pooled | Toggle | Map | toggle → bridges |
| ButtonGroup | Pooled | Toggle | Map | toggle → bridges |
| Accordion | Pooled | Panel | Map | click → bridges |
| NavItemGroup | Pooled | NavItem | Map | click/close → bridges |
| Menu | Static | MenuItem | Map | click/select → bridges |
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
        defaultItem: {                 // 事件声明
            Toggle: { events: { toggle: { bridges: ['toggle'] } } },
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

## 八、CRUD 工具栏完整示例

```typescript
export let CrudToolbarComponent = ItemGroupStaticComponent.replace({
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

## 九、设计决策记录

### 为什么拆分 Pooled/Static 而不是 itemDestroy 开关？

1. **类型安全** — 池化模式子项必须实现 `update()`，静态模式不需要，混在一个类里无法表达这个约束
2. **API 清晰** — 池化没有 `sort()`/`move()`，静态有，混在一起容易误用
3. **避免隐式行为** — `itemDestroy` 开关让同一个类有两种截然不同的行为模式，容易踩坑

### 为什么生命周期钩子自动链式？

1. **避免遗漏** — 旧模式子类覆写 `onAfterInit` 后基类初始化丢失，`config` 中的默认值不生效
2. **减少样板** — 不再需要每个子类手动 `_initItemGroupComponent(props)`
3. **符合直觉** — 生命周期钩子"先基类后子类"是 OOP 的自然期望

### 为什么用 defaultItem 而不是 eventKey + events？

1. **语义层级不对** — `bridges`/`handler` 是 TplNode 层概念，放在 ItemGroup 配置里层级混乱
2. **两套事件声明** — 子项自身有 TplNode events，ItemGroup 又有 events 列表，容易冲突
3. **无法区分三路分发** — 只知道转发哪些事件名，不知道走 bridges 还是 entities
