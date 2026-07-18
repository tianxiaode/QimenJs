# 2026-07-18 事件驱动调度中心重构

## 背景

组件与浮层/实体的交互采用"能力绑定"模式：组件通过 `with([OverlayAbility, OverlayHostAbility, TooltipAbility, EntityCoreAbility])` 引入能力，能力方法混入组件原型，组件直接调用 `this.openOverlay()`、`this.createOverlay()` 等。这导致：

1. **组件负担重**：每个需要浮层的组件都要 import 能力、理解能力 API
2. **耦合严重**：浮层组件（Tips/Menu）深度依赖 OverlayHostAbility 的方法（initOverlayHost/openOverlay/closeOverlay/positionOverlay/acquireZIndex/releaseZIndex）
3. **实例不隔离**：浮层没有区分组件实例，"按钮下拉全部打开"的 bug 根因
4. **创建与管理混杂**：OverlayDispatchCenter 既负责查找组件类创建实例，又负责挂载/定位/z-index/关闭

## 决策

### 1. 事件驱动调度中心模式

引入独立 scopeId 的事件总线（EntityEventBus / OverlayEventBus / DragEventBus），组件只通过事件与调度中心交互，不感知调度中心内部实现：

```
组件 → EventBus.emit → 调度中心 → 管理生命周期
```

### 2. 三层职责分离（浮层）

| 层 | 职责 | 实现 |
|---|---|---|
| **组件（声明者）** | 声明浮层类型 + 数据，不知道浮层类 | `body.overlays: { tooltip: { type: 'tips', trigger: 'hover', data: { text: '...' } } }` |
| **InitAbility（创建者）** | trigger 时通过 ComponentRegistrar.get(type) 创建实例 | `new OverlayClass({ anchor, ...data })` |
| **OverlayDispatchCenter（管理者）** | 只管挂载/定位/z-index/关闭/遮罩 | 从 `data.overlay` 取实例 |

### 3. 实体调度中心

EntityDispatchCenter 继承 RegistrarBase，register 时监听动作事件，懒创建 mgr。

### 4. bindEventListen 四路分流（优先级从高到低）

1. entityKey → EntityEventBus（实体数据事件）
2. dragKey → DragEventBus（拖拽状态转换事件）
3. source → EventBridge（组件间桥接事件）
4. 默认 → 组件 scope（组件内部事件）

### 5. 浮层组件简化为纯渲染组件

TipsComponent / BadgeComponent / LoadingComponent 不再管理浮层生命周期，只负责渲染内容。
显隐通过 `hidden` 属性，内容更新通过自动生成的属性 setter，数据变更通过 `onOverlayChange(data)`。

### 6. body 特殊 key 和 overlay 配置键集中管理

- `body-keys.ts`：body 特殊 key 统一管理（forwards/overlays/drags/listens 等）
- `overlay-keys.ts`：overlay 配置键定义和校验（type/trigger/placement/offset/data/mask/onOverlayChange 等）

### 7. 拖拽调度中心

DragEventBus 与 OverlayEventBus 同模式，单例 + 独立 eventScope，事件编码 `drag:{dragKey}:{action}`。

核心设计：
- **调度中心只管状态转换**：start / enter / leave / drop / cancel / end
- **move 不走调度中心**：拖拽源的视觉反馈是本地行为，调度中心不关心"移动过程"，只关心"是否放下"
- **全局拖拽状态统一管理**：activeDrag 维护当前拖拽源信息，同一时刻只允许一个活跃拖拽
- **放置目标不再依赖 HTML5 DnD API**：通过 pointermove 检测重叠

数据流：
```
body.drags → InitAbility._initDrags → dragEventBus.dragStart/End/Cancel
body.listens.dragKey → bindEventListen → DragEventBus.dragOn
```

### 8. 拖拽声明式定义（去除 DragAbility / DropAbility）

拖拽从能力驱动改为声明式，与 overlays / entityKey 模式统一：

**拖拽源**：body.drags 声明式定义
```ts
drags: {
    cardItem: { type: 'task', data() { return { id: this.taskId } }, axis: 'y', activeClass: 'dragging' }
}
```

**放置目标**：body.listens.dragKey 声明式监听
```ts
listens: [{
    dragKey: 'cardItem',
    events: { drop: 'onCardDrop', enter: 'onCardEnter', leave: 'onCardLeave' }
}]
```

### 9. Badge 合并到浮层调度中心

Badge 本质是浮动层，合并到 overlays 统一管理：

```ts
overlays: {
    myBadge: { type: 'badge', trigger: 'always', placement: 'top-right', data: { text: '3' } }
}
```

- **trigger: 'always'**：初始化时直接创建并显示
- **显隐控制**：通过 `overlayEmit('hide'/'show')` 控制，badge 为 0 时隐藏
- **placement 配置**：微调显示位置，不再硬编码 CSS
- **trigger: 'always' 时跳过 clickOutside/escape**

### 10. OverlayDispatchCenter 实例隔离与组件销毁联动

- **实例隔离**：overlayKey 改为 `componentId:overlayKey` 复合 key
- **组件销毁联动**：`disposeByComponent(componentId)`，onCleanup 中自动调用
- **getOverlay 接口变更**：`getOverlay(componentId, overlayKey)`

### 11. 浮层 change 事件与 onOverlayChange 更新机制

- **change action**：`overlayEmit('myBadge', 'change', { component: this, data: { text: 5 } })`
- **onOverlayChange**：浮层组件默认实现，用 `this.text` / `this.hidden` 更新
- **配置覆盖**：overlay 声明中 `onOverlayChange(overlay, data)` 覆盖默认行为
- **changed 事件**：调度中心广播 `changed` 事件供其他监听方使用

### 12. 遮罩管理（mask）

OverlayDispatchCenter 内置遮罩管理：
- overlay 声明 `mask: true`（默认遮罩）或 `mask: 'rgba(255,255,255,0.7)'`（自定义颜色）
- `_acquireMask` / `_releaseMask` 引用计数，多个浮层共享同一遮罩
- `mask: true` 时自动跳过 clickOutside（遮罩本身拦截点击）
- ZIndexLevel 新增 `mask: 1040`

### 13. Loading 浮层组件

LoadingAbility 改为 LoadingComponent 浮层组件，走 overlays 声明式：

```ts
overlays: {
    myLoading: {
        type: 'loading',
        trigger: 'manual',
        mask: 'rgba(255, 255, 255, 0.7)',
        data: { text: '加载中...', spinner: 'ring' }
    }
}
```

### 14. 浮层包内聚（src/overlay/）

浮层相关代码全部内聚到 `src/overlay/` 包：

```
src/overlay/
├── OverlayRoot.ts              # 浮层根容器
├── FloatingLayerAbility.ts     # 命令式浮层能力（Toast/Msgbox 用）
├── index.ts
└── dispatch/
    ├── OverlayDispatchCenter.ts # 调度中心
    ├── OverlayEventBus.ts       # 浮层事件总线
    ├── overlay-keys.ts          # 配置校验
    └── positionOverlay.ts       # 定位计算
```

从 `src/component/` 移出：OverlayRoot.ts
从 `src/component-core/abilities/` 移出：positionOverlay.ts
从 `src/component-abilities/render/` 移出：FloatingLayerAbility.ts

### 15. 已删除的能力和文件

| 删除 | 原因 |
|---|---|
| DragAbility / DropAbility | 改为 body.drags + body.listens.dragKey 声明式 |
| BadgeAbility | 合并到 overlays，trigger: 'always' |
| LoadingAbility | 改为 LoadingComponent 浮层组件 |
| OverlayMaskAbility | 遮罩管理内聚到 OverlayDispatchCenter |
| TooltipOverlayAbility | 改为 overlays 声明式 |

## 后续工作

- imperative 包改造（Toast/Msgbox 走 OverlayEventBus）
- 浮层组件注册：启动时向 ComponentRegistrar 注册默认浮层组件（Tips/Menu/Dropdown/Popover/Badge/Loading）
