# 2026-07-18 事件驱动调度中心重构

## 背景

组件与浮层/实体的交互采用"能力绑定"模式：组件通过 `with([OverlayAbility, OverlayHostAbility, TooltipAbility, EntityCoreAbility])` 引入能力，能力方法混入组件原型，组件直接调用 `this.openOverlay()`、`this.createOverlay()` 等。这导致：

1. **组件负担重**：每个需要浮层的组件都要 import 能力、理解能力 API
2. **耦合严重**：浮层组件（Tips/Menu）深度依赖 OverlayHostAbility 的方法（initOverlayHost/openOverlay/closeOverlay/positionOverlay/acquireZIndex/releaseZIndex）
3. **实例不隔离**：浮层没有区分组件实例，"按钮下拉全部打开"的 bug 根因
4. **创建与管理混杂**：OverlayDispatchCenter 既负责查找组件类创建实例，又负责挂载/定位/z-index/关闭

## 决策

### 1. 事件驱动调度中心模式

引入独立 scopeId 的事件总线（EntityEventBus / OverlayEventBus），组件只通过事件与调度中心交互，不感知调度中心内部实现：

```
组件 → EventBus.emit → 调度中心 → 管理生命周期
```

### 2. 三层职责分离（浮层）

| 层 | 职责 | 实现 |
|---|---|---|
| **组件（声明者）** | 声明浮层类型 + 数据，不知道浮层类 | `body.overlays: { tooltip: { type: 'tips', trigger: 'hover', data: { text: '...' } } }` |
| **InitAbility（创建者）** | trigger 时通过 ComponentRegistrar.get(type) 创建实例 | `new OverlayClass({ anchor, ...data })` |
| **OverlayDispatchCenter（管理者）** | 只管挂载/定位/z-index/关闭 | 从 `data.overlay` 取实例 |

关键设计：
- `type` 字符串通过 ComponentRegistrar 解耦，不同业务可注册同名类型的不同实现
- `data` 支持函数形式获取动态值：`data() { return { text: this.tooltipText } }`
- 调度中心不再创建实例，只从事件数据中取出已创建的 overlay 实例

### 3. 实体调度中心

EntityDispatchCenter 继承 RegistrarBase，register 时监听动作事件，懒创建 mgr：

- `entity-definitions.ts`：entityKey → MgrType 预定义类型
- `validateEntityEvent`：校验事件合法性
- 组件通过 `body.listens` 声明实体事件监听，`entityKey` 字段走 EntityEventBus

### 4. bindEventListen 三路分流

```
entityKey → EntityEventBus（实体数据事件）
source   → EventBridge（组件间桥接事件）
默认      → 组件 scope（组件内部事件）
```

### 5. 浮层组件简化为纯渲染组件

TipsComponent / MenuComponent 不再管理浮层生命周期（定位/z-index/OverlayRoot挂载），只负责渲染内容和提供 open/close 方法供调度中心调用。

MenuItemComponent 的子菜单改用 `OverlayEventBus.overlayEmit('submenu', 'show/hide')` 通知调度中心。

TooltipOverlayAbility 改用 `OverlayEventBus.overlayEmit` 触发 show/hide，不再调用 acquireZIndex/releaseZIndex/openOverlay/closeOverlay/positionOverlay。

### 6. body 特殊 key 和 overlay 配置键集中管理

- `body-keys.ts`：body 特殊 key 统一管理（forwards/overlays/listens 等）
- `overlay-keys.ts`：overlay 配置键定义和校验（type/trigger/placement/offset/data 等）

## 原因

- **事件驱动解耦**：组件不 import 调度中心，只通过事件总线交互
- **创建与管理分离**：组件最清楚"显示什么"，调度中心最清楚"怎么管理"
- **ComponentRegistrar 复用**：已有注册表按类型名查找组件类，不需要额外的 OverlayFactory
- **类型字符串解耦**：组件只声明 `type: 'tips'`，不 import TipsComponent，实现可替换

## 替代方案

1. **组件自己创建浮层实例**：组件 import 浮层类 → 又把依赖拉回来，与 OverlayAbility 耦合问题本质一样
2. **OverlayFactory 独立创建中心**：ComponentRegistrar 已有 `get(name)` 能力，重复造轮子
3. **调度中心创建实例**：调度中心既创建又管理，职责混杂，且需要 prefix/typeOverride/overlayProps 等字段

## 影响范围

### 新增文件
- `src/events/EntityEventBus.ts` — 独立 scopeId 事件总线
- `src/events/OverlayEventBus.ts` — 独立 scopeId 事件总线
- `src/entity/dispatch/EntityDispatchCenter.ts` — 实体调度中心
- `src/entity/dispatch/entity-definitions.ts` — entityKey → MgrType 预定义
- `src/entity/dispatch/index.ts`
- `src/overlay/dispatch/OverlayDispatchCenter.ts` — 浮层调度中心
- `src/overlay/dispatch/overlay-keys.ts` — overlay 配置键定义和校验
- `src/overlay/dispatch/index.ts`
- `src/overlay/index.ts`
- `src/system-abilities/system/EntityEventBusAbility.ts` — 系统能力
- `src/system-abilities/system/OverlayEventBusAbility.ts` — 系统能力
- `src/component-core/body-keys.ts` — body 特殊 key 统一管理

### 删除文件
- `src/component-abilities/entity/` 整个目录（EntityAbility/EntityCoreAbility/EntityEmitAbility/EntityListenAbility/5个组合能力）
- `src/component-core/abilities/EntityCoreAbility.ts`
- `src/component-core/abilities/OverlayAbility.ts`
- `src/component-core/abilities/TooltipAbility.ts`
- `src/component-core/abilities/OverlayHostAbility.ts`
- `src/component-abilities/render/OverlayHostAbility.ts`（re-export）

### 修改文件
- `src/component-core/TemplateComponent.ts` — 能力列表更新，移除已删除能力
- `src/component-core/abilities/InitAbility.ts` — bindEventListen 三路分流，_initOverlays 改用 ComponentRegistrar.get(type) 创建实例
- `src/component-core/abilities/TemplateAbility.ts` — entities 处理
- `src/component-core/layout-types.ts` — EventListen 加 entityKey，OverlayDecl 改用 type + data
- `src/component-core/template-types.ts` — DomEventDecl.entities
- `src/component-core/template-compiler.ts` — DomEventBinding.entities
- `src/component-core/template-json.ts` — 编译 entities 字段
- `src/component-core/content-properties.ts` — 改用 BODY_SPECIAL_KEY_SET
- `src/component-core/index.ts` — 导出更新
- `src/component/tips/TipsComponent.ts` — 纯渲染组件
- `src/component/menu/MenuComponent.ts` — 纯渲染组件
- `src/component/menu/MenuItemComponent.ts` — 移除 OverlayAbility，子菜单走 OverlayEventBus
- `src/component/nav/NavItemComponent.ts` — 移除未使用的 import
- `src/component-abilities/render/TooltipOverlayAbility.ts` — 改用 OverlayEventBus
- `src/component-abilities/render/index.ts` — 移除 OverlayHostAbility 导出
- `src/component-abilities/index.ts` — 移除 OverlayHostAbility 导出

## 后续工作

- imperative 包改造（Toast/Msgbox 走 OverlayEventBus）
- 浮层组件注册：启动时向 ComponentRegistrar 注册默认浮层组件（Tips/Menu/Dropdown/Popover）