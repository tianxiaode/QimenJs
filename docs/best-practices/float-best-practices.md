# 浮动层（Floats）最佳实践

> 日期：2026-07-20
> 状态：当前有效

## 核心原则

**浮动层是配置驱动的，组件完全不关心浮动层的事。**

组件只需在 `body.floats` 中声明配置，框架自动完成注册、DOM 绑定、生命周期管理。组件不需要：

- 不需要 `floatKey`
- 不需要 `addEventListener` 绑定触发事件
- 不需要订阅浮层反馈（shown/hidden）
- 不需要在 `events` 中声明 `floats`

## 1. 声明方式

在 `body.floats` 中以节点名为 key 声明浮动层配置：

```typescript
export let DropdownComponent = ButtonComponent.replace({
    type: 'Dropdown',
    cls: 'q-dropdown',
    nodeOverrides: {
        dropIcon: { hidden: false },
    },
    body: {
        floats: {
            dropIcon: { type: 'Menu', trigger: 'click', placement: 'bottom' },
        },
    },
});
```

### floats 配置字段

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `string` | — | 浮层组件类型（必填） |
| `trigger` | `string \| string[]` | `'click'` | 触发方式：`click` / `hover` / `focus` / `manual` / `always` |
| `placement` | `Placement` | `'bottom'` | 定位方向：`top` / `bottom` / `left` / `right` 及其变体 |
| `offset` | `number` | `4` | 与锚点的间距（px） |
| `closeOnClickOutside` | `boolean` | `true` | 点击外部是否关闭 |
| `closeOnEscape` | `boolean` | `true` | 按 Escape 是否关闭 |
| `mask` | `boolean \| string` | `false` | 是否显示遮罩，字符串为自定义颜色 |
| `data` | `Record \| () => Record` | — | 传给浮层的数据 |

### key 的含义

floats 的 key 是**节点名**，对应 `nodeMap` 中的节点。调度中心用该节点的 `el` 作为锚点：

```typescript
floats: {
    dropIcon: { type: 'Menu', trigger: 'click' },
    //  ↑ key='dropIcon' → 锚点 = nodeMap['dropIcon'].el ?? this.el
}
```

如果 key 对应的节点不存在于 nodeMap，则回退到组件根元素 `this.el` 作为锚点。

## 2. 完整生命周期

```
组件实例化
  │
  ▼
initFloats() ─── 发 INIT 事件 ──→ OverlayDispatchCenter._handleInit()
  │                                      │
  │                                      ├─ 注册 OverlayDefinition（overlayKey = componentId:nodeName）
  │                                      ├─ 按 trigger 绑定 DOM 事件（用 component.bind）
  │                                      └─ 等待用户交互
  │
  │                              用户点击/悬停/聚焦锚点
  │                                      │
  │                                      ▼
  │                              OverlayDispatchCenter._mountAndShow()
  │                                      │
  │                                      ├─ 创建浮层实例
  │                                      ├─ 定位（positionOverlay）
  │                                      ├─ 挂载到 OverlayRoot
  │                                      ├─ 绑定 clickOutside / escape
  │                                      └─ 发 shown 反馈事件
  │
  │                              用户关闭浮层
  │                                      │
  │                                      ▼
  │                              OverlayDispatchCenter._closeOverlay()
  │                                      │
  │                                      ├─ 解绑 clickOutside / escape
  │                                      ├─ 从 OverlayRoot 卸载
  │                                      └─ 发 hidden 反馈事件
  │
  ▼
组件销毁 ──→ OverlayDispatchCenter.disposeByComponent(componentId)
```

## 3. overlayKey 规则

调度中心用 `componentId:nodeName` 作为 overlayKey，全局唯一：

```typescript
// 组件 id='dropdown-1'，floats key='dropIcon'
overlayKey = 'dropdown-1:dropIcon'
```

组件实例上**不需要** `floatKey` 属性。调度中心自动从 INIT 事件数据中提取 component.id 和 nodeName 构造 overlayKey。

## 4. trigger 类型与行为

| trigger | 绑定事件 | 显示动作 | 隐藏动作 |
|---------|---------|---------|---------|
| `click` | `click` | TOGGLE（切换） | 同 TOGGLE |
| `hover` | `mouseenter` / `mouseleave` | SHOW | HIDE |
| `focus` | `focus` / `blur` | SHOW | HIDE |
| `manual` | 无 | 需手动调用 | 需手动调用 |
| `always` | 无 | 初始化即显示 | 不自动隐藏 |

支持数组形式组合触发：

```typescript
floats: {
    tooltip: { type: 'Tooltip', trigger: ['hover', 'focus'], placement: 'top' },
}
```

## 5. 手动控制浮层

`manual` 模式下，组件可通过 OverlayEventBus 手动触发：

```typescript
import { OverlayEventBus } from '@/events/OverlayEventBus';
import { OVERLAY_ACTIONS } from '@/events/overlay-events';
import { EventContextBuilder } from '@/context';

const bus = OverlayEventBus.getInstance();
const overlayKey = `${this.id}:myFloat`;

// 显示
bus.overlayEmit(
    EventContextBuilder.create()
        .withEvent(`overlay:${overlayKey}:${OVERLAY_ACTIONS.SHOW}`)
        .withType(OVERLAY_ACTIONS.SHOW)
        .withSource(overlayKey)
        .withData({ component: this, anchor: this.nodeMap.myFloat.el, overlay: myOverlay })
        .build()
);

// 隐藏
bus.overlayEmit(
    EventContextBuilder.create()
        .withEvent(`overlay:${overlayKey}:${OVERLAY_ACTIONS.HIDE}`)
        .withType(OVERLAY_ACTIONS.HIDE)
        .withSource(overlayKey)
        .withData({ component: this })
        .build()
);
```

## 6. 浮层内语义事件

浮层内的交互事件（如 MenuItem 点击）**不走浮层反馈**，走 bridges 通知组件：

```typescript
// Menu 组件的 MenuItem 点击 → 走 bridges
export let MenuComponent = ItemGroupComponent.replace({
    type: 'Menu',
    config: {
        itemType: 'MenuItem',
        defaultItem: { events: { click: { bridges: ['click'] } } },
    },
    body: {
        onAfterInit() {
            this.on('click', (data) => {
                // 处理菜单项点击
            });
        },
    },
});
```

浮层反馈事件（shown/hidden/changed）仅用于感知浮层状态，不承载业务语义。

## 7. 事件常量

所有浮层事件使用常量，不硬编码字符串：

```typescript
import { OVERLAY_ACTIONS, OVERLAY_FEEDBACK_EVENTS } from '@/events/overlay-events';

// 请求动作（组件 → 调度中心）
OVERLAY_ACTIONS.INIT       // 'init'
OVERLAY_ACTIONS.SHOW       // 'show'
OVERLAY_ACTIONS.HIDE       // 'hide'
OVERLAY_ACTIONS.TOGGLE     // 'toggle'
OVERLAY_ACTIONS.REPOSITION // 'reposition'
OVERLAY_ACTIONS.CHANGE     // 'change'
OVERLAY_ACTIONS.DISPOSE    // 'dispose'

// 反馈事件（调度中心 → 组件）
OVERLAY_FEEDBACK_EVENTS.SHOWN   // 'shown'
OVERLAY_FEEDBACK_EVENTS.HIDDEN  // 'hidden'
OVERLAY_FEEDBACK_EVENTS.CHANGED // 'changed'
```

## 8. 反模式

### 不要在 events 中声明 floats

```typescript
// ❌ 错误 — floats 不属于事件声明
{
    tpl: {
        root: { events: { click: { floats: ['menu'] } } },
    },
}

// ✅ 正确 — floats 在 body 中声明
{
    tpl: { ... },
    body: {
        floats: { menu: { type: 'Menu', trigger: 'click' } },
    },
}
```

### 不要在组件中手动绑定浮层触发事件

```typescript
// ❌ 错误 — 组件不应关心浮层触发
this.bind(this.el, 'click');
this.on('click', () => { overlay.show(); });

// ✅ 正确 — 调度中心根据 floats 配置自动绑定
body: {
    floats: { menu: { type: 'Menu', trigger: 'click' } },
}
```

### 不要在组件上定义 floatKey

```typescript
// ❌ 错误 — 不需要 floatKey
body: {
    type: 'Dropdown',
    floatKey: 'dropMenu',
}

// ✅ 正确 — 调度中心用 component.id:nodeName 自动生成 overlayKey
body: {
    type: 'Dropdown',
    floats: { dropMenu: { type: 'Menu', trigger: 'click' } },
}
```

### 不要订阅浮层反馈来处理业务逻辑

```typescript
// ❌ 错误 — 浮层反馈不是业务通道
this.on('overlay:shown', () => { this.loadData(); });

// ✅ 正确 — 业务事件走 bridges
this.on('click', (data) => { this.handleItemClick(data); });
```

### 不要用 addEventListener 绑定浮层相关 DOM 事件

```typescript
// ❌ 错误 — 绕过 event-dom，无法跨平台
this.el.addEventListener('click', handler);

// ✅ 正确 — 调度中心内部使用 component.bind，自动适配
// 组件侧无需任何操作
```

## 9. 与旧模式的对比

| 维度 | 旧模式 | 新模式（配置驱动） |
|------|--------|-------------------|
| 声明位置 | DomEventDecl.floats + body.floats | 仅 body.floats |
| 触发绑定 | 组件手动 addEventListener | 调度中心自动 component.bind |
| overlayKey | 组件 floatKey 属性 | component.id:nodeName |
| 反馈订阅 | 组件订阅 shown/hidden | 调度中心内部管理 |
| 事件常量 | 硬编码字符串 | OVERLAY_ACTIONS / OVERLAY_FEEDBACK_EVENTS |
| 组件感知 | 组件知道浮层存在 | 组件完全不关心 |

## 10. replace 中的 floats

通过 `replace` 派生组件时，`body.floats` 会与基类合并（基类 floats 被覆盖）：

```typescript
// 基类无 floats
export let ButtonComponent = TemplateComponent.withTemplate({
    tpl: { ... },
    body: { type: 'Button' },
});

// 派生类添加 floats
export let DropdownComponent = ButtonComponent.replace({
    type: 'Dropdown',
    cls: 'q-dropdown',
    nodeOverrides: {
        dropIcon: { hidden: false },
    },
    body: {
        floats: {
            dropIcon: { type: 'Menu', trigger: 'click', placement: 'bottom' },
        },
    },
});
```

## 11. 内部实现要点

### _handleInit 流程

1. 从 INIT 事件数据中提取 `component` 和 `floats`
2. 注册 `component.onCleanup(() => this.disposeByComponent(componentId))`（组件销毁时自动清理外部资源）
3. 遍历 floats，对每个 nodeName：
   - 取锚点：`component.nodeMap[nodeName]?.el ?? component.el`
   - 构造 overlayKey：`componentId:nodeName`
   - 注册 OverlayDefinition
4. 按 trigger 绑定 DOM 事件（使用 `component.bind` + `component.on`）
5. DOM 事件触发时，通过 OverlayEventBus 发送 SHOW/TOGGLE/HIDE 动作

### 组件销毁时的自动清理

组件 dispose 时，清理分为两层，**组件完全不需要知道调度中心的存在**：

| 清理层 | 负责者 | 清理内容 |
|--------|--------|----------|
| 组件自身 | eventScope.dispose() | `component.bind` 的 DOM 事件解绑、`component.on` 的监听移除 |
| 调度中心 | onCleanup 回调 | OverlayRoot 上的浮层 DOM 卸载、mask 释放、document 级 clickOutside/escape 解绑 |

时序：`ComposableBase.dispose()` 按注册逆序执行 cleanup → eventScope 的 cleanup 先注册所以后执行 → 调度中心的 cleanup 后注册所以先执行。调度中心先清理外部资源，然后组件自身的绑定才被解绑。

### initFloats 时机

在 `initFromTemplate` 中，`initFloats` 在 `renderChildComponents` 之后、`bindDomEventBindings` 之前执行，确保 nodeMap 和子组件已就绪。