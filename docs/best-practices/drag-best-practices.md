# 拖拽（Drags）最佳实践

> 日期：2026-07-20
> 状态：当前有效

## 核心原则

**拖拽是配置驱动的，组件完全不关心拖拽的事。**

组件只需在 `body.drags` 中声明配置，框架自动完成注册、DOM 绑定、生命周期管理。组件不需要：

- 不需要 `DragAbility`
- 不需要 `addEventListener` 绑定 pointer 事件
- 不需要手动管理 `_dragProcessors`
- 不需要 `dragKey` 属性

## 1. 设计思路

### 1.1 为什么 move 不能走事件总线

拖拽的 move 事件是高频的（60fps），走事件总线会有性能问题：

```
每次 pointermove:
  构建 EventContext → emit → 遍历监听器 → 回调
  ≈ 每帧额外 ~0.1ms（16ms 帧预算的 0.6%）
```

单个拖拽源可接受，但多个同时拖拽或复杂场景下会累积。因此：

- **move**：直接调组件的 `onXxxDragMove` 方法，零开销
- **start/end/cancel**：走 DragEventBus 广播，跨组件通信
- **enter/leave/drop**：走 DragEventBus 广播，放置目标感知

### 1.2 为什么用 component.bind 而非 addEventListener

旧 DragAbility 直接用 `el.addEventListener('pointerdown/move/up')`，绕过了 event-dom 层：

| 维度 | addEventListener | component.bind |
|------|-----------------|----------------|
| 跨平台 | ❌ 只支持 pointer | ✅ 自动适配 pointer/touch/mouse |
| 手势识别 | ❌ 需手动判断拖拽距离 | ✅ DragProcessor 自动处理 |
| 生命周期 | ❌ 手动 removeEventListener | ✅ 自动清理 |
| 阶段划分 | ❌ 需手动管理 dragging 状态 | ✅ 自动 emit phase |

`component.bind(el, 'drag')` 走 DragProcessor，自动处理最小拖拽距离（默认 8px），emit 带 phase 的手势事件。

### 1.3 架构对称

拖拽与浮动层架构完全对称：

| 维度 | 浮动层 | 拖拽 |
|------|--------|------|
| 事件总线 | OverlayEventBus + OverlayEventBusAbility | DragEventBus + DragEventBusAbility |
| 调度中心 | OverlayDispatchCenter | DragDispatchCenter |
| 事件常量 | overlay-events.ts | drag-events.ts |
| 声明位置 | body.floats | body.drags |
| 初始化 | initFloats → INIT 事件 | initDrags → handleInit |
| DOM 绑定 | component.bind(anchor, 'click') | component.bind(el, 'drag') |
| overlayKey/dragKey | componentId:nodeName | componentId:nodeName |
| 组件感知 | 组件完全不关心 | 组件完全不关心 |

### 1.4 旧 DragAbility 的问题

1. **`_dragProcessors: undefined` 原型复制失败**：`forge.ts` 的 `flattenAbilities` 跳过非函数、非 getter/setter 的值，`_dragProcessors: undefined` 永远不会被复制到原型。虽然运行时靠 JS 隐式查找兜底，但不是显式声明。

2. **`addEventListener` 绕过 event-dom**：直接用 `el.addEventListener('pointerdown/move/up')`，无法跨平台适配。

3. **手动管理 dragging 状态**：每个拖拽节点都需要闭包维护 `startX/startY/dragging`，DragProcessor 已内置此逻辑。

## 2. 声明方式

在 `body.drags` 中以节点名为 key 声明拖拽配置：

```typescript
export let SortableComponent = TemplateComponent.withTemplate({
    tpl: {
        tag: 'div',
        className: 'q-sortable',
        children: [
            { name: 'handle', tag: 'div', className: 'q-sortable__handle' },
            { name: 'content', tag: 'div' },
        ],
    },
    body: {
        type: 'Sortable',
        drags: {
            handle: { axis: 'y', bounds: 'parent', activeClass: 'q-sortable--dragging' },
        },
        onHandleDragStart(ctx) { /* 拖拽开始 */ },
        onHandleDragMove(ctx) { /* 拖拽移动（高频） */ },
        onHandleDragEnd(ctx) { /* 拖拽结束 */ },
    },
});
```

### drags 配置字段

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `axis` | `'x' \| 'y' \| 'both'` | `'both'` | 拖拽轴向约束 |
| `bounds` | `HTMLElement \| { left?, top?, right?, bottom? } \| string` | — | 拖拽边界约束，`'parent'` 限制在父元素内 |
| `activeClass` | `string` | — | 拖拽时添加的 CSS 类 |
| `grid` | `number` | — | 网格吸附步长（px） |
| `ghost` | `string` | — | 拖拽影子组件类型 |

### key 的含义

drags 的 key 是**节点名**，对应 `nodeMap` 中的节点。调度中心用该节点的 `el` 作为拖拽源：

```typescript
drags: {
    handle: { axis: 'y' },
    //  ↑ key='handle' → 拖拽源 = nodeMap['handle'].el ?? this.el
}
```

如果 key 对应的节点不存在于 nodeMap，则回退到组件根元素 `this.el`。

## 3. 拖拽回调

通过 body 中定义 `on{NodeName}Drag{Phase}` 方法实现：

| 回调 | 触发时机 | 参数 |
|------|---------|------|
| `onHandleDragStart` | 拖拽开始（超过最小距离后） | `{ dx, dy, el, originalEvent }` |
| `onHandleDragMove` | 拖拽移动（高频，本地调用） | `{ dx, dy, el, originalEvent }` |
| `onHandleDragEnd` | 拖拽结束（释放） | `{ el, originalEvent }` |
| `onHandleDragCancel` | 拖拽取消 | `{ el }` |

命名规则：`on` + 节点名首字母大写 + `Drag` + Phase 首字母大写

```typescript
// key='handle' → onHandleDragStart / onHandleDragMove / onHandleDragEnd
// key='thumb'  → onThumbDragStart / onThumbDragMove / onThumbDragEnd
```

## 4. 完整生命周期

```
组件实例化
  │
  ▼
initDrags() ─── 直接调用 ──→ DragDispatchCenter.handleInit()
  │                                      │
  │                                      ├─ 取锚点 el = nodeMap[nodeName].el ?? component.el
  │                                      ├─ 构造 dragKey = componentId:nodeName
  │                                      ├─ 注册 DragDefinition
  │                                      ├─ component.bind(el, 'drag')
  │                                      └─ component.on('dom:drag', handler)
  │
  │                              用户按下并拖动（超过 8px）
  │                                      │
  │                                      ▼
  │                              DragDispatchCenter._bindDragEvents handler
  │                                      │
  │                                      ├─ phase='start'
  │                                      │   ├─ DragEventBus.dragStart(dragKey, state)
  │                                      │   ├─ el.classList.add(activeClass)
  │                                      │   └─ component.onHandleDragStart({ dx, dy, el })
  │                                      │
  │                                      ├─ phase='move'（高频，不走总线）
  │                                      │   └─ component.onHandleDragMove({ dx, dy, el })
  │                                      │
  │                                      ├─ phase='end'
  │                                      │   ├─ DragEventBus.dragEnd(dragKey)
  │                                      │   ├─ el.classList.remove(activeClass)
  │                                      │   └─ component.onHandleDragEnd({ el })
  │                                      │
  │                                      └─ phase='cancel'
  │                                          ├─ DragEventBus.dragCancel(dragKey)
  │                                          ├─ el.classList.remove(activeClass)
  │                                          └─ component.onHandleDragCancel({ el })
  │
  ▼
组件销毁 ──→ DragDispatchCenter.disposeByComponent(componentId)
```

## 5. dragKey 规则

调度中心用 `componentId:nodeName` 作为 dragKey，全局唯一：

```typescript
// 组件 id='sortable-1'，drags key='handle'
dragKey = 'sortable-1:handle'
```

组件实例上**不需要** `dragKey` 属性。调度中心自动从 handleInit 数据中提取 component.id 和 nodeName 构造 dragKey。

## 6. DragEventBus — 跨组件通信

DragEventBus 是独立的 eventScope，只转发低频状态转换事件：

| 事件 | 说明 | 数据 |
|------|------|------|
| `start` | 拖拽开始 | DragState |
| `end` | 拖拽结束 | DragState |
| `cancel` | 拖拽取消 | DragState |
| `enter` | 拖拽进入放置目标 | DragState + dropTarget + dropEl |
| `leave` | 拖拽离开放置目标 | DragState + dropTarget + dropEl |
| `drop` | 放下 | DragState + dropTarget + dropEl |

### 放置目标监听

```typescript
// 放置目标组件
body: {
    onAfterInit() {
        this.dragOn('sortable-1:handle', 'enter', (data) => {
            this.el.classList.add('q-drop-target--active');
        });
        this.dragOn('sortable-1:handle', 'leave', (data) => {
            this.el.classList.remove('q-drop-target--active');
        });
        this.dragOn('sortable-1:handle', 'drop', (data) => {
            this.handleDrop(data.dragData);
        });
    },
}
```

### 全局拖拽状态

```typescript
// 查询当前拖拽状态
this.getActiveDrag();  // DragState | null
this.isDragging();     // boolean
```

DragEventBus 维护全局唯一活跃拖拽，同一时刻只允许一个。

## 7. 事件常量

```typescript
import { DRAG_ACTIONS, DRAG_PHASES } from '@/events/drag-events';

// 请求动作（组件 → 调度中心）
DRAG_ACTIONS.INIT     // 'init'
DRAG_ACTIONS.DISPOSE  // 'dispose'

// 拖拽阶段
DRAG_PHASES.START     // 'start'
DRAG_PHASES.MOVE      // 'move'（本地处理，不走总线）
DRAG_PHASES.END       // 'end'
DRAG_PHASES.CANCEL    // 'cancel'
```

## 8. 三层架构

```
┌─────────────────────────────────────────────────┐
│  组件层（body.drags + onXxxDrag 回调）            │
│  - 声明配置                                       │
│  - 处理 move（高频，本地）                         │
│  - 处理 start/end/cancel（通过回调）              │
├─────────────────────────────────────────────────┤
│  调度中心（DragDispatchCenter）                    │
│  - handleInit：注册 + component.bind + on         │
│  - 区分 phase → 调组件回调 + 广播总线              │
│  - disposeByComponent：组件销毁时清理              │
├─────────────────────────────────────────────────┤
│  事件总线（DragEventBus）                          │
│  - 独立 eventScope                                │
│  - 低频状态转换：start/end/cancel/enter/leave/drop│
│  - 全局唯一活跃拖拽                                │
│  - 跨组件通信（放置目标感知拖拽源）                 │
└─────────────────────────────────────────────────┘
```

## 9. 反模式

### 不要使用 DragAbility

```typescript
// ❌ 错误 — 旧模式，有原型复制和 addEventListener 问题
body: {
    abilities: [DragAbility],
    drags: { handle: { axis: 'y' } },
}

// ✅ 正确 — 配置驱动，调度中心自动管理
body: {
    drags: { handle: { axis: 'y' } },
}
```

### 不要用 addEventListener 绑定拖拽事件

```typescript
// ❌ 错误 — 绕过 event-dom，无法跨平台
el.addEventListener('pointerdown', onPointerDown);
el.addEventListener('pointermove', onPointerMove);
el.addEventListener('pointerup', onPointerUp);

// ✅ 正确 — 调度中心内部使用 component.bind(el, 'drag')
// 组件侧无需任何操作
```

### 不要在组件上定义 dragKey

```typescript
// ❌ 错误 — 不需要 dragKey
body: {
    type: 'Sortable',
    dragKey: 'sortHandle',
}

// ✅ 正确 — 调度中心用 component.id:nodeName 自动生成 dragKey
body: {
    type: 'Sortable',
    drags: { handle: { axis: 'y' } },
}
```

### 不要在 move 回调中做重计算

```typescript
// ❌ 错误 — move 是 60fps，重计算会掉帧
onHandleDragMove(ctx) {
    const layout = this.el.getBoundingClientRect(); // 触发回流
    this.recalculateAllPositions();                  // 重计算
}

// ✅ 正确 — move 只做轻量 DOM 操作，重计算延迟到 end
onHandleDragMove(ctx) {
    this.el.style.transform = `translate(${ctx.dx}px, ${ctx.dy}px)`;
}
onHandleDragEnd(ctx) {
    this.recalculateAllPositions();
}
```

### 不要手动管理拖拽状态

```typescript
// ❌ 错误 — DragProcessor 已内置状态管理
let dragging = false;
let startX = 0, startY = 0;
el.addEventListener('pointerdown', (e) => { startX = e.clientX; ... });

// ✅ 正确 — 调度中心 + DragProcessor 自动管理
body: {
    drags: { handle: { axis: 'y' } },
    onHandleDragStart(ctx) { /* 已超过最小距离，确认拖拽 */ },
    onHandleDragMove(ctx) { /* dx/dy 已计算好 */ },
}
```

## 10. 与旧模式的对比

| 维度 | 旧模式（DragAbility） | 新模式（配置驱动） |
|------|----------------------|-------------------|
| 声明方式 | body.drags + abilities: [DragAbility] | 仅 body.drags |
| DOM 绑定 | addEventListener('pointerdown/move/up') | component.bind(el, 'drag') |
| 状态管理 | 闭包维护 startX/startY/dragging | DragProcessor 自动处理 |
| 原型复制 | `_dragProcessors: undefined` 被跳过 | 无实例属性，调度中心管理 |
| 跨平台 | ❌ 只支持 pointer | ✅ 自动适配 pointer/touch/mouse |
| 最小距离 | 手动判断 | DragProcessor 内置（8px） |
| dragKey | 组件 dragKey 属性 | component.id:nodeName |
| 清理 | onCleanup + _dragProcessors.off() | onCleanup 自动清理（组件不依赖调度中心） |

## 11. 内部实现要点

### handleInit 流程

1. 从 handleInit 参数中提取 `component` 和 `drags`
2. 注册 `component.onCleanup(() => this.disposeByComponent(componentId))`（组件销毁时自动清理外部资源）
3. 遍历 drags，对每个 nodeName：
   - 取拖拽源：`component.nodeMap[nodeName]?.el ?? component.el`
   - 构造 dragKey：`componentId:nodeName`
   - 注册 DragDefinition
4. `component.bind(el, 'drag')` — 走 DragProcessor，跨平台
5. `component.on('dom:drag', handler)` — 接收带 phase 的手势事件
6. handler 中根据 phase 分发：
   - `start` → DragEventBus.dragStart + 组件回调
   - `move` → 仅组件回调（不走总线）
   - `end` → DragEventBus.dragEnd + 组件回调
   - `cancel` → DragEventBus.dragCancel + 组件回调

### 多拖拽节点区分

`component.on('dom:drag')` 是全局监听，通过 `originalEvent.target` 判断是否属于当前拖拽源元素：

```typescript
if (gesture.originalEvent?.target !== el && !el.contains(gesture.originalEvent?.target)) {
    return; // 不是当前拖拽源的事件，跳过
}
```

### initDrags 时机

在 `initFromTemplate` 中，`initDrags` 在 `initFloats` 之后、`bindDomEventBindings` 之前执行，确保 nodeMap 和子组件已就绪。

### 组件销毁时的自动清理

组件 dispose 时，清理分为两层，**组件完全不需要知道调度中心的存在**：

| 清理层 | 负责者 | 清理内容 |
|--------|--------|----------|
| 组件自身 | eventScope.dispose() | `component.bind(el, 'drag')` 的 DOM 事件解绑、`component.on('dom:drag')` 的监听移除 |
| 调度中心 | onCleanup 回调 | DragEventBus 的 activeDrag 状态清理、instances map 条目移除、activeClass 移除 |

时序：`ComposableBase.dispose()` 按注册逆序执行 cleanup → eventScope 的 cleanup 先注册所以后执行 → 调度中心的 cleanup 后注册所以先执行。调度中心先清理外部资源，然后组件自身的绑定才被解绑。