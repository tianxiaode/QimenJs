# QimenJS 组件能力索引

> 最后更新：2026-07-10
>
> 本文档记录组件层（L5）的完整结构，包括组件-能力映射、事件体系、实体管理器等。
> 每次功能变更后请更新对应章节，避免全量扫描。

---

## 1. 组件-能力映射表

### 1.1 组件继承体系

```
ComposableBase (src/composable/ComposableBase.ts)
  └── ComponentBase (src/component-core/ComponentBase.ts)
        ├── ButtonComponent
        ├── InputComponent
        ├── SelectComponent
        ├── IconComponent / TextComponent
        ├── HBoxComponent / VBoxComponent / GridComponent / SpaceComponent
        ├── ToolbarComponent
        ├── ButtonGroupComponent / SeparatorComponent
        ├── TableComponent
        ├── FormComponent
        ├── DialogComponent
        ├── BadgeComponent
        └── ColumnBase → IdColumn / NumberColumn / CheckboxColumn
```

### 1.2 组件能力组合

| 组件 | 文件 | 能力列表 |
|------|------|----------|
| ButtonComponent | `src/component/components/ButtonComponent.ts` | IconAbility, TextAbility, ClickAbility, DisableAbility, LoadingAbility, SizeAbility |
| InputComponent | `src/component/components/InputComponent.ts` | TextAbility, ValueAbility, ValidateAbility, PlaceholderAbility, DisableAbility, SizeAbility |
| SelectComponent | `src/component/components/SelectComponent.ts` | TextAbility, ValueAbility, OptionsAbility, SearchAbility, DisableAbility, SizeAbility |
| HBoxComponent | `src/component/components/HBoxComponent.ts` | LayoutAbility, ChildrenAbility, AnimationAbility |
| VBoxComponent | `src/component/components/VBoxComponent.ts` | LayoutAbility, ChildrenAbility, AnimationAbility |
| GridComponent | `src/component/components/GridComponent.ts` | LayoutAbility, ChildrenAbility, AnimationAbility |
| SpaceComponent | `src/component/components/SpaceComponent.ts` | LayoutAbility |
| ToolbarComponent | `src/component/components/ToolbarComponent.ts` | LayoutAbility, ChildrenAbility, AnimationAbility, ToolbarAbility |
| IconComponent | `src/component/components/IconComponent.ts` | SizeAbility（图标内容由组件直接管理，无需 IconAbility） |
| TextComponent | `src/component/components/TextComponent.ts` | SizeAbility（文本内容由组件直接管理，无需 TextAbility） |
| ButtonGroupComponent | `src/component/components/ButtonGroupComponent.ts` | ChildrenAbility, SizeAbility, DisableAbility |
| SeparatorComponent | `src/component/components/SeparatorComponent.ts` | VisibleAbility |
| TableComponent | `src/component/components/TableComponent.ts` | EntityAbility, VirtualListAbility, SortAbility, ColumnAbility, ColumnManageAbility, ChildrenAbility |
| FormComponent | `src/component/components/FormComponent.ts` | EntityAbility, ValidateAbility, SubmitAbility, FieldSetAbility |
| DialogComponent | `src/component/components/DialogComponent.ts` | TextAbility, OpenableAbility, OverlayAbility, AnimationAbility |
| BadgeComponent | `src/component/badge/BadgeComponent.ts` | ContentAbility（角标文本） |
| ColumnBase | `src/component/components/ColumnBase.ts` | TextAbility, VisibleAbility, DisableAbility, SortAbility |
| IdColumn | `src/component/components/IdColumn.ts` | 继承 ColumnBase |
| NumberColumn | `src/component/components/NumberColumn.ts` | 继承 ColumnBase |
| CheckboxColumn | `src/component/components/CheckboxColumn.ts` | 继承 ColumnBase + SelectableAbility |

### 1.3 ComponentBase 内置能力

ComponentBase 通过 BASE_ABILITIES 自动注入以下能力（所有组件都拥有）：

| 能力 | 接口 | 文件 | 说明 |
|------|------|------|------|
| EventAbility | IEventAbility | `src/system-abilities/system/EventAbility.ts` | 事件发布/订阅 |
| DomEventsAbility | IDomEventsAbility | `src/system-abilities/dom/DomEventsAbility.ts` | DOM 事件适配（含 onDom） |
| ThemeAbility | IThemeAbility | `src/component-core/abilities/ThemeAbility.ts` | 主题感知 |
| StyleAbility | IStyleAbility | `src/component-core/abilities/StyleAbility.ts` | 样式管理 |
| EventBridgeAbility | IEventBridgeAbility | `src/component-core/abilities/EventBridgeAbility.ts` | 声明式事件桥接（含 navigate） |
| RenderAbility | IRenderAbility | `src/component-core/abilities/RenderAbility.ts` | 模板注入与切换 |
| LifecycleAbility | ILifecycleAbility | `src/component-core/abilities/LifecycleAbility.ts` | 挂载/卸载/销毁/组件树 |
| PositionAbility | IPositionAbility | `src/component-core/abilities/PositionAbility.ts` | 位置/尺寸/约束/视觉（x/y/top/left/width/height/margin/padding/max*/min*/scrollable/center/hideMode/alwaysOnTop/fullscreen/shadow/tabIndex/zIndex） |
| ChildrenAbility | IChildrenAbility | `src/component-abilities/children/ChildrenAbility.ts` | 子组件管理/渲染（add/remove/removeAll，按需声明） |

### 1.4 按需能力（组件通过 static abilities 声明）

| 能力 | 接口 | 文件 | 说明 |
|------|------|------|------|
| StateAbility | IStateAbility | `src/component-core/abilities/StateAbility.ts` | 响应式更新（markDirty + update） |
| ContentAbility | IContentAbility | `src/component-abilities/content/ContentAbility.ts` | 内容位管理（图标/文本/浮层） |

### 1.5 能力接口定义

> 2026-07-08 重构：从 ComponentBase 抽出 RenderAbility、LifecycleAbility、StateAbility，
> ComponentBase 只保留身份属性（cid/id/type/props）和能力收集/初始化骨架。

#### IRenderAbility — 渲染能力

```typescript
interface IRenderAbility {
    /** 组件根 DOM 元素 */
    readonly el: HTMLElement;

    /** 重新初始化元素内容（切换模板） */
    reinitElement(templateId?: string): void;
}
```

- `el` 创建在 constructor 中（`document.createElement`），不经过 `__initProps`
- 模板注入在 `__initProps` 中（从 TemplateRegistrar 获取 → `el.innerHTML`）
- `reinitElement` 切换模板时使用，修复了旧版修改 static templateId 的 bug

#### ILifecycleAbility — 生命周期能力

```typescript
interface ILifecycleAbility {
    /** 是否已挂载 */
    readonly mounted: boolean;

    /** 是否已销毁 */
    readonly destroyed: boolean;

    /** 父组件引用 */
    parent: ComponentBase | null;

    /** 挂载到目标容器 */
    mount(container: HTMLElement | string): void;

    /** 从 DOM 卸载 */
    unmount(): void;

    /** 销毁组件 */
    dispose(): void;

    /** 沿父链查找祖先组件 */
    up(type: string): ComponentBase | null;
}
```

- `mount` 负责：DOM 挂载 + ComponentManager 注册 + Q_COMPONENT_REF/Q_DATA_ID + initAbilitiesFromProps
- `dispose` 负责：ComponentManager 注销 + DOM 引用清理 + parent 清除 + super.dispose()
- `up` 从 ComponentBase 移入，语义上与组件树导航配套

#### IStateAbility — 状态能力

```typescript
interface IStateAbility {
    /** 更新组件（由子类实现具体逻辑） */
    update(props?: Record<string, any>): void;

    /** 标记需要更新，同一微任务内只执行一次 update */
    markDirty(): void;
}
```

- 不是所有组件都需要：Separator、Space 等静态组件不需要
- 需要 markDirty 的能力：ValueAbility、ContentAbility、VirtualListAbility、ColumnAbility、OptionsAbility

#### IStyleAbility — 样式能力

```typescript
interface IStyleAbility {
    className: string;
    style: Record<string, string> | undefined;

    addClass(name: string): void;
    removeClass(name: string): void;
    toggleClass(name: string, force?: boolean): void;
    hasClass(name: string): boolean;
    replaceClass(oldName: string, newName: string): void;

    setStyle(propOrProps: string | Record<string, string>, value?: string): any;
    getStyle(prop: string): string;
    removeStyle(prop: string): void;

    setAttribute(attr: string, value: string): void;
    getAttribute(attr: string): string | null;
    removeAttribute(attr: string): void;
}
```

#### IThemeAbility — 主题能力

```typescript
interface IThemeAbility {
    /** 主题变更回调 */
    onThemeChange?(event: any): void;
}
```

#### IContentAbility — 内容能力（已移除）

> IContentAbility 接口已删除。i18n 刷新功能由 NodeMapAbility 的 `refreshI18n()`/`getI18nKeys()` 提供，
> 浮层管理由 OverlayAbility 的 `createOverlay()`/`initTooltipOverlay()` 提供。

#### IEventBridgeAbility — 事件桥接能力

```typescript
interface IEventBridgeAbility {
    /** 事件桥接配置 */
    eventBridge: Record<string, any>;

    /** 初始化事件桥接 */
    initEventBridge(): void;
}
```

### 1.6 重构后 ComponentBase 骨架

重构后 ComponentBase 只保留身份属性和能力收集/初始化骨架：

```typescript
export class ComponentBase extends ComposableBase {
    static override readonly abilities: readonly AbilityDefinition[] = [];

    readonly cid: string;
    id: string | undefined;
    type: string = '';
    readonly props: Record<string, any>;

    constructor(props?: Record<string, any>) {
        super();
        this.cid = string.getId('q-comp');
        this.props = props || {};
        if (this.props.id) this.id = this.props.id;
        if (this.props.type) this.type = this.props.type;
    }

    protected override collectAbilities(): AbilityDefinition[] { /* 合并 BASE_ABILITIES */ }
    protected override applyOverrides(): void { /* PropAlias */ }
}
```

其余功能全部由 BASE_ABILITIES 中的能力提供：
- `el` / `reinitElement` → RenderAbility
- `mount` / `unmount` / `dispose` / `mounted` / `destroyed` / `parent` / `up` → LifecycleAbility
- `update` / `markDirty` → StateAbility（按需，非 BASE）

### 1.7 事件绑定链路

组件有三种事件绑定机制，分别在不同层级处理：

#### 机制一：handlers（发送方声明，renderer 绑定）

Layout JSON 中通过 `handlers` 字段声明 DOM 事件映射，renderer 的 bind-handler 处理器负责解析和绑定。

```
LayoutNode.handlers
  → renderer/bind-handler.ts 解析
  → component.onDom(event, handler) 绑定到 el
  → EventBindingAbility.onDom() 封装 addEventListener + 自动清理
```

handlers 支持三种形式：

| 形式 | 示例 | 绑定方式 |
|------|------|----------|
| 字符串 | `{ click: "onDelete" }` | 从 RenderContext.handlers 查找函数，onDom 绑定 |
| HandlerAction | `{ click: { action: "close", target: "dialog1" } }` | onDom 绑定，触发时执行内置动作分发 |
| 函数 | `{ click: (cmp, e) => {} }` | bind 到组件后 onDom 绑定 |

**关键依赖**：renderer 调用 `component.onDom()`，这是 EventBindingAbility 提供的方法。
EventBindingAbility 当前标记为 @deprecated，但 renderer 仍在使用，重构时需要决定：
- 保留 onDom 并归入 IDomEventsAbility
- 或将 renderer 迁移到 DomEventsAbility.bind()

#### 机制二：stateTriggers（接收方声明，renderer 绑定）

Layout JSON 中通过 `stateTriggers` 字段声明监听哪些事件源的哪些事件，renderer 的 mount 处理器负责绑定到 globalEventBus。

```
LayoutNode.stateTriggers
  → renderer/mount.ts bindStateTriggers() 解析
  → globalEventBus.on(source:type, handler) 绑定
  → handler 中调用 component[methodName](eventContext)
  → 组件销毁时 onCleanup 自动解绑
```

示例：

```json
{
    "type": "Table",
    "id": "userTable",
    "stateTriggers": [
        { "source": "toolbar", "events": { "pageChange": "onPageChange", "crudAction": "onCrudAction" } }
    ]
}
```

#### 机制三：eventBridge（接收方声明，能力自动绑定）

组件通过 props.eventBridge 配置声明监听哪个组件的什么事件，EventBridgeAbility 在 `__initProps` 中自动绑定。

```
props.eventBridge
  → EventBridgeAbility.__initProps() 解析
  → queueMicrotask → initEventBridge()
  → ComponentManager.get(sourceId) 查找源组件
  → source.on(event, handler) 在源组件上注册监听
  → onCleanup 自动解绑
```

内置桥接类型：

| key | 监听事件 | 调用方法 |
|-----|----------|----------|
| pagination | PAGINATION_EVENTS.CHANGE | onPageChange |
| crud | CRUD_EVENTS.ACTION | onCreate/onEdit/onDelete/... |
| selection | SELECTION_EVENTS.CHANGE | onSelectionChange |
| search | SEARCH_EVENTS.CHANGE | onSearchChange |
| navigate | NAVIGATE_EVENTS.CHANGE | onNavigate |
| 自定义 | 自定义 event | 自定义 handler |

#### 三种机制对比

| 机制 | 视角 | 绑定位置 | 事件源 | 适用场景 |
|------|------|----------|--------|----------|
| handlers | 发送方 | renderer bind-handler | DOM 事件 | 简单 UI 交互（click/input/submit） |
| stateTriggers | 接收方 | renderer mount | globalEventBus | 组件联动 + 数据联动 + 全局状态 |
| eventBridge | 接收方 | EventBridgeAbility | 源组件的 on() | 声明式组件间事件桥接 |

**底层统一**：handlers 最终走 onDom（addEventListener），stateTriggers 和 eventBridge 最终走 globalEventBus.on（EventBus）。

### 1.8 内部渲染模型

> 2026-07-08 设计：组件内部递归渲染，不依赖外部 renderer。

#### 核心思路

组件自己负责渲染子组件，从根组件开始逐层递归。不再由外部 renderer 驱动。

```
app.start()
    ↓
new RootComponent()              // 根组件，创建 div 挂载到 body
    ↓
root.add(MainLayout)             // 接收 LayoutNode JSON
    ↓
RootComponent.render()           // 递归渲染
    ├── 解析 LayoutNode JSON
    ├── type → ComponentRegistrar 查找组件类
    ├── new XxxComponent(props)  // 创建子组件
    ├── child.mount(this.el)     // 挂载到父 el
    ├── 解析 children → 递归 render
    ├── 解析 handlers → onDom 绑定
    ├── 解析 stateTriggers → globalEventBus 绑定
    └── 解析 eventBridge → EventBridgeAbility 处理
```

#### 与旧模型的对比

| | 旧模型（外部 renderer） | 新模型（内部渲染） |
|---|---|---|
| 驱动方 | renderer.render(layoutJSON) | component.add(layout).render() |
| 子组件创建 | renderer BIND_CHILDREN 步骤 | 父组件 ChildrenAbility |
| 事件绑定 | renderer bind-handler 步骤 | 组件能力自行处理 |
| 数据绑定 | renderer bind-schema 步骤 | 组件能力自行处理 |
| 渲染管线 | 12 个处理器按权重执行 | 组件 render() 递归调用 |

#### 职责划分

| 职责 | 归属 | 说明 |
|------|------|------|
| 解析 LayoutNode JSON | ChildrenAbility | 拆解 JSON，创建子组件，挂载到父 el |
| handlers 绑定 | DomEventsAbility（onDom） | 组件创建后自行绑定 DOM 事件 |
| stateTriggers 绑定 | EventAbility（on） | 组件创建后自行绑定 EventBus 监听 |
| eventBridge 绑定 | EventBridgeAbility | __initProps 中自动处理 |
| props 初始化 | 各能力的 __initProps | mount 时统一调用 |

#### RootComponent

最简单的起步：一个 div 挂载到 body，添加样式，然后递归渲染子组件。

```typescript
class RootComponent extends ComponentBase {
    static override readonly abilities = [LifecycleAbility, ChildrenAbility];

    constructor() {
        super();
        this.el.classList.add('q-app');
    }

    /** 启动应用 */
    start(container?: HTMLElement): void {
        const target = container ?? document.body;
        this.mount(target);
    }

    /** 添加布局定义 */
    add(layout: LayoutNode): this {
        this.renderLayout(layout);
        return this;
    }

    /** 渲染布局 */
    renderLayout(layout: LayoutNode): void {
        // ChildrenAbility 负责：解析 JSON → 创建子组件 → 挂载
    }
}
```

---

## 2. 能力分类索引

### 2.1 UI 能力 (`src/component-abilities/ui/`)

| 能力 | 说明 |
|------|------|
| TextAbility | 文本内容（支持 ContentManager 多文本模式） |
| IconAbility | 图标内容（支持 ContentManager 多图标模式） |
| PlaceholderAbility | 占位符（flex 布局中占据剩余空间，只有 show/hide） |
| VisibleAbility | 显隐控制 |
| DisableAbility | 禁用控制 |
| LoadingAbility | 加载状态 |
| SizeAbility | 尺寸控制 |

### 2.1.1 内容管理 (`src/component-abilities/content/`)

| 工具 | 文件 | 说明 |
|------|------|------|
| ContentAbility | `ContentAbility.ts` | 浮层内容位管理（dropdown/popover），调用 OverlayAbility.createOverlay |
| ContentPrefix | `ContentPrefix.ts` | 内容前缀常量（ICON/TEXT/TIPS/DROPDOWN/POPOVER）+ OVERLAY_PREFIXES 集合 |

> `createContentManager`、`createOverlayManager`、`positionOverlay`、`normalize` 已迁移：
> - 浮层逻辑 → `src/component-core/abilities/OverlayAbility.ts`
> - 定位工具 → `src/component-core/abilities/positionOverlay.ts`
> - i18n 刷新 → `src/component-core/abilities/NodeMapAbility.ts`（data-i18n + refreshI18n）
> - tooltip → `OverlayAbility.initTooltipOverlay()`（配置驱动，LayoutNode.tooltip）

### 2.2 数据能力 (`src/component-abilities/data/`)

| 能力 | 说明 |
|------|------|
| ValueAbility | 值管理 |
| ValidateAbility | 校验 |
| PlaceholderAbility | 占位文本 |
| SubmitAbility | 提交 |
| FieldSetAbility | 字段集 |

### 2.3 实体能力 (`src/component-abilities/entity/`)

| 能力 | 文件 | 说明 |
|------|------|------|
| EntityCoreAbility | `EntityCoreAbility.ts` | EntityManager 实例管理 + 方法代理 |
| EntityEmitAbility | `EntityEmitAbility.ts` | EntityManager 事件 → 组件事件转发 |
| EntityListenAbility | `EntityListenAbility.ts` | 组件事件 → EntityManager 操作 |
| EntityAbility | `EntityAbility.ts` | 组合导出（Core+Emit+Listen） |
| EntityLocalReadonlyAbility | `EntityLocalReadonlyAbility.ts` | 本地只读组合 |
| EntityLocalCrudAbility | `EntityLocalCrudAbility.ts` | 本地 CRUD 组合 |
| EntityRemoteReadonlyAbility | `EntityRemoteReadonlyAbility.ts` | 远程只读组合 |
| EntityRemoteCrudAbility | `EntityRemoteCrudAbility.ts` | 远程 CRUD 组合 |
| EntityRemoteTreeAbility | `EntityRemoteTreeAbility.ts` | 远程树形组合 |

### 2.4 选择能力 (`src/component-abilities/selection/`)

| 能力 | 说明 |
|------|------|
| SelectionAbility | 选择状态管理 |
| SelectableAbility | 行可选择 |

### 2.5 子组件能力 (`src/component-abilities/children/`)

| 能力 | 说明 |
|------|------|
| ChildrenAbility | 子组件管理 |

### 2.6 渲染能力 (`src/component-abilities/render/`)

| 能力 | 说明 |
|------|------|
| RenderAbility | 渲染控制 |
| VirtualListAbility | 虚拟列表 |
| OverlayAbility | 浮层 |
| AnimationAbility | 动画 |

### 2.7 交互能力 (`src/component-abilities/interaction/`)

| 能力 | 说明 |
|------|------|
| ClickAbility | 点击事件 |
| OptionsAbility | 选项列表 |
| SearchAbility | 搜索（已废弃，请使用 toolbar/SearchAbility） |
| SortAbility | 排序 |
| OpenableAbility | 打开/关闭 |
| LayoutAbility | 布局 |

### 2.8 列能力 (`src/component-abilities/column/`)

| 能力 | 说明 |
|------|------|
| ColumnAbility | 列定义 |
| ColumnManageAbility | 列管理 |

### 2.9 工具栏能力 (`src/component-abilities/toolbar/`)

| 能力 | 文件 | 说明 |
|------|------|------|
| ToolbarAbility | `ToolbarAbility.ts` | 位置排序、插入/移除/显隐、外观声明、折叠切换 |
| CrudAbility | `CrudAbility.ts` | CRUD 操作按钮组 |
| **PaginationAbility** | `pagination/PaginationAbility.ts` | **分页聚合层**（合并以下子能力） |
| PaginationStateAbility | `pagination/PaginationStateAbility.ts` | 分页状态管理 |
| PaginationEventsAbility | `pagination/PaginationEventsAbility.ts` | 分页事件分发 |
| PaginationNavAbility | `pagination/PaginationNavAbility.ts` | 导航按钮渲染 |
| PaginationPagesAbility | `pagination/PaginationPagesAbility.ts` | 页码按钮渲染 |
| PaginationJumperAbility | `pagination/PaginationJumperAbility.ts` | 页码输入框 |
| PaginationSizerAbility | `pagination/PaginationSizerAbility.ts` | 每页条数选择器 |
| PaginationInfoAbility | `pagination/PaginationInfoAbility.ts` | 分页信息展示 |
| **SearchAbility** | `search/SearchAbility.ts` | **搜索聚合层**（合并以下子能力，支持组合查询） |
| SearchInputAbility | `search/SearchInputAbility.ts` | 搜索输入框 + 防抖 change 触发 |
| SearchButtonAbility | `search/SearchButtonAbility.ts` | 搜索按钮 + 组合数据组装 |
| SearchEventsAbility | `search/SearchEventsAbility.ts` | 搜索事件分发（组合类型 `{ keyword?, search? }`） |

### 2.10 事件能力 (`src/component-abilities/event/`)

| 能力 | 说明 |
|------|------|
| EventBindingAbility | 事件绑定（已废弃，由 EventAbility + DomEventsAbility 替代） |

### 2.11 核心能力 (`src/component-core/abilities/`)

| 能力 | 文件 | 说明 |
|------|------|------|
| InitAbility | `InitAbility.ts` | 统一初始化流程（initialize/initConfig/initContent/assignProps/bindEvents） |
| NodeMapAbility | `NodeMapAbility.ts` | 模板节点扫描、属性生成、data-i18n + refreshI18n 集中刷新 |
| OverlayAbility | `OverlayAbility.ts` | 浮层管理（createOverlay/initTooltipOverlay） |
| BadgeAbility | `BadgeAbility.ts` | 角标管理（initBadge/setBadgeText/setBadgeVisible） |
| DragAbility | `DragAbility.ts` | 拖拽能力（initDrag/setDraggable，基于框架 DragProcessor） |
| DropAbility | `DropAbility.ts` | 放置能力（initDrop/setDroppable/setDropAccept，HTML5 拖放事件） |
| AnimationAbility | `AnimationAbility.ts` | 动画控制（playEnter/playLeave） |
| EntityCoreAbility | `EntityCoreAbility.ts` | EntityManager 实例声明 |
| PermissionAbility | `PermissionAbility.ts` | 权限控制 |
| ThemeAbility | `ThemeAbility.ts` | 主题样式 |
| StyleAbility | `StyleAbility.ts` | 自定义样式 |
| EventBridgeAbility | `EventBridgeAbility.ts` | 声明式事件桥接 |
| PropAlias | `PropAlias.ts` | 属性别名与初始化协议 |
| positionOverlay | `positionOverlay.ts` | 浮层定位工具函数（4方向定位、自动翻转、视口约束） |
| LayoutAbility | `LayoutAbility.ts` | 布局能力（fit/hbox/vbox/grid/center，自动为根元素添加布局 CSS 类） |

---

## 3. 事件体系

### 3.1 事件常量 (`src/events/component-events.ts`)

| 常量 | 事件名 | 发射方 |
|------|--------|--------|
| PAGINATION_EVENTS.CHANGE | `pagechange` | PaginationEventsAbility |
| CRUD_EVENTS.ACTION | `crudaction` | CrudAbility |
| SELECTION_EVENTS.CHANGE | `selectionchange` | SelectionAbility |
| SELECTION_EVENTS.ROW_SELECT | `rowselect` | SelectableAbility |
| CHILDREN_EVENTS.ADD | `childadd` | ChildrenAbility |
| CHILDREN_EVENTS.REMOVE | `childremove` | ChildrenAbility |
| CHILDREN_EVENTS.MOVE | `childmove` | ChildrenAbility |
| CHILDREN_EVENTS.CHANGE | `childrenchange` | ChildrenAbility |
| COLUMN_EVENTS.ADD | `columnadd` | ColumnManageAbility |
| COLUMN_EVENTS.REMOVE | `columnremove` | ColumnManageAbility |
| COLUMN_EVENTS.HIDE | `columnhide` | ColumnManageAbility |
| COLUMN_EVENTS.SHOW | `columnshow` | ColumnManageAbility |
| COLUMN_EVENTS.MOVE | `columnmove` | ColumnManageAbility |
| COLUMN_EVENTS.REPLACE | `columnreplace` | ColumnManageAbility |
| TOOLBAR_EVENTS.REORDER | `toolbarreorder` | ToolbarAbility |
| TOOLBAR_EVENTS.INSERT | `toolbarinsert` | ToolbarAbility |
| TOOLBAR_EVENTS.COLLAPSE_CHANGE | `toolbarcollapsechange` | ToolbarAbility |
| SEARCH_EVENTS.CHANGE | `searchchange` | SearchEventsAbility |
| SEARCH_EVENTS.SUBMIT | `searchsubmit` | SearchEventsAbility |
| ENTITY_EVENTS.* | `entity:*` | EntityEmitAbility 转发 |

### 3.2 实体事件 (`src/events/entity-events.ts`)

| 常量 | 说明 |
|------|------|
| ENTITY_DATA_EVENTS.DATA_CHANGE | 数据变更 |
| ENTITY_CRUD_EVENTS.CREATED/UPDATED/DELETED/SAVED/TOGGLED | CRUD 结果 |
| ENTITY_LIST_EVENTS.LISTED/GOT | 列表加载 |
| ENTITY_TREE_EVENTS.EXPANDED/COLLAPSED/MOVED/CHILDREN_REFRESHED | 树操作 |
| ENTITY_SEARCH_EVENTS.CHANGE | 搜索条件变更 |
| ENTITY_REQUEST_STATUS.LOADING/SUCCESS/ERROR | 请求状态 |

### 3.3 组件事件 (`src/component/events.ts`)

| 常量 | 说明 |
|------|------|
| TABLE_EVENTS.PAGE_CHANGE | 表格分页变更 |
| TABLE_EVENTS.CREATE/EDIT/DELETE/REFRESH/IMPORT/EXPORT/SAVE | 表格 CRUD |
| TABLE_EVENTS.SELECTION_CHANGE/ROW_SELECT | 表格选择 |
| FORM_EVENTS.SAVE/CREATE/EDIT/DELETE/REFRESH | 表单操作 |

### 3.4 事件桥接 (`src/component-core/abilities/EventBridgeAbility.ts`)

内置桥接类型：

| 桥接 key | 监听事件 | 调用方法 |
|----------|----------|----------|
| pagination | PAGINATION_EVENTS.CHANGE | onPageChange |
| crud | CRUD_EVENTS.ACTION | on{Action}（如 onCreate, onEdit） |
| selection | SELECTION_EVENTS.CHANGE | onSelectionChange |
| search | SEARCH_EVENTS.CHANGE | onSearchChange |
| 自定义 | 自定义 event | 自定义 handler |

---

## 4. 实体管理器

### 4.1 管理器变体 (`src/entity/manager/managers.ts`)

| 管理器 | 能力组合 | 说明 |
|--------|----------|------|
| LocalReadonlyEntityManager | FlatLocalStateAbility + LocalListAbility + LocalGetAbility | 本地只读 |
| LocalCrudEntityManager | + FlatLocalMutationAbility + FlatLocalDeleteAbility | 本地 CRUD |
| RemoteReadonlyEntityManager | SchemaProxyAbility + CacheAbility + DirtyAbility + SearchAbility + DomainPagingAbility + FlatRemoteStateAbility + FlatRemoteListAbility + FlatRemoteGetAllAbility + RemoteGetAbility + FlatRemoteQueryAbility | 远程只读（含分页） |
| RemoteCrudEntityManager | + RemoteCreateAbility + RemoteUpdateAbility + RemoteDeleteAbility + RemoteToggleAbility | 远程 CRUD（含分页） |
| RemoteTreeEntityManager | + TreePathAbility + TreeLifecycleAbility + TreeSearchAbility + TreeViewAbility + TreeRemoteStateAbility | 远程树形 |

### 4.2 分页相关能力

| 能力 | 文件 | 说明 |
|------|------|------|
| DomainPagingAbility | `src/entity/manager/managers.ts` | 从 DomainConfig 读取 pageSize/pageSizes |
| FlatRemoteQueryAbility | `src/entity/abilities/remote/FlatRemoteQueryAbility.ts` | prev/next/jump/changeSize/filter/sort/reset |
| FlatRemoteStateAbility | `src/entity/abilities/remote/FlatRemoteStateAbility.ts` | updateData/isValidPage/deleteFromItems |

---

## 5. 分页能力详细设计

> 2026-07-07 重构：从单体 PaginationAbility 拆分为 7 个子能力

### 5.1 架构

```
PaginationAbility（聚合层，单个 AbilityDefinition）
  ├── PaginationStateAbility    — 状态管理
  ├── PaginationEventsAbility   — 事件分发
  ├── PaginationNavAbility      — 导航按钮
  ├── PaginationPagesAbility    — 页码按钮
  ├── PaginationJumperAbility   — 页码输入框（新增）
  ├── PaginationSizerAbility    — 每页条数选择器（新增）
  └── PaginationInfoAbility     — 分页信息
```

### 5.2 位置常量 (`src/component-abilities/toolbar/pagination/pagination-positions.ts`)

| 常量 | 值 | 说明 |
|------|-----|------|
| FIRST | 610 | 首页按钮 |
| PREV | 620 | 上一页按钮 |
| PAGES | 630 | 页码区域 |
| JUMPER | 635 | 页码输入框 |
| NEXT | 640 | 下一页按钮 |
| LAST | 650 | 末页按钮 |
| SIZER | 655 | 每页条数选择器 |
| INFO | 660 | 分页信息 |

### 5.3 状态属性

| 属性 | 默认值 | abilityState 键名 |
|------|--------|-------------------|
| currentPage | 1 | PaginationAbility:currentPage |
| totalPages | 1 | PaginationAbility:totalPages |
| totalRecords | 0 | PaginationAbility:totalRecords |
| pageSize | 10 | PaginationAbility:pageSize |
| pageSizes | [10,20,50] | PaginationAbility:pageSizes |
| showFirstLast | true | PaginationAbility:showFirstLast |
| showPageInfo | true | PaginationAbility:showPageInfo |
| showJumper | false | PaginationAbility:showJumper |
| showSizer | false | PaginationAbility:showSizer |
| pageRange | 2 | PaginationAbility:pageRange |

### 5.4 事件流

```
用户操作 → PaginationEventsAbility.gotoPage/changeSize
         → 更新状态（PaginationStateAbility）
         → 发射 PAGINATION_EVENTS.CHANGE {page, pageSize}
         → EventBridgeAbility 桥接
         → EntityListenAbility 监听
         → EntityManager.jump/changeSize/loadPage
         → EntityEmitAbility 转发 entity:listed
         → PaginationStateAbility 同步分页状态
```

---

## 6. 渲染管线

### 6.1 Renderer Pipeline (`src/renderer/Renderer.ts`)

12 个内置处理器按权重排序：

| 权重 | 处理器 | 说明 |
|------|--------|------|
| 100 | CREATE | 创建组件实例 |
| 200 | TEMPLATE | 应用 HTML 模板 |
| 300 | INJECT | 注入依赖 |
| 400 | BIND_SCHEMA | 绑定 Schema |
| 500 | BIND_HANDLER | 绑定事件处理器 |
| 600 | BIND_DATASOURCE | 绑定数据源 |
| 650 | BIND_ENTITY_HOOKS | 绑定实体钩子 |
| 700 | BIND_CHILDREN | 绑定子组件 |
| 800 | BIND_SLOTS | 绑定插槽 |
| 900 | BIND_REPEAT | 绑定循环渲染 |
| 950 | BIND_I18N | 绑定国际化 |
| 1000 | MOUNT | 挂载到 DOM |

---

## 7. 导出链路

关键导出路径（从底层到上层）：

```
子能力文件 → toolbar/pagination/index.ts 或 toolbar/search/index.ts → toolbar/index.ts → component-abilities/index.ts → component/index.ts
```

| 导出项 | toolbar/index.ts | component-abilities/index.ts | component/index.ts |
|--------|-----------------|------------------------------|---------------------|
| PaginationAbility | ✓ | ✓ | ✓ |
| PAGINATION_POSITIONS | ✓ | ✓ | ✓ |
| PaginationStateAbility | ✓ | ✓ | - |
| PaginationEventsAbility | ✓ | ✓ | - |
| PaginationNavAbility | ✓ | ✓ | - |
| PaginationPagesAbility | ✓ | ✓ | - |
| PaginationJumperAbility | ✓ | ✓ | - |
| PaginationSizerAbility | ✓ | ✓ | - |
| PaginationInfoAbility | ✓ | ✓ | - |
| SearchAbility | ✓（别名 ToolbarSearchAbility） | ✓ | ✓ |
| SEARCH_POSITIONS | ✓ | ✓ | ✓ |
| SearchInputAbility | ✓ | ✓ | - |
| SearchButtonAbility | ✓ | ✓ | - |
| SearchEventsAbility | ✓ | ✓ | - |
| ToolbarAbility | ✓ | ✓ | ✓ |
| CrudAbility | ✓ | ✓ | ✓ |

---

## 变更日志

| 日期 | 变更内容 |
|------|----------|
| 2026-07-07 | 初始创建；记录分页能力拆分（PaginationAbility → 7 个子能力） |
| 2026-07-08 | 搜索能力重构：新增 toolbar/SearchAbility（聚合层，含 SearchInputAbility/SearchButtonAbility/SearchEventsAbility）；新增 SEARCH_EVENTS/ENTITY_SEARCH_EVENTS 事件常量；EventBridgeAbility 新增 search 桥接；EntityListenAbility 替换硬编码 'searchchange'；EntityEmitAbility 新增搜索事件转发；interaction/SearchAbility 标记 @deprecated |
| 2026-07-08 | 搜索组合查询增强：SearchEventsAbility 事件数据类型从联合类型改为组合类型 `{ keyword?, search? }`；SearchButtonAbility 始终组装完整数据；SearchInputAbility 防抖事件携带 searchParams；EntityListenAbility if-else if 互斥分支改为两个独立 if；searchMode 语义调整为 UI 渲染模式 |
| 2026-07-08 | toolbar 目录重组：9 个分页文件移入 pagination/ 子目录，5 个搜索文件移入 search/ 子目录，新建 pagination/index.ts 和 search/index.ts，更新 toolbar/index.ts 导出路径 |
| 2026-07-08 | 新增 IconAbility + createContentManager：图标能力使用 ContentManager 模式管理多图标；TextAbility 重写支持 ContentManager 模式（兼容旧 data-ref 模式）；ButtonComponent 重写使用 IconAbility + TextAbility；删除 TemplateRegistry（统一使用 HtmlTemplateRegistrar）；新增 content/ 目录 |
| 2026-07-08 | 工具栏重构：ToolbarAbility 新增外观声明（q-toolbar 类名 + role="toolbar" + 默认 gap=sm）和折叠切换（collapsed 属性 + toggleCollapsed 方法 + toolbarcollapsechange 事件）；ToolbarComponent 移除硬编码 PaginationAbility/CrudAbility/SearchAbility（改为 meta.abilities 按需注入），新增 direction 属性支持横/竖布局；新增 IconComponent（IconAbility + SizeAbility）和 TextComponent（TextAbility + SizeAbility）预置组件；新增 ComponentTypes.ICON/TEXT；新增 toolbarCSS 折叠样式 |
| 2026-07-08 | 浮层能力：新增 ContentPrefix 常量（ICON/TEXT/TIPS/DROPDOWN/POPOVER）+ OVERLAY_PREFIXES 集合；新增 createOverlayManager 工厂方法（模板获取、DOM 创建、定位计算、生命周期管理）；新增 positionOverlay 定位工具函数（4方向定位、自动翻转、视口约束）；createContentManager 检测浮层前缀时自动调用 createOverlayManager；新增 Tips/Dropdown/Popover 模板；现有组件 contentSlots 迁移为 ContentPrefix 常量引用 |
| 2026-07-08 | ComponentBase 重构设计：新增能力接口定义（IRenderAbility/ILifecycleAbility/IStateAbility/IStyleAbility/IThemeAbility/IContentAbility/IEventBridgeAbility）；BASE_ABILITIES 新增 RenderAbility + LifecycleAbility；StateAbility 为按需能力；ComponentBase 瘦身至身份属性 + 能力收集骨架 |
| 2026-07-10 | ComponentBase 能力重构：InitAbility/NodeMapAbility/OverlayAbility 从 ComponentBase 拆分为 AbilityDefinition；AnimationAbility/EntityCoreAbility/PermissionAbility 从 AbilityBase 类模式改为 AbilityDefinition 对象模式；删除 AbilityBase（文件不存在）；删除 IContentAbility 接口（功能分散到 NodeMapAbility/OverlayAbility）；content 目录精简（createContentManager/createOverlayManager/positionOverlay/normalize 已迁移）；html-template 包重命名为 template（HtmlTemplateRegistrar → TemplateRegistrar，@qimenjs/html-template → @qimenjs/template，RegistryHub 键 'html' → 'template'） |
| 2026-07-12 | Badge 角标能力：新增 BadgeAbility（initBadge/setBadgeText/setBadgeVisible，对齐 OverlayAbility 模式）；新增 BadgeComponent（withTemplate + ContentAbility，独立组件管定位和渲染）；新增 BadgeProps/BADGE_KEYS（LayoutNode 声明式配置，badge/badgeType/badgePlacement/badgeTypeOverride）；InitAbility 步骤6 驱动 initBadge + assignProps 赋值；BadgeComponent 放在 src/component/badge/ 目录（组件按目录分层） |
| 2026-07-12 | 布局能力：新增 LayoutAbility（fit/hbox/vbox/grid/center 五种布局模式，自动为根元素添加布局 CSS 类）；布局类型值常量化（LAYOUT_FIT/LAYOUT_HBOX/LAYOUT_VBOX/LAYOUT_GRID/LAYOUT_CENTER）；合并到 TEMPLATE_COMPONENT_ABILITIES；TemplateComponent.flush() 新增 flushLayout() 调用 |
| 2026-07-12 | 拖拽/放置能力：新增 DragAbility（基于框架 DragProcessor 的 'drag' 手势语义，initDrag/setDraggable，发布 dragstart/dragmove/dragend/dragcancel 事件）和 DropAbility（HTML5 原生拖放事件，initDrop/setDroppable/setDropAccept，dropAccept 类型过滤，发布 dragenter/dragover/dragleave/drop 事件）；新增 DragProps/DropProps（LayoutNode 声明式配置，draggable/dragAxis/dragHandle/dragBounds/dragActiveClass/dragGrid + droppable/dropAccept/dropActiveClass）；新增 DRAG_KEYS/DROP_KEYS；InitAbility 步骤6 驱动 initDrag/initDrop + assignProps 赋值；事件走 UI 事件模式（this.emit + EventContext） |
