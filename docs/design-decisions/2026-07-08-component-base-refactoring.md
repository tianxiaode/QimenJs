# ComponentBase 重构与内部渲染模型

> 日期：2026-07-08

## 1. 背景

ComponentBase 已增长至 302 行，承担了过多职责：身份属性、DOM 元素管理、模板注入、挂载/卸载/销毁、组件树导航、响应式更新、属性别名等。同时，现有的渲染模型依赖外部 renderer（12 个异步处理器管线），增加了复杂度和调度开销。

## 2. 决策

### 决策一：ComponentBase 瘦身，功能拆分为能力

从 ComponentBase 抽出以下能力：

| 抽出内容 | 变成 | 是否 BASE |
|----------|------|-----------|
| initElement 模板注入 + reinitElement | RenderAbility | 是 |
| mount/unmount/dispose/parent/up/mounted/destroyed | LifecycleAbility | 是 |
| add/removeChild/removeAll/children 等 | ChildrenAbility | 是 |
| x/y/top/left/bottom/right/width/height/tabIndex/zIndex/margin/padding/maxWidth/minWidth/maxHeight/minHeight/scrollable/center/hideMode/alwaysOnTop/fullscreen/shadow/focused | PositionAbility | 是 |
| update/markDirty/_dirty | StateAbility | 否（按需） |

重构后 ComponentBase 只保留：`cid/id/type/props` + `applyOverrides`

**能力声明方式**：ComponentBase 把基础能力定义在 `static abilities` 上，ComposableBase.collectAbilities() 会沿原型链自动收集每层的 static abilities 并合并去重。子类只需声明自己的 abilities，无需重写 collectAbilities。

**VisibleAbility 与 hideMode 的关系**：VisibleAbility 重构后不再硬编码 `display:none`，
而是读取 `this.hideMode`（来自 PositionAbility）决定隐藏方式：
- `hideMode='display'`（默认）→ `el.style.display = 'none'`
- `hideMode='visibility'` → `el.style.visibility = 'hidden'`
- `hideMode='opacity'` → `el.style.opacity = '0'`

### 决策二：组件内部递归渲染，替代外部 renderer

组件自己负责渲染子组件，从根组件开始逐层递归：

```
app.start()
    ↓
new RootComponent()
    ↓
root.renderTo(document.body)  // 挂载到容器，只管挂载
root.add(MainLayout)          // 拆解 JSON 渲染子组件，只管渲染
    ↓
add 内部递归
    ├── 解析 LayoutNode → new XxxComponent(props)
    ├── child.renderTo(this.el)
    └── child.add(children) → 递归
```

两个核心方法，职责分离：
- **`renderTo(container)`** — 公开 API，把自己挂到容器上，只管挂载，不接收 layout
- **`add(layout)`** — 内部方法，拆解 LayoutNode JSON 递归创建子组件，只管渲染

renderTo 不接收 layout，避免挂载和渲染耦合，防止跳过正常渲染流程。

每层父组件只负责自己的直接子节点，子的子由子自己负责。

### 决策三：LayoutNode 结构重组

```typescript
interface LayoutNode extends PositionProps {
    type: string;                          // 组件类型 → ComponentRegistrar.get(type)
    id?: string;                           // 组件标识（查找/事件桥接）
    field?: string;                        // Schema 字段名
    abilities?: AbilityDefinition[];       // 附加能力（展开后逐个注入实例）
    handlers?: Record<string, ...>;        // DOM 事件绑定（GestureSemantic | InputSignal）
    extraFns?: Record<string, Function>;   // 附加函数（bind this 后挂到实例）
    meta?: LayoutMeta;                     // 纯数据（this.meta.xxx 访问）
    bridges?: BridgesConfig;               // 事件桥接（string=发布，EventListen=监听）
    children?: LayoutNode[];               // 子布局
    visible?: boolean | string;            // 条件渲染
    repeat?: RepeatConfig;                 // 循环渲染
    responsive?: ResponsiveConfig;         // 响应式配置
}

// PositionProps 直接在顶层，不嵌套
interface PositionProps {
    x?: number; y?: number; top?: number; left?: number; ...
    width?: number; height?: number;
    margin?: string; padding?: string;
    hideMode?: 'display' | 'visibility' | 'opacity';
    // ... 其他位置/尺寸属性
}
```

add(layout) 处理顺序：PositionProps → abilities → extraFns → meta → handlers → bridges → children

**handlers 与 extraFns 的关系**：handlers 只声明"绑定什么事件"，事件处理逻辑写在 extraFns 里。
例如 `{ handlers: { click: "onDelete" }, extraFns: { onDelete(e) { ... } } }`。
不需要为每个事件处理写新能力，extraFns 就是事件处理的载体。

**handlers 绑定方式**：通过 DomEventsAbility 的 `bind(target, semantic)` 绑定。
handlers 的 key 支持 GestureSemantic 和 InputSignal：
- GestureSemantic（click/tap/submit/contextmenu 等）：走 Processor 流程
- InputSignal（input/change/focus/blur 等）：直接绑定，不走 Processor
`{ click: "onDelete", input: "onSearch" }` → `child.bind(child.el, 'click', handler)` / `child.bind(child.el, 'input', handler)`

### 决策四：事件绑定内化到组件能力

| 绑定机制 | 归属 | 说明 |
|----------|------|------|
| handlers | DomEventsAbility（bind） | 组件创建后自行绑定手势语义事件 |
| bridges.on | EventAbility（on） | 组件创建后自行绑定 EventBus 监听 |
| eventBridge | EventBridgeAbility | __initProps 中自动处理 |

### 决策五：能力接口定义

为每个能力定义接口，方便类型标注：

| 接口 | 能力 | 是否 BASE |
|------|------|-----------|
| IRenderAbility | RenderAbility | 是 |
| ILifecycleAbility | LifecycleAbility | 是 |
| IChildrenAbility | ChildrenAbility | 否（按需声明） |
| IPositionAbility | PositionAbility | 是 |
| IStyleAbility | StyleAbility | 是 |
| IThemeAbility | ThemeAbility | 是 |
| IEventBridgeAbility | EventBridgeAbility | 是 |
| IEventAbility | EventAbility | 是（已有） |
| IDomEventsAbility | DomEventsAbility | 是（已有，新增 onDom） |
| IStateAbility | StateAbility | 否 |
| IContentAbility | ContentAbility | 否 |

## 3. 原因

### 为什么拆分 ComponentBase

- 302 行已接近失控，继续增长会导致维护困难
- 能力组合是框架的核心模式，ComponentBase 自身也应遵循这个模式
- 不是所有组件都需要 update/markDirty（Separator/Space 不需要）

### 为什么用内部递归渲染替代外部 renderer

- **更简单**：递归调用比 12 个异步处理器串行 await 更直观
- **更快**：同步递归比异步管线少了 await 开销和处理器调度开销
- **更内聚**：渲染是组件自身的行为，不应由外部驱动
- **更易调试**：调用栈清晰，不需要跨处理器追踪

### 递归渲染的效率分析

| 关注点 | 分析 | 结论 |
|--------|------|------|
| DOM 操作次数 | 每个子组件一次 appendChild，与旧模型相同 | 无额外开销 |
| 递归深度 | UI 嵌套一般不超过 10 层 | 不是问题 |
| 同步 vs 异步 | 同步递归，一次宏任务完成 | 比旧模型更快 |
| 批量 reflow | 浏览器自动合并同步 appendChild | 只触发 1 次 reflow |
| 大列表 | 1000+ 行场景 | 用虚拟列表解决，不是递归的问题 |

## 4. 影响

- **renderer 包**：12 个处理器将逐步废弃，渲染逻辑内化到 ChildrenAbility
- **ComponentBase**：从 302 行降至约 60-80 行
- **所有组件**：需要声明 StateAbility（如果需要 markDirty/update）
- **EventBindingAbility**：onDom 方法归入 DomEventsAbility，废弃标记移除
- **RootComponent**：新增根组件，作为应用入口

## 5. 替代方案

### 替代方案一：保留外部 renderer，只拆 ComponentBase

- 优点：改动范围小，renderer 不受影响
- 缺点：渲染仍然是外部驱动，组件不自治；异步管线开销仍在
- 未采用原因：与"组件自治"的设计理念冲突

### 替代方案二：保留 mount/unmount/dispose 在 ComponentBase

- 优点：这些方法太基础，几乎所有组件都需要
- 缺点：ComponentBase 无法瘦身，违背重构目标
- 未采用原因：能力只是原型复制，没有不可抽的

### 替代方案三：StateAbility 放入 BASE_ABILITIES

- 优点：所有组件都有 update/markDirty，无需声明
- 缺点：Separator/Space 等静态组件不需要，增加方法污染
- 未采用原因：按需组合更符合框架设计哲学

## 6. 实施步骤

1. 创建 RenderAbility（从 ComponentBase.initElement 抽出模板注入 + reinitElement）
2. 创建 LifecycleAbility（从 ComponentBase 抽出 mount/unmount/dispose/parent/up）
3. 创建 StateAbility（从 ComponentBase 抽出 update/markDirty）
4. 将 onDom 从 EventBindingAbility 移入 DomEventsAbility
5. 重构 ComponentBase：移除已抽取代码，添加 renderTo 方法，更新 static abilities
6. 更新所有组件：添加 StateAbility 声明
7. 实现 ChildrenAbility 的 add 方法（解析 LayoutNode JSON，内部调用 renderTo）
8. 实现 RootComponent
9. 逐步废弃 renderer 包

## 7. 后续工作

- [x] 确定 ChildrenAbility.add(layout) 的具体实现（见下方）
- [ ] 确定 handlers/bridges 在内部渲染模型中的绑定时机
- [ ] 确定 renderer 包的废弃策略（一次性移除还是渐进式）
- [x] 确定 RootComponent 的完整 API（见下方）
- [ ] 更新 ui-component-design.md 中的渲染章节

---

## 附录 A：ChildrenAbility.add(layout) 设计

### 核心方法

在现有 ChildrenAbility 中新增 `add(layout)` 方法，接收 LayoutNode JSON，递归创建子组件：

```typescript
/**
 * 从 LayoutNode JSON 创建并挂载子组件
 *
 * 解析 Layout 定义，递归创建组件树。
 * 每层只负责自己的直接子节点，子的子由子自己负责。
 *
 * @param layout - LayoutNode 定义
 * @returns 创建的子组件实例
 */
add(layout: LayoutNode): ComponentLike {
    // 1. 从 ComponentRegistrar 查找组件类
    const ComponentClass = ComponentRegistrar.getInstance().get(layout.type);
    if (!ComponentClass) {
        this.logger?.warn(`Component type "${layout.type}" not registered`);
        return null;
    }

    // 2. 合并 props（非 PositionProps、非保留字的顶层属性 + id/type）
    const props = { ...(layout as any).props, id: layout.id, type: layout.type };

    // 3. 创建组件实例
    const child = new ComponentClass(props);

    // 4. 挂载到父 el（renderTo 只管挂载，不接收 layout）
    child.renderTo(this.el);
    this.addChild(child);

    // 5. 注入 PositionProps（直接赋给 setter，触发 el.style 操作）
    for (const key of POSITION_KEYS) {
        if ((layout as any)[key] !== undefined) {
            (child as any)[key] = (layout as any)[key];
        }
    }

    // 6. 注入 abilities（展开后逐个注入组件实例）
    if (layout.abilities) {
        for (const ability of layout.abilities) {
            for (const key of Object.keys(ability)) {
                const value = ability[key];
                let descriptor: PropertyDescriptor;
                if (value && typeof value === 'object' && ('get' in value || 'set' in value)) {
                    descriptor = { configurable: true, enumerable: true };
                    if ('get' in value) descriptor.get = value.get;
                    if ('set' in value) descriptor.set = value.set;
                } else if (typeof value === 'function') {
                    descriptor = { value: value.bind(child), writable: true, configurable: true, enumerable: true };
                } else {
                    descriptor = { value, writable: true, configurable: true, enumerable: true };
                }
                Object.defineProperty(child, key, descriptor);
            }
        }
    }

    // 7. 注入 extraFns（bind this 后挂到实例）
    if (layout.extraFns) {
        for (const [name, fn] of Object.entries(layout.extraFns)) {
            Object.defineProperty(child, name, { value: fn.bind(child), configurable: true });
        }
    }

    // 8. 注入 meta（纯数据，this.meta.xxx 访问）
    if (layout.meta) {
        Object.defineProperty(child, 'meta', { value: layout.meta, configurable: true, writable: true });
    }

    // 9. 绑定 handlers
    if (layout.handlers) {
        this.bindHandlers(child, layout.handlers);
    }

    // 9. 绑定 bridges.on
    const listens = layout.bridges?.filter(item => typeof item !== 'string') || [];
    if (listens.length) {
        this.bindEventListen(child, listens);
    }

    // 10. 递归渲染子节点
    if (layout.children) {
        for (const childLayout of layout.children) {
            child.add(childLayout);
        }
    }

    return child;
}
```

### 辅助方法

```typescript
/**
 * 绑定 handlers
 *
 * handlers 的 key 是 GestureSemantic（click/tap/submit 等），
 * 通过 DomEventsAbility.bind(target, semantic) 绑定。
 * 三种形式：字符串映射 / HandlerAction / 函数
 */
bindHandlers(child: ComponentLike, handlers: Record<string, any>): void {
    for (const [semantic, handler] of Object.entries(handlers)) {
        const items = Array.isArray(handler) ? handler : [handler];
        for (const h of items) {
            if (typeof h === 'string') {
                // 字符串映射到组件自身方法
                const method = (child as any)[h];
                if (typeof method === 'function') {
                    child.bind?.(child.el, semantic, method.bind(child));
                }
            } else if (typeof h === 'function') {
                child.bind?.(child.el, semantic, (e: any) => h(child, e));
            } else if (typeof h === 'object' && 'action' in h) {
                child.bind?.(child.el, semantic, () => executeHandlerAction(h, child));
            }
        }
    }
}

/**
 * 绑定 bridges.on
 *
 * 从旧 renderer/mount.ts bindEventListen 迁移的逻辑。
 */
bindEventListen(child: ComponentLike, listens: EventListen[]): void {
    for (const listen of listens) {
        for (const [eventType, methodName] of Object.entries(listen.events)) {
            const eventName = listen.source
                ? `${listen.source}:${String(eventType)}`
                : String(eventType);

            const handler = (ctx: any) => {
                const method = (child as any)[methodName];
                if (typeof method === 'function') {
                    method.call(child, ctx);
                }
            };

            if (trigger.once) {
                globalEventBus.once(eventName, handler);
            } else {
                const off = globalEventBus.on(eventName, handler);
                child.onCleanup?.(off);
            }
        }
    }
}
```

### handlers 上下文问题（已决定：方案 B）

旧模型中，字符串形式的 handler（如 `{ click: "onDelete" }`）从 `RenderContext.handlers` 查找函数。
新模型中，没有 RenderContext，字符串 handler 直接映射到组件自身的方法。

**决定：方案 B** — 字符串 handler 映射到组件自身方法

理由：
- 符合"组件自治"理念——handler 就是组件自己的方法
- 不需要额外的上下文传递，简化 API
- 与 bridges.on 的模式一致（`{ events: { pageChange: "onPageChange" } }` 也是映射到组件方法）
- extraFns 中可以注入自定义方法，所以组件方法不限于能力提供的方法

```typescript
// { click: "onDelete" } → child.bind(child.el, 'click', child.onDelete.bind(child))
if (typeof h === 'string') {
    const method = (child as any)[h];
    if (typeof method === 'function') {
        child.bind?.(child.el, semantic, method.bind(child));
    } else {
        this.logger?.warn(`Handler method "${h}" not found on component`);
    }
}
```

---

## 附录 B：RootComponent API

```typescript
class RootComponent extends ComponentBase {
    static override readonly abilities = [LifecycleAbility, ChildrenAbility];

    constructor() {
        super();
        this.el.classList.add('q-app');
    }

    /** 启动应用，挂载到指定容器（默认 body） */
    start(container?: HTMLElement | string): this {
        const target = typeof container === 'string'
            ? document.querySelector(container) as HTMLElement
            : container ?? document.body;
        this.renderTo(target);
        return this;
    }

    /** 添加布局定义，支持链式调用 */
    override add(layout: LayoutNode): this {
        super.add(layout);
        return this;
    }

    /** 销毁应用 */
    destroy(): void {
        this.removeAll?.();
        this.dispose();
    }
}
```

使用示例：

```typescript
const app = new RootComponent();
app.start('#app');  // 挂载到 #app

app.add({
    type: 'VBox',
    gap: 'md',
    children: [
        { type: 'Header', title: '用户管理' },
        { type: 'Table', id: 'userTable', ... },
        { type: 'Toolbar', id: 'toolbar', ... },
    ]
});
```

---

## 附录 C：布局约定与动态刷新

### 核心约定

1. **主布局**定义好骨架，包含各个区域容器（占位符）
2. **子布局**用 const 定义好，统一注册到路由表
3. 路由表是布局管理的唯一入口：`{ key, path?, layout }`
4. 通过路由变化或事件获取 key → 从路由表取布局 → 刷新指定容器

### 路由表

路由表是字典的超集——既有 key，又有 path（可选），还有 layout。
不管有没有实际路由，都定义成路由项。没有路径的用空字符串。

```typescript
const Home = { type: 'VBox', children: [...] };
const Product = { type: 'VBox', children: [...] };
const UserForm = { type: 'Form', children: [...] };

const router = {
    home:      { path: '',         layout: Home },
    product:   { path: 'product',  layout: Product },
    userForm:  { path: '',         layout: UserForm },  // 无路由，事件驱动
};
```

好处：
- **统一入口**：不管路由驱动还是事件驱动，都从路由表取布局
- **path 可选**：没有路由时 path 为空，不影响使用
- **可扩展**：未来可以加 meta、guard、children 等路由元信息
- **心智模型统一**：开发者只需要理解一个概念——路由表

### 流程

```
1. 定义主布局 + 子布局字典
2. app.start() → root.add(MainLayout) → 渲染骨架
3. 路由变化 / 事件触发 → 从字典取子布局
4. 找到目标容器 → 容器.removeAll() → 容器.add(subLayout)
```

### 示例

```typescript
// ── 1. 定义子布局 ──

const UserList = {
    type: 'VBox',
    gap: 'md',
    children: [
        { type: 'Toolbar', id: 'userToolbar', ... },
        { type: 'Table', id: 'userTable', ... },
    ]
};

const UserForm = {
    type: 'Form',
    id: 'userForm',
    layout: 'vertical',
    children: [
        { type: 'Input', field: 'username', label: '用户名' },
        { type: 'Input', field: 'email', label: '邮箱' },
        { type: 'Select', field: 'role', label: '角色' },
    ]
};

const RoleList = {
    type: 'VBox',
    gap: 'md',
    children: [
        { type: 'Toolbar', id: 'roleToolbar', ... },
        { type: 'Table', id: 'roleTable', ... },
    ]
};

// ── 2. 定义路由表 ──

const router = {
    userList:  { path: 'users',       layout: UserList },
    userForm:  { path: '',            layout: UserForm },  // 无路由，事件驱动
    roleList:  { path: 'roles',       layout: RoleList },
};

// ── 2. 定义主布局（骨架 + 占位容器） ──

const MainLayout: LayoutNode = {
    type: 'VBox',
    gap: 'md',
    children: [
        { type: 'Header', id: 'appHeader', title: '管理系统' },
        { type: 'Container', id: 'mainContent' },  // 占位容器，子布局渲染到这里
        { type: 'Footer', id: 'appFooter' },
    ]
};

// ── 3. 启动应用 ──

const app = new RootComponent();
app.start('#app');
app.add(MainLayout);

// ── 4. 路由变化只发事件，不做具体操作 ──

// 路由层：只负责发事件
router.on('hashChange', (key) => {
    app.emitUI('navigate', { key });
});

// 容器层：通过 EventBridgeAbility 声明式桥接
// mainContent 的 eventBridge 配置：
// { navigate: 'app' }  — 监听 app 的 navigate 事件
// 容器的 onNavigate 方法：
// onNavigate(ctx) {
//     const route = router[ctx.data.key];
//     this.removeAll();
//     this.add(route.layout);
// }

// 事件驱动也一样：只发事件
// crudAction 事件 → mainContent 通过 eventBridge 监听 → onNavigate 处理
```

### 关键点

- **主布局是稳定的**，只渲染一次
- **子布局是按需的**，从路由表取，动态替换到指定容器
- **容器是占位符**，主布局中预留好位置（如 mainContent）
- **路由表是唯一入口**，不管路由驱动还是事件驱动，都从路由表取布局
- **path 可选**，没有路由时 path 为空，事件驱动直接用 key
- **事件驱动是核心**：路由变化只发事件（emitUI），不做具体操作
- **EventBridgeAbility 声明式桥接**：容器通过 eventBridge 声明监听 navigate 事件，在 onNavigate 中处理布局切换
- **新增 navigate 桥接类型**：EventBridgeAbility 内置桥接新增 navigate，与 pagination/crud/selection/search 同级
- 类似 ExtJS 的 Card Layout 模式——容器里同时只有一个子布局生效，切换时替换
