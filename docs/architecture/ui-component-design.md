# QimenJS UI 组件层设计方案

> 状态：草案 v0.5，持续打磨中

## 一、目标

在现有 ComposableBase + AbilityDefinition 体系之上，构建 UI 组件层，实现：

1. **能力赋能组件** — 从 ComposableBase 派生 UI 基类，通过 Ability 组合赋予组件各种能力
2. **JSON 驱动渲染** — 用 JSON Schema 描述组件结构和嵌套关系，渲染器递归生成 DOM
3. **主题系统** — Design Tokens + CSS 变量，数据驱动主题切换
4. **虚拟列表** — 只渲染可视区域行，内置分页获取但显示无感，实现无分页浏览

## 二、核心架构

```
┌─────────────────────────────────────────────────┐
│                   应用层                         │
│  JSON Layout + Schema + Theme → Renderer → DOM  │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────┼──────────────────────────┐
│                  服务层                          │
│  @qimen-lab/renderer  @qimen-lab/layout          │
│  @qimen-lab/theme     @qimen-lab/component       │
└──────────────────────┼──────────────────────────┘
                       │
┌──────────────────────┼──────────────────────────┐
│               数据层 / 核心层                     │
│  @qimen-lab/schema   @qimen-lab/registry         │
│  @qimen-lab/composable @qimen-lab/events          │
│  @qimen-lab/entity   @qimen-lab/validation       │
└──────────────────────────────────────────────────┘
```

## 三、组件基类设计

### 3.1 ComponentBase

从 ComposableBase 派生，所有 UI 组件的基类：

```typescript
// @qimen-lab/component
import { ComposableBase } from '@qimen-lab/composable';

export class ComponentBase extends ComposableBase {
    /** 组件根 DOM 元素 */
    readonly el: HTMLElement;

    /** 组件唯一 ID */
    readonly cid: string;

    /** 是否已挂载 */
    mounted: boolean;

    /** 是否已销毁 */
    destroyed: boolean;

    /** 挂载到目标容器 */
    mount(container: HTMLElement | string): void;

    /** 从 DOM 卸载 */
    unmount(): void;

    /** 更新组件（由子类实现具体逻辑） */
    update(props?: Record<string, any>): void;

    /** 销毁组件 */
    dispose(): void;
}
```

### 3.2 继承体系

```
ComposableBase
  └── ComponentBase (abilities: ThemeAbility, StyleAbility, EventBindingAbility)
        ├── Button (abilities: ClickAbility, DisableAbility, LoadingAbility)
        ├── Input (abilities: ValueAbility, ValidateAbility, PlaceholderAbility)
        ├── Select (abilities: ValueAbility, OptionsAbility, SearchAbility)
        ├── Table (abilities: DataSourceAbility, VirtualListAbility, SortAbility, ColumnAbility)
        ├── Form (abilities: ValidateAbility, SubmitAbility, FieldSetAbility)
        ├── Dialog (abilities: OpenableAbility, OverlayAbility, AnimationAbility)
        ├── HBox (abilities: LayoutAbility, ChildrenAbility)     ← 水平 Flex 布局
        ├── VBox (abilities: LayoutAbility, ChildrenAbility)     ← 垂直 Flex 布局
        ├── Grid (abilities: LayoutAbility, ChildrenAbility)     ← CSS Grid 布局
        └── Space (abilities: LayoutAbility, ChildrenAbility)    ← 间距布局
```

### 3.3 组件注册

复用 `@qimen-lab/registry`，新增 `ComponentRegistrar`：

```typescript
// @qimen-lab/component
import { RegistrarBase } from '@qimen-lab/registry';

class ComponentRegistrar extends RegistrarBase<Map<string, ComponentDefinition>> {
    readonly name = 'component';

    register(definition: ComponentDefinition): void;
    get(type: string): ComponentDefinition | undefined;
}

// 使用
Registry.component.register({
    type: ComponentTypes.BUTTON,
    component: ButtonComponent,
    defaultProps: { size: 'md', variant: 'primary' },
});
```

## 四、UI 能力定义

### 4.1 通用能力

| Ability | 说明 | 注入的属性/方法 |
|---------|------|----------------|
| `ThemeAbility` | 主题感知 | `theme`(getter), `themedClass(name)` |
| `StyleAbility` | 样式管理 | `addClass()`, `removeClass()`, `toggleClass()`, `setStyle()` |
| `EventBindingAbility` | DOM 事件 | `onDom()`, `offDom()`, 自动清理 |
| `VisibleAbility` | 可见性 | `visible`(getter/setter), `show()`, `hide()`, `toggle()` |
| `DisableAbility` | 禁用 | `disabled`(getter/setter), `enable()`, `disable()` |
| `LoadingAbility` | 加载状态 | `loading`(getter/setter), `withLoading(fn)` |
| `SizeAbility` | 尺寸 | `size`(getter/setter): 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' |
| `HandlerAbility` | 事件处理器 | `bindHandlers()`, `executeAction()`, `handlers` |
| `AnimationAbility` | 动画 | `play(name, options?)`, `stop()`, `animation` |

### 4.2 数据能力

| Ability | 说明 | 注入的属性/方法 |
|---------|------|----------------|
| `ValueAbility` | 值管理 | `value`(getter/setter), `onChange(handler)` |
| `ValidateAbility` | 验证 | `errors`(getter), `validate()`, `isValid`, `rules` |
| `DataSourceAbility` | 数据源 | `data`(getter/setter), `loading`, `refresh()`, `total`, `getRange()` |
| `FieldSetAbility` | 字段集 | `fields`(getter), `getFieldValue()`, `setFieldValue()`, `collectValues()` |
| `SubmitAbility` | 提交 | `submit()`, `onSubmit(handler)`, `submitting` |
| `VirtualListAbility` | 虚拟列表 | `visibleData`, `rowHeight`, `scrollTop`, `onScroll()` |

### 4.3 布局能力

| Ability | 说明 | 注入的属性/方法 |
|---------|------|----------------|
| `ChildrenAbility` | 子组件管理 | `children`(getter), `addChild()`, `removeChild()`, `getChild()` |
| `LayoutAbility` | 布局 | `layout`(getter/setter): 'vertical' \| 'horizontal' \| 'grid' |
| `PaginationAbility` | 分页 | `page`, `pageSize`, `total`, `onPageChange()` |
| `SortAbility` | 排序 | `sortField`, `sortOrder`, `onSortChange()` |
| `ColumnAbility` | 列定义 | `columns`(getter), `addColumn()`, `removeColumn()` |
| `OverlayAbility` | 浮层 | `overlayRoot`, `openOverlay()`, `closeOverlay()`, `zIndex` |

### 4.4 能力定义示例

```typescript
// @qimen-lab/component/abilities/ValueAbility.ts
import type { AbilityDefinition } from '@qimen-lab/composable';

export const ValueAbility: AbilityDefinition = {
    value: {
        get() {
            return this.abilityState('ValueAbility:value', () => undefined);
        },
        set(v) {
            const old = this.value;
            this.setAbilityState('ValueAbility:value', v);
            if (old !== v) {
                this.emit('change', { value: v, oldValue: old });
            }
        },
    },
    onChange(handler) {
        return this.on('change', handler);
    },
    reset() {
        this.value = undefined;
    },
};
```

## 五、JSON 驱动渲染

### 5.1 三层分离

```
Schema（数据结构）  +  Layout（布局描述）  +  Theme（视觉风格）
     │                      │                       │
     └──────────────────────┼───────────────────────┘
                            │
                       Renderer（渲染器）
                            │
                          DOM
```

- **Schema** — 描述"有什么字段"，复用 `@qimen-lab/schema`
- **Layout** — 描述"怎么放"，新增 `@qimen-lab/layout`
- **Theme** — 描述"长什么样"，新增 `@qimen-lab/theme`

### 5.2 Layout Schema

```typescript
// @qimen-lab/layout
interface LayoutNode {
    /** 组件类型（对应 ComponentRegistrar 中注册的 type） */
    type: string;

    /** 组件名称（用于事件名前缀和结构化 action 定位，不提供组件引用） */
    name?: string;

    /** 绑定的 Schema 字段名（可选） */
    field?: string;

    /** 组件属性 */
    props?: Record<string, any>;

    /** 子节点 */
    children?: LayoutNode[];

    /** 事件处理器映射（接近 ExtJS 的 handlers 模式） */
    handlers?: Record<string, string | HandlerAction>;

    /** 条件渲染 */
    visible?: boolean | string;  // string 时为表达式

    /** 循环渲染 */
    repeat?: {
        source: string;          // 数据源字段
        itemVar?: string;        // 循环变量名，默认 'item'
        indexVar?: string;       // 索引变量名，默认 'index'
    };

    /** 布局插槽 */
    slots?: Record<string, LayoutNode | LayoutNode[]>;

    /** 响应式配置 */
    responsive?: {
        sm?: Partial<LayoutNode>;
        md?: Partial<LayoutNode>;
        lg?: Partial<LayoutNode>;
    };
}

/** 结构化事件动作（可序列化，可存储，可传输） */
interface HandlerAction {
    /** 动作类型 */
    action: 'close' | 'submit' | 'reset' | 'navigate' | 'toggle' | 'emit' | 'custom';
    /** 动作目标 */
    target?: string;
    /** 动作参数 */
    params?: Record<string, any>;
}
```

### 5.3 语义化布局组件

不直接暴露 CSS 属性，用语义化布局组件映射到 Flexbox/Grid：

| 组件 | 说明 | 映射 |
|------|------|------|
| `HBox` | 水平排列 | `display: flex; flex-direction: row;` |
| `VBox` | 垂直排列 | `display: flex; flex-direction: column;` |
| `Grid` | 网格布局 | `display: grid; grid-template-columns: repeat(n, 1fr);` |
| `Space` | 等间距布局 | Flexbox + gap |

```json
// 语义化，可读性强
{ "type": "HBox", "gap": "sm", "align": "center" }
{ "type": "VBox", "gap": "md" }
{ "type": "Grid", "cols": 3, "gap": "md" }
{ "type": "Space", "size": "md", "wrap": true }

// 而不是暴露 CSS 属性
{ "type": "Container", "props": { "display": "flex", "flexDirection": "row", "gap": "8px", "alignItems": "center" }}
```

### 5.4 Handler 模式事件绑定

接近 ExtJS 的 handlers 配置，JSON 可序列化：

```json
{
    "type": "Button",
    "text": "删除",
    "handlers": {
        "click": "onDelete"
    }
}
```

渲染时从 RenderContext 中查找：

```typescript
interface RenderContext {
    /** Schema 实例（字段定义 + 验证规则） */
    schema?: Schema;

    /** 数据源（EntityManager 或普通对象） */
    data?: any;

    /** 事件处理器映射 */
    handlers: Record<string, (component: ComponentBase, event?: Event) => void>;

    /** 父组件 */
    parent?: ComponentBase;
}

// Renderer 中绑定
if (node.handlers) {
    for (const [event, action] of Object.entries(node.handlers)) {
        if (typeof action === 'string') {
            // 字符串映射到 context.handlers
            const fn = context.handlers[action];
            if (fn) component.onDom(event, (e) => fn(component, e));
        } else {
            // 结构化 action，内置动作分发
            component.onDom(event, () => component.executeAction(action));
        }
    }
}
```

也支持结构化动作（无需写 JS 函数）：

```json
{
    "type": "Button",
    "text": "关闭",
    "handlers": {
        "click": { "action": "close", "target": "parentDialog" }
    }
}
```

**HandlerAbility 定义**：

```typescript
export const HandlerAbility: AbilityDefinition = {
    handlers: {
        get() {
            return this.abilityState('HandlerAbility:map', () => ({}));
        },
    },
    bindHandlers(handlers: Record<string, string | HandlerAction>, context: RenderContext) {
        const map = this.handlers;
        for (const [event, action] of Object.entries(handlers)) {
            if (typeof action === 'string') {
                const fn = context.handlers[action];
                if (fn) {
                    this.onDom(event, (e) => fn(this, e));
                    map[event] = action;
                }
            } else {
                this.onDom(event, () => this.executeAction(action));
                map[event] = action;
            }
        }
    },
    executeAction(action: HandlerAction) {
        // 内置 action 分发：close, submit, reset, navigate, toggle...
    },
};
```

### 5.5 Layout 示例

**用户表单**：

```json
{
    "type": "Form",
    "layout": "vertical",
    "props": { "labelWidth": "80px" },
    "children": [
        {
            "type": "Input",
            "field": "username",
            "props": { "placeholder": "请输入用户名", "prefixIcon": "user" }
        },
        {
            "type": "Input",
            "field": "email",
            "props": { "inputType": "email", "placeholder": "请输入邮箱" }
        },
        {
            "type": "Select",
            "field": "role",
            "props": { "placeholder": "请选择角色" }
        },
        {
            "type": "HBox",
            "props": { "gap": "sm" },
            "children": [
                { "type": "Button", "props": { "text": "提交", "variant": "primary" }, "handlers": { "click": "onSubmit" } },
                { "type": "Button", "props": { "text": "重置", "variant": "default" }, "handlers": { "click": { "action": "reset" } } }
            ]
        }
    ]
}
```

**数据表格**：

```json
{
    "type": "Table",
    "props": { "bordered": true, "striped": true, "virtual": true },
    "children": [
        {
            "type": "Column",
            "props": { "field": "username", "title": "用户名", "width": 120, "sortable": true }
        },
        {
            "type": "Column",
            "props": { "field": "email", "title": "邮箱" }
        },
        {
            "type": "Column",
            "props": { "field": "role", "title": "角色", "width": 100 }
        },
        {
            "type": "Column",
            "props": { "title": "操作", "width": 150 },
            "slots": {
                "cell": {
                    "type": "HBox",
                    "props": { "gap": "xs" },
                    "children": [
                        { "type": "Button", "props": { "text": "编辑", "size": "sm" }, "handlers": { "click": "onEdit" } },
                        { "type": "Button", "props": { "text": "删除", "size": "sm", "variant": "danger" }, "handlers": { "click": "onDelete" } }
                    ]
                }
            }
        }
    ]
}
```

### 5.6 渲染上下文（RenderContext）

渲染上下文贯穿整个渲染流程，所有 Pipeline 步骤共享同一个上下文对象：

```typescript
// @qimen-lab/renderer

/** 渲染阶段 */
enum RenderPhase {
    INIT    = 'init',     // 初始渲染：create → template → inject → bind → mount
    UPDATE  = 'update',   // 更新渲染：只重新绑定变化的属性
    DESTROY = 'destroy',  // 销毁：清理子组件、移除 DOM
}

interface RenderContext {
    /** 渲染阶段 */
    phase: RenderPhase;

    /** 当前 Layout 节点 */
    node: LayoutNode;

    /** Schema 实例（字段定义 + 验证规则） */
    schema?: Schema;

    /** 数据源映射（按名称查找） */
    dataSources?: Record<string, IDataSource>;

    /** 事件处理器映射 */
    handlers: Record<string, (component: ComponentBase, event?: Event) => void>;

    /** 父组件 */
    parent?: ComponentBase;

    /** 目标容器 */
    container?: HTMLElement | string;

    // ---- 以下由 Pipeline 步骤填充 ----

    /** 创建的组件实例（create 步骤填充） */
    component?: ComponentBase;

    /** 克隆的 DOM 片段（template 步骤填充） */
    fragment?: DocumentFragment;

    /** 渲染的子组件列表（children 步骤填充） */
    childComponents?: ComponentBase[];
}
```

### 5.7 渲染注册表（RenderRegistrar）

控制渲染流程的注册表，管理渲染 Pipeline 的处理器。复用 `@qimen-lab/registry` 的 `RegistrarBase`：

```typescript
// @qimen-lab/renderer
import { RegistrarBase } from '@qimen-lab/registry';
import type { Processor } from '@qimen-lab/pipeline';

/** 渲染阶段权重 */
enum RenderWeight {
    CREATE         = 100,   // 创建组件实例
    TEMPLATE       = 200,   // 克隆模板
    INJECT         = 300,   // 注入能力
    BIND_SCHEMA    = 400,   // 绑定 Schema 字段
    BIND_HANDLER   = 500,   // 绑定事件处理器
    BIND_DATASOURCE = 600,  // 绑定数据源
    BIND_CHILDREN  = 700,   // 渲染子节点
    BIND_SLOTS     = 800,   // 渲染插槽
    BIND_REPEAT    = 900,   // 循环渲染
    MOUNT          = 1000,  // 挂载到 DOM
    DESTROY        = 1000,  // 销毁（与 MOUNT 同权重，通过 phases 区分）
}

/** 渲染处理器 — 扩展 Processor，增加 phases 声明 */
interface RenderProcessor extends Processor<RenderContext> {
    /** 适用的渲染阶段，不声明则默认全部阶段 */
    phases?: RenderPhase[];
}

class RenderRegistrar extends RegistrarBase<Map<string, RenderProcessor[]>> {
    readonly name = 'render';

    /** 注册渲染处理器 */
    register(processor: RenderProcessor): void;

    /** 获取指定阶段的处理器 */
    getPhase(weight: RenderWeight): RenderProcessor[];

    /** 获取指定渲染阶段的管道（按 weight 排序，按 phases 过滤） */
    getPipeline(phase: RenderPhase): RenderProcessor[];
}
```

### 5.8 渲染 Pipeline

复用 `@qimen-lab/pipeline` 的 `Pipeline` 执行器，天然获得跟踪、计时、统计、熔断能力：

```typescript
// @qimen-lab/renderer
import { Pipeline } from '@qimen-lab/pipeline';
import type { Processor, PipelineResult } from '@qimen-lab/pipeline';

class Renderer {
    private pipeline = new Pipeline();
    private registrar = RenderRegistrar.getInstance();

    /** 渲染 Layout 节点 */
    async render(node: LayoutNode, context: Partial<RenderContext>): Promise<PipelineResult<RenderContext>> {
        const phase = context.phase ?? RenderPhase.INIT;
        const ctx: RenderContext = {
            phase,
            node,
            handlers: context.handlers ?? {},
            dataSources: context.dataSources,
            schema: context.schema,
            parent: context.parent,
            container: context.container,
        };

        // 根据 phase 过滤适用的处理器
        const processors = this.registrar.getPipeline(phase);
        const result = await this.pipeline.execute(ctx, processors, {
            enableTracking: true,
            enableTiming: true,
            pipelineName: `Render:${phase}:${node.type}`,
        });

        return result;
    }

    /** 更新已渲染的组件 */
    async update(component: ComponentBase, node: LayoutNode, context: Partial<RenderContext>): Promise<PipelineResult<RenderContext>> {
        const ctx: RenderContext = {
            phase: RenderPhase.UPDATE,
            node,
            component,  // 已有组件实例
            handlers: context.handlers ?? {},
            dataSources: context.dataSources,
            schema: context.schema,
        };

        const processors = this.registrar.getPipeline(RenderPhase.UPDATE);
        return this.pipeline.execute(ctx, processors, {
            enableTracking: true,
            enableTiming: true,
            pipelineName: `Render:update:${node.type}`,
        });
    }

    /** 销毁组件 */
    async destroy(component: ComponentBase): Promise<PipelineResult<RenderContext>> {
        const ctx: RenderContext = {
            phase: RenderPhase.DESTROY,
            node: { type: component.constructor.name },
            component,
            handlers: {},
        };

        const processors = this.registrar.getPipeline(RenderPhase.DESTROY);
        return this.pipeline.execute(ctx, processors, {
            enableTracking: true,
            enableTiming: true,
            pipelineName: `Render:destroy:${ctx.node.type}`,
        });
    }

    /** 递归渲染子节点 */
    async renderChildren(nodes: LayoutNode[], context: RenderContext): Promise<ComponentBase[]> {
        const children: ComponentBase[] = [];
        for (const node of nodes) {
            const result = await this.render(node, context);
            if (result.context.component) {
                children.push(result.context.component);
            }
        }
        return children;
    }
}
```

### 5.9 内置渲染处理器

```typescript
// ---- CREATE (100) — 仅初始渲染 ----
const createProcessor: RenderProcessor = {
    name: 'render-create',
    weight: RenderWeight.CREATE,
    phases: [RenderPhase.INIT],
    description: '创建组件实例',
    async execute(ctx) {
        const def = Registry.component.get(ctx.node.type);
        if (!def) throw new Error(`Component "${ctx.node.type}" not registered`);
        ctx.component = new def.component(ctx.node.props);
    },
};

// ---- TEMPLATE (200) — 仅初始渲染 ----
const templateProcessor: RenderProcessor = {
    name: 'render-template',
    weight: RenderWeight.TEMPLATE,
    phases: [RenderPhase.INIT],
    description: '克隆 HTML 模板',
    async execute(ctx) {
        if (!ctx.component) return;
        const tpl = TemplateRegistry.get(ctx.node.type);
        if (tpl) {
            ctx.fragment = tpl;
            ctx.component.el = tpl.firstElementChild as HTMLElement;
        }
    },
};

// ---- INJECT (300) — 仅初始渲染 ----
const injectProcessor: RenderProcessor = {
    name: 'render-inject',
    weight: RenderWeight.INJECT,
    phases: [RenderPhase.INIT],
    description: '注入额外能力',
    async execute(ctx) {
        if (!ctx.component) return;
        // ComponentBase 构造时已自动注入 static abilities
        // 此步骤处理 LayoutNode 中声明的动态能力
        if (ctx.node.abilities) {
            for (const ability of ctx.node.abilities) {
                ctx.component.setupAbilityDefinition(ability);
            }
        }
    },
};

// ---- BIND_SCHEMA (400) — 初始 + 更新 ----
const bindSchemaProcessor: RenderProcessor = {
    name: 'render-bind-schema',
    weight: RenderWeight.BIND_SCHEMA,
    phases: [RenderPhase.INIT, RenderPhase.UPDATE],
    description: '绑定 Schema 字段',
    async execute(ctx) {
        if (!ctx.component || !ctx.node.field || !ctx.schema) return;
        const field = ctx.schema.getField(ctx.node.field);
        if (field) ctx.component.bindField(field);
    },
};

// ---- BIND_HANDLER (500) — 仅初始渲染 ----
const bindHandlerProcessor: RenderProcessor = {
    name: 'render-bind-handler',
    weight: RenderWeight.BIND_HANDLER,
    phases: [RenderPhase.INIT],
    description: '绑定事件处理器',
    async execute(ctx) {
        if (!ctx.component || !ctx.node.handlers) return;
        ctx.component.bindHandlers(ctx.node.handlers, ctx);
    },
};

// ---- BIND_DATASOURCE (600) — 初始 + 更新 ----
const bindDataSourceProcessor: RenderProcessor = {
    name: 'render-bind-datasource',
    weight: RenderWeight.BIND_DATASOURCE,
    phases: [RenderPhase.INIT, RenderPhase.UPDATE],
    description: '绑定数据源',
    async execute(ctx) {
        if (!ctx.component || !ctx.node.dataSource) return;
        const ds = ctx.dataSources?.[ctx.node.dataSource];
        if (ds) ctx.component.dataSource = ds;
    },
};

// ---- BIND_CHILDREN (700) — 初始 + 更新 ----
const bindChildrenProcessor: RenderProcessor = {
    name: 'render-bind-children',
    weight: RenderWeight.BIND_CHILDREN,
    phases: [RenderPhase.INIT, RenderPhase.UPDATE],
    description: '渲染子节点',
    async execute(ctx) {
        if (!ctx.component || !ctx.node.children) return;
        const renderer = new Renderer();
        ctx.childComponents = await renderer.renderChildren(ctx.node.children, ctx);
        for (const child of ctx.childComponents) {
            ctx.component.addChild(child);
        }
    },
};

// ---- MOUNT (1000) — 仅初始渲染 ----
const mountProcessor: RenderProcessor = {
    name: 'render-mount',
    weight: RenderWeight.MOUNT,
    phases: [RenderPhase.INIT],
    description: '挂载到 DOM',
    async execute(ctx) {
        if (!ctx.component) return;
        ctx.component.mount(ctx.container ?? ctx.parent?.el);
    },
};

// ---- DESTROY (1000) — 仅销毁 ----
const destroyProcessor: RenderProcessor = {
    name: 'render-destroy',
    weight: RenderWeight.DESTROY,
    phases: [RenderPhase.DESTROY],
    description: '销毁组件',
    async execute(ctx) {
        if (!ctx.component) return;
        // 先销毁子组件
        if (ctx.component.children) {
            for (const child of ctx.component.children) {
                await ctx.component.removeChild(child);
            }
        }
        ctx.component.dispose();
        ctx.component.unmount();
    },
};
```

**各阶段执行的 Pipeline 步骤**：

| 步骤 | INIT | UPDATE | DESTROY |
|------|------|--------|---------|
| create | ✓ | | |
| template | ✓ | | |
| inject | ✓ | | |
| bind-schema | ✓ | ✓ | |
| bind-handler | ✓ | | |
| bind-datasource | ✓ | ✓ | |
| bind-children | ✓ | ✓ | |
| mount | ✓ | | |
| destroy | | | ✓ |

### 5.10 Pipeline 的优势

**1. 可扩展** — 注册自定义处理器：

```typescript
RenderRegistrar.register({
    name: 'render-analytics',
    weight: RenderWeight.MOUNT + 100,  // mount 之后
    description: '上报组件渲染埋点',
    async execute(ctx) {
        analytics.track('component_rendered', { type: ctx.node.type });
    },
});
```

**2. 可替换** — 同 weight + offset 替换默认步骤：

```typescript
// SSR 场景替换 mount 步骤
RenderRegistrar.register({
    name: 'render-ssr-string',
    weight: RenderWeight.MOUNT,
    offset: 1,  // 同 weight 内优先
    description: 'SSR 输出 HTML 字符串',
    async execute(ctx) {
        ctx.htmlString = ctx.component.el.outerHTML;
    },
});
```

**3. 可调试** — 复用 Pipeline 内置的跟踪、计时、统计：

```typescript
const result = await renderer.render(node, context);

// 查看执行报告
renderer.pipeline.printReport(result);

// 查看统计
const stats = renderer.pipeline.getStats();
console.log(`平均渲染耗时: ${stats.averageDuration}ms`);

// 查看每个步骤耗时
result.steps.forEach(step => {
    console.log(`${step.processor}: ${step.duration}ms (${step.action})`);
});
```

**4. 熔断** — 处理器可通过 `context.metadata.terminate` 终止后续步骤：

```typescript
// 条件渲染：visible=false 时跳过后续所有步骤
const visibleCheckProcessor: Processor<RenderContext> = {
    name: 'render-visible-check',
    weight: RenderWeight.CREATE - 10,  // create 之前
    async execute(ctx) {
        if (ctx.node.visible === false) {
            setTerminate(ctx, 'Component not visible');
        }
    },
};
```

**5. 与现有架构一致** — DataProcessor、Validation、HTTP 都用 Pipeline，渲染也用 Pipeline，统一的心智模型。

## 六、更新机制 — 事件驱动

### 6.1 核心思路

**不引入虚拟 DOM，不引入响应式系统**。QimenJS 已有完整的事件体系（`EventAbility` + `DomEventsAbility`），组件更新完全由事件驱动：

```
数据变更 → emit 事件 → 组件监听 → 更新 DOM
```

与 Vue/React 的对比：

| | Vue/React | QimenJS 事件驱动 |
|---|---|---|
| 数据变了 | 响应式追踪 → VDOM diff → patch | emit 事件 → 监听方自己更新 |
| 更新粒度 | 自动细粒度 | 开发者控制，想更新哪就更新哪 |
| 性能 | 大量节点时 diff 有开销 | 无 diff 开销，但需避免重复更新 |
| 心智模型 | 声明式：数据驱动视图 | 命令式：事件驱动更新 |

### 6.2 事件驱动更新示例

```typescript
// EntityManager 数据变了 → Table 自动刷新
mgr.onDataChange(() => table.update());

// Input 值变了 → Form 重新校验
input.on('change', () => form.validate());

// 主题切换了 → 所有组件重新应用主题
themeManager.on('theme:change', () => component.applyTheme());

// 分页变了 → 重新查询
table.on('pageChange', () => mgr.list({ page: table.page }));
```

### 6.3 markDirty — 批量更新合并

同一帧内多次事件可能触发多次 DOM 更新，用 `markDirty` + 微任务合并：

```typescript
class ComponentBase extends ComposableBase {
    private _dirty = false;

    /** 标记需要更新，同一微任务内只执行一次 update */
    markDirty() {
        if (this._dirty) return;
        this._dirty = true;
        queueMicrotask(() => {
            this._dirty = false;
            this.update();
        });
    }
}
```

这不是 VDOM，只是一个去抖机制，几行代码。组件自己决定 `update()` 里更新哪些 DOM。

### 6.4 列表局部更新（可选优化）

对于 Table 行、Select 选项等列表场景，如果全量更新性能不够，可局部引入 key-based 更新：

```typescript
// 仅更新变化的行，而非重新渲染整个表格
updateRows(changes: { key: any; data: any }[]) {
    changes.forEach(({ key, data }) => {
        const row = this.getRowByKey(key);
        if (row) row.update(data);
    });
}
```

不需要全局 VDOM，只在需要的地方做局部优化。

## 七、主题系统

### 7.1 设计原则

- **内置原子化 CSS 生成器** — 不引入 UnoCSS/Tailwind 依赖，自研轻量原子化 CSS 按需生成
- **Design Tokens 数据驱动** — 主题本质是设计令牌的集合，用 JSON 定义
- **CSS 变量输出** — 运行时通过 CSS 变量实现主题切换，零 JS 开销
- **组件样式用 CSS 类** — 组件打包时输出 `.css` 文件，样式用 CSS 变量引用令牌

### 7.2 内置原子化 CSS 生成器

不引入 UnoCSS 依赖，自研轻量原子化 CSS 按需生成。核心逻辑：**token → class → CSS 规则**。

```typescript
// @qimen-lab/theme/atomic.ts

/** 原子化 CSS 规则映射 */
const atomicRules: Record<string, (value: string) => string> = {
    // spacing
    'p-{size}': (v) => `padding: var(--q-spacing-${v});`,
    'px-{size}': (v) => `padding-left: var(--q-spacing-${v}); padding-right: var(--q-spacing-${v});`,
    'py-{size}': (v) => `padding-top: var(--q-spacing-${v}); padding-bottom: var(--q-spacing-${v});`,
    'm-{size}': (v) => `margin: var(--q-spacing-${v});`,
    'mx-{size}': (v) => `margin-left: var(--q-spacing-${v}); margin-right: var(--q-spacing-${v});`,
    'my-{size}': (v) => `margin-top: var(--q-spacing-${v}); margin-bottom: var(--q-spacing-${v});`,
    'gap-{size}': (v) => `gap: var(--q-spacing-${v});`,

    // colors
    'bg-{color}': (v) => `background: var(--q-color-${v});`,
    'text-{color}': (v) => `color: var(--q-color-${v});`,
    'border-{color}': (v) => `border-color: var(--q-color-${v});`,

    // radius
    'rounded-{size}': (v) => `border-radius: var(--q-radius-${v});`,

    // flex
    'flex': () => 'display: flex;',
    'flex-col': () => 'display: flex; flex-direction: column;',
    'flex-wrap': () => 'flex-wrap: wrap;',
    'items-center': () => 'align-items: center;',
    'items-start': () => 'align-items: flex-start;',
    'items-end': () => 'align-items: flex-end;',
    'justify-center': () => 'justify-content: center;',
    'justify-between': () => 'justify-content: space-between;',
    'justify-end': () => 'justify-content: flex-end;',
    'flex-1': () => 'flex: 1;',
    'shrink-0': () => 'flex-shrink: 0;',

    // grid
    'grid': () => 'display: grid;',
    'grid-cols-{n}': (v) => `grid-template-columns: repeat(${v}, 1fr);`,

    // sizing
    'w-full': () => 'width: 100%;',
    'h-full': () => 'height: 100%;',

    // text
    'text-{size}': (v) => `font-size: var(--q-font-size-${v});`,
    'font-{weight}': (v) => `font-weight: var(--q-font-weight-${v});`,

    // shadow
    'shadow-{size}': (v) => `box-shadow: var(--q-shadow-${v});`,

    // overflow
    'overflow-auto': () => 'overflow: auto;',
    'overflow-hidden': () => 'overflow: hidden;',
};

class AtomicCSS {
    private cache = new Map<string, string>();
    private styleEl?: HTMLStyleElement;

    /** 解析 class 名，生成 CSS 规则，注入 <style> */
    resolve(className: string): string;

    /** 批量解析，生成完整样式表 */
    generate(classNames: string[]): string;
}
```

使用方式：

```typescript
// 组件中使用
this.el.className = 'q-flex q-items-center q-gap-sm q-px-md q-py-sm q-bg-primary q-rounded-md q-text-white';

// AtomicCSS 按需生成对应的 CSS 规则，注入到 <style> 标签
// 只有实际用到的 class 才会生成，不是预生成全量
```

### 7.3 Theme 定义

```typescript
// @qimen-lab/theme
interface ThemeDefinition {
    name: string;
    tokens: DesignTokens;
}

interface DesignTokens {
    colors: {
        primary: string;
        secondary: string;
        success: string;
        warning: string;
        error: string;
        info: string;
        bg: string;
        'bg-secondary': string;
        text: string;
        'text-secondary': string;
        border: string;
        [key: string]: string;
    };
    spacing: {
        xs: number;   // 4px
        sm: number;   // 8px
        md: number;   // 16px
        lg: number;   // 24px
        xl: number;   // 32px
    };
    radius: {
        none: number;
        sm: number;
        md: number;
        lg: number;
        round: string;  // '50%' or '9999px'
    };
    font: {
        family: string;
        size: { xs: number; sm: number; md: number; lg: number; xl: number; xxl: number };
        weight: { normal: number; medium: number; bold: number };
        lineHeight: { tight: number; normal: number; loose: number };
    };
    shadow: {
        none: string;
        sm: string;
        md: string;
        lg: string;
    };
    transition: {
        fast: string;   // '150ms ease'
        normal: string; // '250ms ease'
        slow: string;   // '350ms ease'
    };
    breakpoint: {
        sm: number;  // 640
        md: number;  // 768
        lg: number;  // 1024
        xl: number;  // 1280
    };
}
```

### 7.4 内置主题

**亮色主题 (Light)**：

```json
{
    "name": "light",
    "tokens": {
        "colors": {
            "primary": "#1890ff",
            "success": "#52c41a",
            "warning": "#faad14",
            "error": "#ff4d4f",
            "bg": "#ffffff",
            "bg-secondary": "#f5f5f5",
            "text": "#333333",
            "text-secondary": "#999999",
            "border": "#d9d9d9"
        },
        "spacing": { "xs": 4, "sm": 8, "md": 16, "lg": 24, "xl": 32 },
        "radius": { "none": 0, "sm": 2, "md": 4, "lg": 8, "round": "50%" },
        "font": {
            "family": "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            "size": { "xs": 12, "sm": 13, "md": 14, "lg": 16, "xl": 18, "xxl": 22 }
        }
    }
}
```

**暗色主题 (Dark)**：

```json
{
    "name": "dark",
    "tokens": {
        "colors": {
            "primary": "#177ddc",
            "success": "#49aa19",
            "warning": "#d89614",
            "error": "#d32029",
            "bg": "#141414",
            "bg-secondary": "#1f1f1f",
            "text": "#ffffffd9",
            "text-secondary": "#ffffff73",
            "border": "#434343"
        }
    }
}
```

### 7.5 ThemeManager

```typescript
// @qimen-lab/theme
class ThemeManager {
    /** 当前主题名 */
    current: string;

    /** 注册主题 */
    register(theme: ThemeDefinition): void;

    /** 切换主题 — 更新 CSS 变量 */
    apply(name: string): void;

    /** 获取令牌值 */
    getToken(path: string): string | number;

    /** 生成 CSS 变量样式文本 */
    toCSSVariables(): string;

    /** 监听主题变更 */
    onThemeChange(handler: (theme: string) => void): () => void;
}
```

切换主题的实现：

```typescript
apply(name: string): void {
    const theme = this.themes.get(name);
    if (!theme) return;

    // 更新 :root 上的 CSS 变量
    const root = document.documentElement;
    const tokens = theme.tokens;
    flattenTokens(tokens).forEach(([key, value]) => {
        root.style.setProperty(`--q-${key}`, String(value));
    });

    this.current = name;
    this.emit('theme:change', { name });
}
```

### 7.6 组件样式

组件打包时输出 `.css` 文件，样式用 CSS 变量：

```css
/* @qimen-lab/component/styles/button.css */
.q-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--q-spacing-xs) var(--q-spacing-md);
    font-size: var(--q-font-size-md);
    border-radius: var(--q-radius-md);
    border: 1px solid var(--q-color-primary);
    background: var(--q-color-primary);
    color: #fff;
    cursor: pointer;
    transition: all var(--q-transition-fast);
}

.q-button:hover { opacity: 0.85; }
.q-button--disabled { opacity: 0.5; cursor: not-allowed; }
.q-button--sm { padding: var(--q-spacing-xs) var(--q-spacing-sm); font-size: var(--q-font-size-sm); }
.q-button--lg { padding: var(--q-spacing-sm) var(--q-spacing-lg); font-size: var(--q-font-size-lg); }
```

## 八、HTML 模板注册表

### 8.1 设计思路

使用浏览器原生 `<template>` 标签 + `cloneNode` 实现模板复用，解决组件 HTML 模板的继承和替换问题。

### 8.2 TemplateRegistry

```typescript
// @qimen-lab/component/template-registry.ts
class TemplateRegistry {
    private templates = new Map<string, HTMLTemplateElement>();

    /** 注册模板 */
    register(name: string, template: HTMLTemplateElement): void;

    /** 获取模板克隆（每次克隆，互不干扰） */
    get(name: string): DocumentFragment {
        const tpl = this.templates.get(name);
        if (!tpl) throw new Error(`Template "${name}" not found`);
        return tpl.content.cloneNode(true) as DocumentFragment;
    }

    /** 从 HTML 字符串注册 */
    registerHTML(name: string, html: string): void {
        const tpl = document.createElement('template');
        tpl.innerHTML = html;
        this.register(name, tpl);
    }

    /** 扩展已有模板（继承） */
    extend(baseName: string, newName: string, patches: TemplatePatch[]): void;
}
```

### 8.3 模板定义

```html
<!-- 基础按钮模板 -->
<template id="q-tpl-button">
    <button class="q-button" part="button">
        <span class="q-button__icon" data-ref="icon"></span>
        <span class="q-button__text" data-ref="text"></span>
    </button>
</template>

<!-- 基础输入框模板 -->
<template id="q-tpl-input">
    <div class="q-input" part="wrapper">
        <span class="q-input__prefix" data-ref="prefix"></span>
        <input class="q-input__field" data-ref="field" />
        <span class="q-input__suffix" data-ref="suffix"></span>
    </div>
</template>

<!-- 基础表格模板 -->
<template id="q-tpl-table">
    <div class="q-table" part="wrapper">
        <div class="q-table__header" data-ref="header"></div>
        <div class="q-table__body" data-ref="body"></div>
        <div class="q-table__footer" data-ref="footer"></div>
    </div>
</template>
```

### 8.4 组件使用模板

```typescript
class ButtonComponent extends ComponentBase {
    render() {
        // 从注册表克隆模板
        const frag = TemplateRegistry.get('button');
        this.el = frag.firstElementChild as HTMLElement;

        // 通过 data-ref 查找子元素
        this.textEl = this.el.querySelector('[data-ref="text"]');
        this.iconEl = this.el.querySelector('[data-ref="icon"]');

        // 填充内容
        this.textEl.textContent = this.props.text;
    }
}
```

### 8.5 模板替换与继承

```typescript
// 替换：换主题时只换模板，不改组件代码
TemplateRegistry.registerHTML('button', '<button class="my-btn"><span data-ref="text"></span></button>');

// 继承：基于基础模板扩展
TemplateRegistry.extend('button', 'icon-button', [
    { action: 'prepend', selector: '.q-button', html: '<span data-ref="icon" class="q-button__icon"></span>' }
]);
```

**优势**：
- 模板可替换 — 换主题时只换模板注册，不改组件代码
- 模板可继承 — 基础模板 + 扩展点
- 性能好 — `cloneNode` 比 `innerHTML` 快
- 可外部定义 — 模板可以从 HTML 文件加载，也可以从 JSON 生成

## 九、隐藏根容器（OverlayRoot）

### 9.1 设计思路

弹窗、下拉、Tooltip 等组件需要脱离当前 DOM 位置渲染。在 `<body>` 下创建一个全局隐藏根容器，所有浮层组件渲染到该容器中。

### 9.2 OverlayRoot

```typescript
// @qimen-lab/component/overlay-root.ts
class OverlayRoot {
    private static instance: HTMLElement;

    static getRoot(): HTMLElement {
        if (!this.instance) {
            const el = document.createElement('div');
            el.id = 'q-overlay-root';
            el.style.cssText = 'position: fixed; top: 0; left: 0; width: 0; height: 0; z-index: 1000; pointer-events: none;';
            document.body.appendChild(el);
            this.instance = el;
        }
        return this.instance;
    }
}
```

### 9.3 OverlayAbility

```typescript
export const OverlayAbility: AbilityDefinition = {
    overlayRoot: {
        get() {
            return OverlayRoot.getRoot();
        },
    },
    openOverlay(content: HTMLElement, options?: OverlayOptions) {
        const overlay = document.createElement('div');
        overlay.className = 'q-overlay';
        overlay.style.pointerEvents = 'auto';
        overlay.style.zIndex = String(nextZIndex(options?.layer));
        overlay.appendChild(content);
        this.overlayRoot.appendChild(overlay);
        this.setAbilityState('OverlayAbility:el', overlay);
    },
    closeOverlay() {
        const overlay = this.abilityState('OverlayAbility:el') as HTMLElement;
        if (overlay) {
            overlay.remove();
            this.setAbilityState('OverlayAbility:el', null);
        }
    },
};
```

**解决的问题**：
- 不受父容器 `overflow: hidden` / `transform` 影响
- z-index 统一管理
- 弹窗关闭时从容器移除

## 十、z-index 管理

### 10.1 层级常量 + CSS 变量

不使用注册表，用预定义层级常量 + CSS 变量 + 同层递增：

```typescript
// @qimen-lab/component/z-index.ts
const Z_LAYERS = {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    toast: 1080,
} as const;

type ZLayer = keyof typeof Z_LAYERS;

// 同层级内递增（两个 modal 同时存在）
const layerCounters = new Map<ZLayer, number>();

function nextZIndex(layer: ZLayer): number {
    const count = (layerCounters.get(layer) || 0) + 1;
    layerCounters.set(layer, count);
    return Z_LAYERS[layer] + count * 10;
}

function releaseZIndex(layer: ZLayer): void {
    const count = layerCounters.get(layer) || 0;
    if (count > 0) layerCounters.set(layer, count - 1);
}
```

CSS 变量让主题可覆盖：

```css
:root {
    --q-z-dropdown: 1000;
    --q-z-modal: 1050;
    --q-z-toast: 1080;
}
```

**为什么不用注册表**：层级常量覆盖 99% 场景，注册表过度设计。同层递增解决多个同类型弹窗叠加问题。

## 十一、动画能力

### 11.1 设计思路

CSS transition 处理大部分场景，特定动画用 `@keyframes`，通过 AnimationAbility 控制触发。

### 11.2 内置动画定义

```css
/* @qimen-lab/component/styles/animations.css */
@keyframes q-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes q-fade-out { from { opacity: 1; } to { opacity: 0; } }
@keyframes q-slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes q-slide-down { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes q-slide-left { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
@keyframes q-slide-right { from { transform: translateX(-20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
@keyframes q-zoom-in { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
@keyframes q-zoom-out { from { transform: scale(1.1); opacity: 0; } to { transform: scale(1); opacity: 1; } }
@keyframes q-collapse { from { max-height: 0; opacity: 0; } to { max-height: 500px; opacity: 1; } }
@keyframes q-expand { from { max-height: 500px; opacity: 1; } to { max-height: 0; opacity: 0; } }
```

### 11.3 AnimationAbility

```typescript
export const AnimationAbility: AbilityDefinition = {
    animation: {
        get() {
            return this.abilityState('AnimationAbility:manager', () => new AnimationManager(this));
        },
    },
    /** 播放动画 */
    play(name: string, options?: AnimationOptions): Promise<void> {
        return this.animation.play(name, options);
    },
    /** 停止动画 */
    stop() {
        this.animation.stop();
    },
};

interface AnimationOptions {
    duration?: number;
    easing?: string;
    delay?: number;
    direction?: 'normal' | 'reverse' | 'alternate';
    fill?: 'none' | 'forwards' | 'backwards' | 'both';
}

class AnimationManager {
    private current: Animation | null = null;

    play(name: string, options?: AnimationOptions): Promise<void> {
        this.stop();
        return new Promise((resolve) => {
            this.current = this.host.el.animate(
                // 使用 Web Animations API
                [{ animationName: name, ...options }],
                { duration: options?.duration ?? 200, easing: options?.easing ?? 'ease', fill: options?.fill ?? 'forwards' }
            );
            this.current.onfinish = () => resolve();
        });
    }

    stop() {
        if (this.current) {
            this.current.cancel();
            this.current = null;
        }
    }
}
```

### 11.4 组件使用

```typescript
// Dialog 打开
dialog.play('q-zoom-in', { duration: 200 });

// Dialog 关闭
await dialog.play('q-fade-out', { duration: 150 });
dialog.close();

// 简单过渡用 CSS transition
.el { transition: opacity var(--q-transition-fast); }
```

**分层**：简单场景用 CSS transition，复杂场景用 AnimationAbility + keyframes。

## 十二、组件事件注册表

### 12.1 设计思路

DOM 事件（click, input, focus...）是固定的，不需要注册表。业务事件（submit, change, sort, pageChange...）注册表有意义，但定位为**开发辅助**而非运行时核心。

### 12.2 ComponentEventRegistry

```typescript
// @qimen-lab/component/event-registry.ts
interface EventDefinition {
    name: string;
    description: string;
    payload: Record<string, string>;  // 参数描述
}

class ComponentEventRegistry {
    private events = new Map<string, EventDefinition[]>();

    /** 注册组件的事件 */
    register(componentType: string, events: EventDefinition[]): void;

    /** 查询组件有哪些事件 */
    getEvents(componentType: string): EventDefinition[];

    /** 校验事件名是否合法 */
    isValidEvent(componentType: string, eventName: string): boolean;
}

// 注册示例
ComponentEventRegistry.register('Table', [
    { name: 'pageChange', description: '分页变更', payload: { page: 'number', pageSize: 'number' } },
    { name: 'sortChange', description: '排序变更', payload: { field: 'string', order: 'string' } },
    { name: 'rowClick', description: '行点击', payload: { row: 'object', index: 'number' } },
    { name: 'rowDblClick', description: '行双击', payload: { row: 'object', index: 'number' } },
]);
```

### 12.3 价值

- **编辑器提示** — JSON 渲染时，编辑器可以提示可用事件
- **运行时校验** — 校验 handlers 中的事件名是否合法
- **文档自动生成** — 从注册表生成组件事件文档
- **开发时辅助**，不是运行时核心依赖

## 十三、虚拟列表

### 13.1 设计思路

参考 ExtJS 的 Grid 模式，只渲染可视区域的行，滚动时动态替换。内置分页获取数据，但显示上无感，实现无分页浏览。

```
只渲染可视区域的行，滚动时动态替换
┌─────────────────────┐
│  行 1 (DOM)         │  ← 可视区域
│  行 2 (DOM)         │
│  行 3 (DOM)         │
│  行 4 (DOM)         │
├─────────────────────┤
│  行 5 (不在DOM)     │  ← 不可见，只有数据
│  行 6 (不在DOM)     │
│  ...                │
│  行 1000 (不在DOM)  │
└─────────────────────┘
```

### 13.2 VirtualListAbility

```typescript
export const VirtualListAbility: AbilityDefinition = {
    rowHeight: {
        get() { return this.abilityState('VirtualListAbility:rowHeight', () => 40); },
        set(v) { this.setAbilityState('VirtualListAbility:rowHeight', v); },
    },
    visibleCount: {
        get() {
            const containerHeight = this.el.clientHeight;
            return Math.ceil(containerHeight / this.rowHeight) + 2; // 缓冲 2 行
        },
    },
    scrollTop: {
        get() { return this.el.scrollTop; },
    },
    startIndex: {
        get() {
            return Math.max(0, Math.floor(this.scrollTop / this.rowHeight) - 1); // 缓冲 1 行
        },
    },
    visibleData: {
        get() {
            const start = this.startIndex;
            const end = start + this.visibleCount;
            return this.dataSource.getRange(start, end);
        },
    },
    totalHeight: {
        get() { return this.dataSource.total * this.rowHeight; },
    },
    onScroll() {
        this.markDirty();
    },
};
```

### 13.3 渲染实现

```typescript
class VirtualListRenderer {
    render(container: HTMLElement, ability: VirtualListAbility) {
        // 1. 占位元素撑开滚动条高度
        const spacer = container.querySelector('.q-virtual-spacer') as HTMLElement;
        spacer.style.height = `${ability.totalHeight}px`;

        // 2. 渲染可视行
        const body = container.querySelector('.q-virtual-body') as HTMLElement;
        body.style.transform = `translateY(${ability.startIndex * ability.rowHeight}px)`;

        const data = ability.visibleData;
        // 只渲染 visibleCount 行，而非全部数据
        this.renderRows(body, data);
    }
}
```

### 13.4 IDataSource 扩展

EntityManager 需要支持 `getRange` 方法，虚拟列表按需取数据：

```typescript
interface IDataSource {
    /** 总记录数 */
    total: number;
    /** 当前数据 */
    data: any[];
    /** 按范围获取数据（虚拟列表核心） */
    getRange(start: number, count: number): any[];
    /** 刷新数据 */
    refresh(): Promise<void>;
    /** 数据变更通知 */
    onDataChange(handler: () => void): () => void;
}
```

EntityManager 侧需要加缓存层，已获取的数据本地缓存，未获取的按需请求：

```typescript
// EntityManager 适配器
class EntityManagerDataSource implements IDataSource {
    private cache = new Map<number, any>();  // index → data

    get total() { return this.mgr.total; }

    getRange(start: number, count: number): any[] {
        const result: any[] = [];
        const missing: number[] = [];

        // 先从缓存取
        for (let i = start; i < start + count; i++) {
            const cached = this.cache.get(i);
            if (cached) result.push(cached);
            else missing.push(i);
        }

        // 缓存未命中的，触发后台请求
        if (missing.length > 0) {
            const page = Math.floor(start / this.mgr.pageSize) + 1;
            this.mgr.list({ page }).then(() => {
                // 数据到达后更新缓存，触发重新渲染
                this.updateCache();
                this.emit('dataChange');
            });
        }

        return result;
    }
}
```

### 13.5 实施策略

- **Phase 1**：固定行高虚拟列表，简单可靠
- **Phase 2**：可变行高虚拟列表，需要测量和缓存行高
- **Phase 3**：动态行高 + 异步数据加载，完整的 ExtJS Grid 体验

## 十四、与 Entity 的集成

### 14.1 DataSourceAbility 桥接

Table / Form 等组件通过 `DataSourceAbility` 与 EntityManager 集成：

```typescript
export const DataSourceAbility: AbilityDefinition = {
    dataSource: {
        get() {
            return this.abilityState('DataSourceAbility:source', () => null);
        },
        set(source) {
            this.setAbilityState('DataSourceAbility:source', source);
            // 监听数据源变更
            if (source?.onDataChange) {
                source.onDataChange(() => this.update());
            }
        },
    },
    async refresh() {
        const source = this.dataSource;
        if (source?.refresh) await source.refresh();
    },
    get data() {
        return this.dataSource?.data ?? [];
    },
    get total() {
        return this.dataSource?.total ?? 0;
    },
    getRange(start: number, count: number) {
        return this.dataSource?.getRange?.(start, count) ?? this.data.slice(start, start + count);
    },
};
```

### 14.2 使用示例

```typescript
// 创建 EntityManager
const userMgr = new RemoteCrudEntityManager({
    domain: 'abp',
    schema: 'user',
});

// 绑定到 Table 组件（虚拟列表模式）
const table = new TableComponent({
    dataSource: new EntityManagerDataSource(userMgr),
    virtual: true,
    rowHeight: 40,
    columns: [
        { field: 'userName', title: '用户名' },
        { field: 'email', title: '邮箱' },
        { field: 'role', title: '角色' },
    ],
});

table.mount('#user-table');

// 无分页浏览体验，内置自动获取数据
```

## 十五、新增包规划

| 包 | 层级 | 依赖 | 说明 |
|---|------|------|------|
| `@qimen-lab/theme` | Layer 1 | error, logger, events | Design Tokens + CSS 变量 + 原子化 CSS + 主题切换 |
| `@qimen-lab/component` | Layer 2 | composable, theme, registry, event-dom | ComponentBase + UI 能力 + 组件注册 + 模板注册表 + OverlayRoot + z-index + 动画 |
| `@qimen-lab/layout` | Layer 3 | schema, registry | JSON Layout Schema 定义 + 解析 + 验证 |
| `@qimen-lab/renderer` | Layer 3 | layout, component, theme, pipeline, registry | 渲染 Pipeline + RenderContext + RenderRegistrar |

依赖关系：

```
theme → error, logger, events
component → composable, theme, registry, event-dom
layout → schema, registry
renderer → layout, component, theme, pipeline, registry
```

## 十六、已确定决策

| 决策 | 结论 | 理由 |
|------|------|------|
| 更新机制 | 事件驱动 + markDirty 批量合并 | 复用现有 EventAbility，不引入 VDOM/响应式 |
| 样式方案 | CSS 类 + CSS 变量 + 内置原子化 CSS | 不引入 UnoCSS 依赖，自研按需生成 |
| 布局方案 | 语义化布局组件（HBox/VBox/Grid/Space） | 不暴露 CSS 属性，JSON 可读性强 |
| 事件绑定 | Handler 模式（接近 ExtJS） | JSON 可序列化，支持字符串映射和结构化 action |
| CSS 作用域 | `q-组件名-` 前缀 + BEM 约定 | 不用 Shadow DOM，避免表单/弹窗/事件坑 |
| 渲染目标 | 先做 DOM 原生，后续框架适配器 | 零依赖，框架无关 |
| 组件与 Entity 耦合 | 松耦合，IDataSource 接口 | 组件可独立使用，Entity 侧提供适配器 |
| 响应式 | Flexbox/Grid 为主，responsive 字段为辅 | 组件默认自适应，特殊场景用 responsive |
| 隐藏根容器 | OverlayRoot 全局浮层容器 | 解决弹窗/下拉定位问题，不受父容器影响 |
| 模板复用 | HTML `<template>` + TemplateRegistry | cloneNode 性能好，模板可替换可继承 |
| 事件注册表 | ComponentEventRegistry 开发辅助 | 编辑器提示、运行时校验、文档生成，非运行时核心 |
| z-index 管理 | 层级常量 + CSS 变量 + 同层递增 | 不用注册表，简单够用 |
| 动画 | CSS transition 为主 + AnimationAbility + keyframes | 简单场景 transition，复杂场景能力类 |
| 虚拟列表 | VirtualListAbility + IDataSource.getRange | 固定行高先行，EntityManager 配合缓存 |
| 渲染流程 | Pipeline 模式 + RenderRegistrar | 复用 @qimen-lab/pipeline，可扩展/可替换/可调试/可熔断 |
| 本地化 | bridges + Renderer 翻译绑定表 | 全局状态变化走 bridges.on，JSON 翻译表达式 Renderer 自动管理 |
| Ability 初始化 | `__init__` 钩子 | 通用机制，Ability 注入后自动调用初始化方法，不耦合具体 Ability |
| 组件间通信 | handler + bridges + 事件总线 | 不提供组件搜索，全部走事件驱动，数据联动统一走 bridges.on |
| name 角色 | action target + Renderer 映射 | 不用于事件名前缀，事件源标识由 source 字段承担 |
| source 角色 | 事件名前缀 + EventContext.source + bridges.on 绑定 | 发布方用 eventKey 声明，接收方用 source 引用；EventSourceRegistrar 校验全局唯一 |
| 事件上下文 | EventContext（@qimenjs/context）+ EventContextBuilder | 三字段分离：event/type/source，统一 UI 事件和数据事件 |
| 事件链 | chain 摘要数组（EventChainLink[]） | 只存原始值，不阻止 GC，框架自动构建，组件无需手动传递 |
| 事件上下文生命周期 | 引用计数（_refCount） | EventBus.emit 时设为 handler 数量，归零自动清理 domEvent/data/metadata |
| 事件发射 | emitUI() 封装函数 | 自动构建 EventContext、深拷贝 data、构建 chain、填充 source |
| 事件流管理 | EventFlowRegistrar（只收集，不调度） | WeakRef 防止 GC 阻止，组件销毁自动解绑，调试可视化 |
| data 设计原则 | 只放结构化原始数据，不放对象引用 | 引用不可靠、阻止 GC、不可序列化、违反解耦 |
| handler 数据访问 | 只读 ctx.data，不修改 | 所有 handler 共享同一个 EventContext，修改会影响其他 handler |
| 错误处理 | console.error + 继续执行 | 单个 handler 失败不影响其他 handler，引用计数必须正确递减 |
| _currentEventContext | 等 Promise 完成后清除 | 异步 handler 中 emitUI 仍能正确构建 chain |
| 事件名格式 | event 编码 source（name:type） | EventBus 按完整事件名路由，保证全局唯一；EventListen.source 指定监听目标 |
| 单次事件 | EventListen.once 字段 | EventBus.once 原生支持，bindEventListen 自动选择 on/once |
| 条件执行 | 不提供 should，handler 内部 if | should 省不了一行代码，但增加框架复杂度 |
| 事件同步/异步 | emit 同步，handler 可异步 | Promise 检测处理引用计数，不提供 emitAsync |
| EventBridge | 全局单例 + 统一 eventScope | 解决发送方/监听方 eventScope 不同导致事件无法路由的问题 |
| 三类事件分离 | events/forwards/bridges | 内部事件、eventScope 转发、EventBridge 桥接三种通信机制分离 |
| 模板格式 | ComponentTemplate（新）+ JsonTemplateNode[]（旧） | 新格式 name/content 分离 + 三类事件 + body 定义，旧格式向后兼容 |
| 事件修饰符 | ?once/?debounce=N/?throttle=N | 声明式事件修饰，debounce/throttle 仅限 events（DOM 事件层） |
| events handler 推导 | 固定推导 click → onClick | 不支持 = 语法，需要自定义 handler 用 body 定义 |

## 十七、事件调度与组件通信

### 17.1 设计原则

**QimenJS 不提供组件搜索机制**（无 closest()、无 provide/inject、无 ComponentRegistry 查找）。组件间通信全部通过事件驱动，开发者不需要"找组件"，只需要"声明事件 + 实现处理"。

核心心智模型：

```
传统模式：我要做什么 → 找到目标组件 → 调用它的方法
QimenJS：  我要做什么 → 声明触发条件 → 实现处理方法
```

### 17.2 三种通信机制

| 机制 | 视角 | 解决什么 | 需要找组件 |
|------|------|---------|-----------|
| handler | 发送方 | 简单 UI 操作 | 否，target 是组件 name |
| bridges | 接收方 | 组件联动 + 数据联动 + 全局状态 | 否，事件名匹配 |
| 事件总线 | — | 跨领域通信 | 否，发布-订阅 |

**底层统一**：都是 `component.on(event, handler)`，基于 GlobalEventBus。

### 17.3 EventContext（事件上下文）

事件上下文放在 `@qimenjs/context` 包中，和 RequestContext 同级，用 Builder 模式构建。所有 UI 事件和数据事件统一使用 EventContext。

```typescript
// @qimenjs/context

interface EventContext extends BaseContext {
    /** 完整事件名（name:type 格式），用于 EventBus 路由和 bridges.on 匹配 */
    event: string;

    /** 事件类型，"发生了什么"（如 "selectionChange"、"dataChange"、"click"） */
    type: string;

    /** 事件来源标识，标识"谁触发的"（如 "userTable"、"abp:user"） */
    source: string;

    /** 来源类型（如 "Grid"、"EntityManager"、"Button"） */
    sourceType: string;

    /** 业务数据（只放结构化原始数据，不放对象引用） */
    data: any;

    /** 原始 DOM 事件（引用计数归零后自动置空释放） */
    domEvent?: Event;

    /**
     * 事件链路（只存摘要，不持有对象引用）
     *
     * 记录从最初触发到当前事件的完整路径。
     * 每个节点只存原始值（event/type/source/sourceType），
     * 不会阻止 GC 回收任何对象。
     */
    chain?: EventChainLink[];

    /**
     * 引用计数（框架内部使用，开发者不需要操作）
     *
     * EventBus.emit 时设为 handler 数量，每个 handler 执行完 -1，
     * 归零时自动清理（置空 domEvent、data 中的大对象）。
     */
    _refCount?: number;
}

interface EventChainLink {
    event: string;
    type: string;
    source: string;
    sourceType: string;
}

class EventContextBuilder {
    static create(): EventContextBuilder;
    withEvent(event: string): EventContextBuilder;
    withType(type: string): EventContextBuilder;
    withSource(source: string): EventContextBuilder;
    withSourceType(sourceType: string): EventContextBuilder;
    withData(data: any): EventContextBuilder;
    withDomEvent(domEvent: Event): EventContextBuilder;
    /** 追加事件链路（从触发事件的 chain 继承并追加） */
    withChain(chain: EventChainLink[]): EventContextBuilder;
    build(): EventContext;
}
```

三字段分离：

| 字段 | 含义 | 例子 |
|------|------|------|
| `event` | 完整事件名（name:type），EventBus 路由用 | `"userTable:selectionChange"` |
| `type` | 事件类型，"发生了什么" | `"selectionChange"` |
| `source` | 来源标识，"谁触发的" | `"userTable"` |

**event 编码 eventKey**：事件名格式为 `eventKey:type`（如 `userTable:selectionChange`），保证全局唯一性。EventBus 按完整事件名索引，同名事件不会混淆。EventListen 的 `source` 字段指定监听哪个事件源（与发布方的 eventKey 对应），`events` 字段是事件类型→handler 映射。

#### 引用计数与自动销毁

EventContext 的生命周期由引用计数管理，**开发者不需要手动释放**：

```
emitUI('selectionChange', data)
  └── ComponentBase.emitUI() 内部：
      ├── 构建 EventContext（自动填充 source/chain 等）
      ├── 深拷贝 data（脱离原始引用）
      ├── this.emit(event, ctx)
      │   └── EventBus.emit() 内部：
      │       ├── ctx._refCount = handlers.size
      │       ├── handler1(ctx) → 返回 Promise? → 等待完成 → _refCount--
      │       ├── handler2(ctx) → 同步完成 → _refCount--
      │       └── _refCount === 0 → cleanup(ctx)
      └── 返回
```

**cleanup 做什么**：
- 置空 `domEvent`（释放 DOM 引用）
- 递归清理 `data`（遍历对象属性，将非原始值置为 `null`，断开所有引用链）
- 递归清理 `metadata`（同上，清空所有对象引用）
- 保留 `chain`（原始值，不需要释放）
- 保留 `event/type/source/sourceType`（原始值，调试时可能需要）

**递归清理的实现**：

```typescript
/**
 * 清理对象中的引用
 * 将对象属性替换为空对象，数组属性替换为空数组，断开引用链
 * 只处理一层，不递归——原对象失去引用后自然会被 GC
 * 基本类型（string/number/boolean）保留，不需要清理
 */
function deepNullify(obj: any): void {
    if (obj === null || obj === undefined || typeof obj !== 'object') return;

    if (Array.isArray(obj)) {
        obj.length = 0;
    } else {
        for (const key of Object.keys(obj)) {
            const val = obj[key];
            if (val !== null && typeof val === 'object') {
                obj[key] = Array.isArray(val) ? [] : {};
            }
        }
    }
}

// cleanup 中
cleanupContext(ctx: EventContext): void {
    if (ctx.domEvent) ctx.domEvent = undefined;
    deepNullify(ctx.data);
    ctx.data = undefined;
    deepNullify(ctx.metadata);
}
```

**为什么只处理一层**：将对象属性替换为空对象 `{}` 后，原对象失去来自 EventContext 的引用。如果原对象没有其他引用，它和它的子属性都会被 GC。不需要递归遍历到最深层——GC 会自动处理整个引用树。

**深拷贝 + 清理的双重保障**：

| 阶段 | 操作 | 目的 |
|------|------|------|
| emitUI | 深拷贝 data | 脱离原始数据引用，cleanup 不影响原始数据 |
| cleanup | 清理 data/metadata | 断开 EventContext 持有的所有对象引用 |

**异步 handler 安全**：框架检测 handler 返回值是否为 Promise，如果是则等待完成后再 -1。异步 handler 中可以直接使用 `ctx.data`，不需要"先取数据"：

```typescript
// ✅ 安全：框架等 await 完成后才清理
async onSubmit(ctx: EventContext) {
    const result = await this.save(ctx.data.entity);
    // ctx.data 仍然可用
}

// ✅ 也安全：同步 handler 更没问题
onSelectionChange(ctx: EventContext) {
    this.updateState({ delete: ctx.data.selectedCount > 0 });
}
```

**如果需要长期持有 data**：引用计数归零后 data 被清理。如果 handler 需要在事件处理完后继续使用 data（比如存到组件属性），用 `clone()` 深拷贝：

```typescript
import { object } from '@qimenjs/utils';

class MyComponent extends ComponentBase {
    private _lastSelection?: SelectionChangeData;

    onSelectionChange(ctx: EventContext) {
        // 深拷贝，脱离与 EventContext 的引用关系
        this._lastSelection = object.clone(ctx.data);
    }
}
```

#### emitUI() — 核心封装函数

组件**必须**通过 `emitUI()` 发射事件，不直接调用 `this.emit()`。`emitUI()` 是框架的管控入口，所有自动化逻辑都在这里处理。

**实现方式**：`emitUI` 作为 `EventAbility` 的一部分注入，不是 ComponentBase 的方法。组件通过 `static readonly abilities = [EventAbility]` 获得事件能力：

```typescript
// 使用方式：通过 Ability 组合注入
class ToolbarComponent extends ComposableBase {
    static readonly abilities = [EventAbility];
    static readonly eventKey = 'toolbar';
}

const toolbar = new ToolbarComponent();
toolbar.emitUI('add', { key: 'add' });
```

EventAbility 中的 emitUI 实现：

```typescript
// @qimenjs/system-abilities/EventAbility.ts
export const EventAbility: AbilityDefinition = {
    // ... eventScope, on, once, emit ...

    emitUI(event: string, data?: any, domEvent?: Event) {
        // 1. 自动构建 chain
        const currentCtx = this._currentEventContext;
        const chain = currentCtx
            ? [
                ...(currentCtx.chain || []),
                { event: currentCtx.event, type: currentCtx.type,
                  source: currentCtx.source, sourceType: currentCtx.sourceType },
              ]
            : undefined;

        // 2. 深拷贝 data，脱离原始引用
        const clonedData = data !== undefined ? object.clone(data) : undefined;

        // 3. 构建完整事件名（eventKey:type，保证全局唯一性）
        const eventKey = this.eventKey;
        const fullEvent = eventKey ? `${eventKey}:${event}` : event;

        // 4. 构建 EventContext
        const ctx = EventContextBuilder.create()
            .withEvent(fullEvent)
            .withType(event)
            .withSource(eventKey ?? '')
            .withSourceType(this.constructor.name)
            .withData(clonedData)
            .withDomEvent(domEvent)
            .withChain(chain)
            .build();

        // 5. 通过全局事件总线发射（传入预构建的 EventContext）
        globalEventBus.emit(fullEvent, ctx);
    },
};
```

**eventKey 初始化**：通过 `eventScope` getter 惰性触发，首次访问时自动从静态属性读取并注册到 EventSourceRegistrar：

```typescript
eventScope: {
    get() {
        return this.abilityState('EventAbility:scope', () => {
            const scope = globalEventBus.createEventScope();
            this.onCleanup(() => scope.dispose());
            // 首次创建 scope 时自动初始化 eventKey
            this._initEventKey();
            this.onCleanup(() => this._unregisterEventKey());
            return scope;
        });
    },
},
```

**为什么必须用 emitUI 而不是直接 emit**：

| 操作 | emitUI 自动处理 | 直接 emit 需要手动 |
|------|----------------|-------------------|
| 构建 EventContext | ✅ 自动 | ❌ 手动 Builder |
| 填充 source/sourceType | ✅ 从 this.name/constructor | ❌ 手动填写 |
| 深拷贝 data | ✅ 自动 clone | ❌ 手动 clone |
| 构建 chain | ✅ 从 _currentEventContext 继承 | ❌ 手动传递 |
| 引用计数 | ✅ EventBus 自动 | ✅ EventBus 自动 |

**_currentEventContext 的管理**：bridges.on handler 执行期间，框架临时保存当前 EventContext。handler 执行完后自动清除。这样 emitUI 就能自动继承 chain，组件不需要手动传递。

**清除时机**：和引用计数一样，_currentEventContext 的清除也等 Promise 完成后才执行。同步 handler 执行完立即清除，异步 handler 等 await 完成后清除：

```typescript
// bindEventListen 中 handler 的包装逻辑（简化）
function wrapHandler(component: ComponentBase, handlerName: string) {
    return (ctx: EventContext) => {
        component._currentEventContext = ctx;
        try {
            const result = (component as any)[handlerName](ctx);
            if (result instanceof Promise) {
                result.finally(() => { component._currentEventContext = undefined; });
            } else {
                component._currentEventContext = undefined;
            }
            return result;
        } catch {
            component._currentEventContext = undefined;
        }
    };
}
```

**为什么不会互相覆盖**：`_currentEventContext` 是组件实例属性。同一个事件可能有多个组件监听，但每个组件的 handler 是独立的，各自设置自己的 `_currentEventContext`，不会互相干扰。

**EventBus.emit 中的引用计数**：

```typescript
// EventBus.emit 内部逻辑（简化）
emit(event: string, ctx: EventContext): void {
    const handlers = this.listeners.get(event);
    if (!handlers || handlers.size === 0) return;

    ctx._refCount = handlers.size;

    const done = () => {
        ctx._refCount!--;
        if (ctx._refCount === 0) this.cleanupContext(ctx);
    };

    handlers.forEach(handler => {
        try {
            const result = handler(ctx);
            if (result instanceof Promise) {
                result.then(done, (err) => {
                    console.error(`[EventBus] async handler error on "${event}":`, err);
                    done();
                });
            } else {
                done();
            }
        } catch (err) {
            console.error(`[EventBus] handler error on "${event}":`, err);
            done();
        }
    });
}
```

**错误处理策略**：

| 层级 | 策略 | 原因 |
|------|------|------|
| HandlerAbility（DOM handler） | console.error + 继续执行下一个 | DOM 事件处理不应因单个 handler 失败而中断 |
| EventBus.emit（bridges.on handler） | console.error + 继续 + 确保 _refCount-- | 一个监听者出错不应影响其他监听者，引用计数必须正确递减 |
| emitUI 内部 | 抛出异常 | clone/Builder 失败说明事件发射本身有问题，调用者应该知道 |
| wrapHandler | console.error + 清除 _currentEventContext | handler 出错不应残留上下文状态 |

预定义事件类型：

```typescript
enum EventType {
    // DOM 类
    Click = 'click',
    Change = 'change',
    Focus = 'focus',
    Blur = 'blur',
    // 选择类
    SelectionChange = 'selectionChange',
    // 值类
    ValueChange = 'valueChange',
    // 数据类
    DataChange = 'dataChange',
    // 分页类
    PageChange = 'pageChange',
    // 排序类
    SortChange = 'sortChange',
    // 操作类
    Action = 'action',
    // 生命周期类
    Mount = 'mount',
    Unmount = 'unmount',
    Dispose = 'dispose',
}
```

约定 data 结构（按事件类型）：

```typescript
interface SelectionChangeData { rows: any[]; selectedCount: number; }
interface ValueChangeData { value: any; oldValue: any; }
interface PageChangeData { page: number; pageSize: number; total: number; }
interface SortChangeData { field: string; order: 'asc' | 'desc' | null; }
interface DataChangeData { action: 'create' | 'update' | 'delete' | 'list'; entity?: any; }
```

**data 设计原则：只放结构化原始数据，不放对象引用**：

- ✅ 放：基本类型（string/number/boolean）、纯数据对象、数组
- ❌ 不放：EventContext 引用、组件实例引用、DOM 节点、函数、闭包

原因：
1. **引用不可靠**：其他 EventContext 可能已被 cleanup 清空，引用它拿到的是空对象
2. **阻止 GC**：对象引用会阻止被引用对象被回收
3. **不可序列化**：对象引用无法被 JSON 序列化，不利于调试和日志
4. **违反解耦**：事件应该只传递"发生了什么"和"相关数据"，不应该传递"谁持有这些数据"

**handler 不应修改 ctx.data**：EventBus 的所有 handler 共享同一个 EventContext。修改 ctx.data 会影响其他 handler。data 是"事件发生了什么"的描述，handler 应该只读。如果需要基于 data 计算新数据，存到组件自己的属性中：

```typescript
// ❌ 错误：修改共享的 ctx.data
onSelectionChange(ctx: EventContext) {
    ctx.data.processed = true;  // 其他 handler 也会看到这个修改
}

// ✅ 正确：只读 data，结果存到组件属性
onSelectionChange(ctx: EventContext) {
    this._hasSelection = ctx.data.selectedCount > 0;
}
```

如果需要之前事件的信息，从 chain 中获取（event/type/source/sourceType），或者把需要的数据提取为原始值放进 data：

```typescript
// ❌ 错误：把整个上下文塞进 data
this.emitUI('save', { triggerCtx: previousCtx });

// ✅ 正确：只提取需要的数据
this.emitUI('save', {
    triggerEvent: previousCtx.event,
    triggerSource: previousCtx.source,
    entityId: previousCtx.data.entity.id,
});
```

### 17.4 组件 emit 事件

组件通过 `emitUI()` 发射事件，框架自动构建 EventContext：

```typescript
// Grid 组件
class GridComponent extends ComponentBase {
    onSelectionChange(rows: any[]) {
        this.emitUI('selectionChange', { rows, selectedCount: rows.length });
        // 框架自动构建 ctx: { event: 'userTable:selectionChange', type: 'selectionChange',
        //   source: 'userTable', sourceType: 'Grid', data: { rows, selectedCount: ... } }
    }
}

// 自定义业务事件
this.emitUI('approvalRequired', { orderId, amount, approver });
```

**非 ComponentBase 的场景**（如 EntityManager、I18nManager）不继承 ComponentBase，没有 `emitUI()`，需要手动构建 EventContext 并通过 `this.emit()` 或 `globalEventBus.emit()` 发射：

```typescript
// EntityManager（非组件，没有 emitUI）
class EntityManager extends ComposableBase {
    async create(data: any) {
        const ctx = EventContextBuilder.create()
            .withEvent('abp:user:dataChange')
            .withType(EventType.DataChange)
            .withSource('abp:user')
            .withSourceType('EntityManager')
            .withData({ action: 'create', entity: data })
            .build();
        this.emit('abp:user:dataChange', ctx);
    }
}
```

**非组件场景为什么不需要 emitUI**：

| emitUI 自动化 | 非组件场景 | 原因 |
|--------------|----------|------|
| 深拷贝 data | 不需要 | 非组件的 data 通常是新创建的对象，不存在"脱离原始引用"的问题 |
| 构建 chain | 不需要 | 非组件不在 UI 事件链中，chain 为空是正确的 |
| 填充 source/sourceType | 手动填写 | 非组件没有 this.name，source 是业务标识（如 `abp:user`） |
| 引用计数 | ✅ 自动 | EventBus.emit 统一处理，不依赖 emitUI |
```

#### 事件链示例

chain 由 emitUI 自动构建，组件只需要调用 `emitUI()`：

```typescript
// 场景：点击"新增"按钮 → 打开编辑弹窗 → 弹窗提交后刷新表格

// 1. 用户点击"新增"按钮（chain 为空，这是起始事件）
class ToolbarComponent extends ComponentBase {
    onAddClick(domEvent: Event) {
        this.emitUI('add', { key: 'add' }, domEvent);
        // 框架自动构建 ctx: { event: 'toolbar:add', type: 'add', source: 'toolbar', ... }
        // ctx.chain === undefined（起始事件，无链路）
    }
}

// 2. 页面响应"新增"事件，打开弹窗
class UserPage extends ComponentBase {
    onAdd(ctx: EventContext) {
        // ctx.chain === undefined（用户直接触发）
        this.openEditDialog();
    }
}

// 3. 弹窗提交后，emitUI 自动继承 chain
class EditDialogComponent extends ComponentBase {
    async onSubmit() {
        const result = await this.save();
        this.emitUI('dataChange', { action: 'create', entity: result });
        // 框架自动构建 ctx.chain: [
        //   { event: 'toolbar:add', type: 'add', source: 'toolbar', sourceType: 'Toolbar' }
        // ]
        // data 已被深拷贝，与 result 脱离引用关系
    }
}

// 4. 表格响应 dataChange，可以查看事件链路
class UserTableComponent extends ComponentBase {
    onDataChange(ctx: EventContext) {
        // ctx.chain: [
        //   { event: 'toolbar:add', type: 'add', source: 'toolbar', sourceType: 'Toolbar' }
        // ]
        // ctx.event: 'editDialog:dataChange'
        // ctx.source: 'editDialog'
        // ctx.data: { action: 'create', entity: {...} }  ← 深拷贝，安全使用

        this.refresh();
    }
}
```

**开发者只需要做一件事**：`this.emitUI('事件名', 数据)`。其他全部由框架自动处理。

### 17.5 handler（发送方视角，简单场景）

handler 在发送方节点上声明，适合简单的 UI 操作。**简化后只保留两种形式**：结构化 action 和函数名映射。

```json
{
    "type": "Button",
    "text": "取消",
    "handlers": {
        "click": { "action": "close", "target": "editDialog" }
    }
}
```

```json
{
    "type": "Button",
    "text": "提交",
    "handlers": {
        "click": "onSubmit"
    }
}
```

handler 类型（简化版）：

```typescript
type HandlerValue = string | HandlerAction;

interface HandlerAction {
    action: 'close' | 'open' | 'submit' | 'reset' | 'toggle'
          | 'show' | 'hide' | 'navigate' | 'emit' | 'custom';
    target?: string;            // 组件 name，Renderer 内部定位
    params?: Record<string, any>;
}
```

handler 多绑定规则：
- 支持数组：`"click": ["onValidate", "onSubmit"]`
- 默认串行执行，返回 `false` 中断后续
- 每个 handler 独立 try-catch，不互相影响

**串行执行的实现**：handler 数组由 HandlerAbility 在 `bindHandlers` 中包装成一个函数注册到 DOM 事件。内部串行调用每个 handler，检测返回值是否为 `false`：

```typescript
// HandlerAbility.bindHandlers 内部逻辑（简化）
bindHandlers(handlers: Record<string, HandlerValue | HandlerValue[]>, context: RenderContext) {
    for (const [event, value] of Object.entries(handlers)) {
        const items = Array.isArray(value) ? value : [value];
        this.onDom(event, (domEvent: Event) => {
            for (const item of items) {
                try {
                    let result: any;
                    if (typeof item === 'string') {
                        const fn = context.handlers[item];
                        if (fn) result = fn(this, domEvent);
                    } else {
                        result = this.executeAction(item);
                    }
                    if (result === false) break;  // 返回 false 中断后续
                } catch (e) {
                    console.error(`[HandlerAbility] handler "${String(item)}" error:`, e);
                }
            }
        });
    }
}
```

**注意**：这里的 handler 是 DOM 事件处理器（通过 `onDom` 绑定），不是 EventBus 事件处理器。EventBus 的 handler 是通过 `bridges.on` 绑定的，由 EventBus.forEach 并行执行。

### 17.6 bridges（接收方视角，组件联动）

bridges 在接收方节点上声明，适合组件间事件联动、数据联动、全局状态响应。bridges 是混合数组 `(string | EventListen)[]`，string 项为发布（emit），EventListen 项为监听（on）。**接收方不需要知道发送方是谁，只需要知道事件名**：

```json
{
    "type": "VBox",
    "children": [
        {
            "type": "Toolbar",
            "name": "toolbar",
            "props": {
                "bridges": [
                    {
                        "source": "userTable",
                        "events": { "selectionChange": "onSelectionChange" }
                    }
                ]
            }
        },
        {
            "type": "Grid",
            "name": "userTable",
            "props": { ... }
        }
    ]
}
```

多个 source 的场景：

```json
{
    "bridges": [
        {
            "source": "userTable",
            "events": {
                "selectionChange": "onSelectionChange",
                "dataChange": "onDataChange"
            }
        },
        {
            "source": "roleTable",
            "events": { "selectionChange": "onRoleSelectionChange" }
        }
    ]
}
```

监听全局事件（不指定 source）：

```json
{
    "bridges": [
        {
            "events": {
                "localeChange": "onLocaleChange",
                "dataChange": "onDataChange"
            }
        }
    ]
}
```

bridges 类型：

```typescript
interface EventListen {
    /** 监听哪个事件源（组件 source），不填则监听全局事件总线 */
    source?: string;
    /** 事件 → handler 映射（event 是事件类型，如 "selectionChange"） */
    events: Record<string, string>;
    /** 只执行一次，执行后自动解绑 */
    once?: boolean;
}
```

Renderer 绑定逻辑：

```typescript
function bindEventListen(listens: EventListen[], component: ComponentBase, context: RenderContext): void {
    for (const trigger of triggers) {
        const on = trigger.once ? 'once' : 'on';

        if (trigger.source && context.sources[trigger.source]) {
            // source 存在 → 监听该组件的事件
            const sourceComponent = context.sources[trigger.source];
            for (const [event, handlerName] of Object.entries(trigger.events)) {
                const off = sourceComponent[on](event, (ctx: EventContext) => {
                    if (typeof (component as any)[handlerName] === 'function') {
                        (component as any)[handlerName](ctx);
                    }
                });
                EventFlowRegistrar.register({ component, event, handler: handlerName, off });
            }
        } else {
            // source 不存在 → 监听全局事件总线
            for (const [event, handlerName] of Object.entries(trigger.events)) {
                const fullEvent = trigger.source ? `${trigger.source}:${event}` : event;
                const off = globalEventBus[on](fullEvent, (ctx: EventContext) => {
                    if (typeof (component as any)[handlerName] === 'function') {
                        (component as any)[handlerName](ctx);
                    }
                });
                EventFlowRegistrar.register({ component, event: fullEvent, handler: handlerName, off });
            }
        }
    }
}
```

接收方从 EventContext 取数据：

```typescript
class ToolbarComponent extends ComponentBase {
    onSelectionChange(ctx: EventContext) {
        // 从 ctx.type 判断事件类型
        // 从 ctx.source 判断来源
        // 从 ctx.data 取业务数据
        const { selectedCount } = ctx.data;
        this.updateState({
            delete: selectedCount > 0,
            edit: selectedCount === 1,
        });
    }
}
```

**条件执行**：bridges 不提供 `should` 条件字段。如果 handler 需要条件判断，在 handler 内部写 if：

```typescript
onSelectionChange(ctx: EventContext) {
    if (!this.hasPermission()) return;  // 条件判断
    // ...
}
```

理由：should 的值是方法名字符串，最终还是要在组件上实现。省不了一行 if，但增加了框架复杂度和 JSON 配置的心智负担。

**事件同步/异步**：EventBus.emit 保持同步。handler 可以是异步的（返回 Promise），框架通过 Promise 检测处理引用计数。不提供 `emitAsync`——如果调用者需要等待异步 handler 完成，应该在 handler 内部处理。

### 17.7 handler 与 bridges 的选择

| 场景 | 选择 | 理由 |
|------|------|------|
| 取消按钮关闭弹窗 | handler | 一行声明，简单直接 |
| 提交按钮触发业务逻辑 | handler | 发送方明确知道要做什么 |
| Grid 选中 → Toolbar 更新按钮状态 | bridges | 接收方响应，解耦 |
| Grid 选中 → 另一个 Grid 过滤 | bridges | 接收方响应，解耦 |
| 数据变更 → 组件刷新 | bridges | 数据联动，接收方声明 |
| 语言/主题切换 → 组件更新 | bridges | 全局事件，接收方声明 |
| 跨模块通信 | 事件总线 | 完全解耦 |

**原则**：简单操作用 handler，组件/数据联动用 bridges，跨领域用事件总线。

### 17.8 通用工具条场景

```json
{
    "type": "VBox",
    "children": [
        {
            "type": "Toolbar",
            "name": "toolbar",
            "props": {
                "buttons": ["add", "delete", "edit", "import", "export"],
                "extraButtons": [
                    { "key": "assignRole", "text": { "$t": "user.assignRole" } }
                ]
            },
            "handlers": {
                "add": "onAdd",
                "delete": "onDelete",
                "edit": "onEdit"
            },
            "bridges": [
                { "source": "userTable", "events": { "selectionChange": "onSelectionChange" } }
            ]
        },
        {
            "type": "Table",
            "name": "userTable",
            "props": { ... }
        }
    ]
}
```

```typescript
class ToolbarComponent extends ComponentBase {
    render() {
        for (const { key, text } of this.allButtons) {
            const btn = new ButtonComponent({ text });
            btn.on('click', (domEvent) => {
                this.emitUI(key, { key }, domEvent);
                // 框架自动构建 ctx: { event: 'toolbar:add', type: 'add',
                //   source: 'toolbar', sourceType: 'Toolbar', data: { key } }
            });
            this.addChild(btn);
        }
    }

    onSelectionChange(ctx: EventContext) {
        const { selectedCount } = ctx.data;
        this.updateState({
            delete: selectedCount > 0,
            edit: selectedCount === 1,
        });
    }
}
```

### 17.9 数据联动

数据变更通过 bridges 统一处理，不需要 DataSourceAbility：

```json
{
    "type": "Table",
    "name": "userTable",
    "props": {
        "bridges": [
            { "source": "abp:user", "events": { "dataChange": "onDataChange" } }
        ]
    }
}
```

```typescript
class UserTableComponent extends ComponentBase {
    onDataChange(ctx: EventContext) {
        // ctx.type === 'dataChange'
        // ctx.source === 'abp:user'
        // ctx.data.action === 'create' | 'update' | 'delete' | 'list'
        this.refresh();
    }
}
```

### 17.10 本地化（bridges 统一处理）

语言切换、主题切换等全局状态变化，通过 bridges 统一处理：

```json
{
    "type": "Button",
    "props": {
        "bridges": [
            { "events": { "localeChange": "onLocaleChange" } }
        ]
    }
}
```

```typescript
class ButtonComponent extends ComponentBase {
    onLocaleChange(ctx: EventContext) {
        this.textEl.textContent = i18n.t(this.props.textKey);
    }
}
```

应用层初始化时连接全局状态源：

```typescript
// app.ts
import { EventContextBuilder, EventType } from '@qimenjs/context';
import { globalEventBus } from '@qimenjs/events';

const i18n = (window as any).qimenI18n?.i18n;
if (i18n) {
    i18n.onLocaleChange((e) => {
        const ctx = EventContextBuilder.create()
            .withEvent('localeChange')
            .withType('localeChange')
            .withSource('i18n')
            .withSourceType('I18nManager')
            .withData(e)
            .build();
        globalEventBus.emit('localeChange', ctx);
    });
}
```

### 17.11 JSON 翻译表达式

JSON Layout 中的静态文本用翻译表达式声明，Renderer 维护翻译绑定表，语言切换时自动更新：

```json
{
    "type": "Button",
    "props": {
        "text": { "$t": "common.save" }
    }
}
```

```typescript
interface TranslationExpr {
    $t: string;
    params?: Record<string, any>;
    format?: 'date' | 'time' | 'number' | 'currency';
    formatStyle?: string;
}

interface TranslationBinding {
    component: ComponentBase;
    prop: string;
    key: string;
    params?: Record<string, any>;
}
```

### 17.12 Ability `__init__` 钩子

Ability 支持声明初始化方法，ComposableBase 在注入 Ability 后自动调用：

```typescript
interface AbilityDefinition extends Record<string | symbol, any> {
    __init__?: string;
}

// ComposableBase.setupAbilityDefinition 中
private setupAbilityDefinition(definition: AbilityDefinition): void {
    const keys = [...Object.keys(definition), ...Object.getOwnPropertySymbols(definition)];
    for (const key of keys) {
        if (key === '__init__') continue;
        const value = definition[key];
        const descriptor = this.createPropertyDescriptor(value);
        Object.defineProperty(this, key, descriptor);
    }
    if (definition.__init__) {
        const initFn = (this as any)[definition.__init__];
        if (typeof initFn === 'function') {
            initFn.call(this);
        }
    }
}
```

### 17.13 name 与 eventKey 的角色

**name**：组件实例标识，从 Layout JSON 中设置。

1. **结构化 action 的 target** — `{ "action": "close", "target": "editDialog" }` 中的 `editDialog` 是组件 name
2. **Renderer 内部组件映射** — context.names[name] 用于结构化 action 定位

**eventKey**：事件标识 key，组件定义时声明，用于事件名前缀。

1. **事件名前缀** — emitUI 自动构建 `eventKey:event` 格式的事件名
2. **EventContext.source 的值** — 组件 emit 事件时，source 取自 eventKey
3. **bridges.on 绑定** — 接收方用 `source` 字段指定监听哪个事件源（与 eventKey 对应）

**name 和 eventKey 的区别**：

| | name | eventKey |
|---|---|---|
| 设置时机 | Layout JSON 中设置 | 组件定义时声明 |
| 用途 | action target、Renderer 映射 | 事件名前缀、事件源标识 |
| 唯一性 | 同一页面内唯一 | 全局唯一（EventSourceRegistrar 校验） |
| 是否必须 | 可选 | 可选（无 eventKey 的组件事件名无前缀） |

开发者不需要通过 name 或 eventKey 获取组件实例并调用方法。所有组件间交互走事件。

**eventKey 注册机制**：EventSourceRegistrar 记录所有已声明的 eventKey，重复注册时抛出错误：

```typescript
class EventSourceRegistrar {
    private sources = new Map<string, WeakRef<ComponentBase>>();

    /** 注册 eventKey，重复则报错 */
    register(eventKey: string, component: ComponentBase): void {
        const existing = this.sources.get(eventKey)?.deref();
        if (existing && existing !== component) {
            throw new Error(`[EventSourceRegistrar] eventKey "${eventKey}" already registered by ${existing.constructor.name}`);
        }
        this.sources.set(eventKey, new WeakRef(component));
    }

    /** 注销 eventKey */
    unregister(eventKey: string): void {
        this.sources.delete(eventKey);
    }

    /** 查询 eventKey 对应的组件 */
    getComponent(eventKey: string): ComponentBase | undefined {
        return this.sources.get(eventKey)?.deref();
    }
}
```

**name 的约束**：

- **不允许为空字符串** — name 要么是有效的标识符，要么是 undefined（不设置）
- **Renderer 校验** — 渲染时如果 name 为空字符串，抛出警告

**eventKey 的约束**：

- **全局唯一** — 重复注册抛出错误
- **不允许包含冒号**（`:`）— 冒号是事件名分隔符
- **组件销毁时自动注销** — dispose 中调用 EventSourceRegistrar.unregister

**事件命名规范**：

| 场景 | EventContext.event | EventContext.type | EventListen.source | EventListen.events |
|------|-------------------|------------------|---------------------|-------------------|
| 有 eventKey 的组件 | `userTable:selectionChange` | `selectionChange` | `userTable` | `{ "selectionChange": "onSelectionChange" }` |
| 无 eventKey 的组件 | `selectionChange` | `selectionChange` | （不填） | `{ "selectionChange": "onSelectionChange" }` |
| 非组件（EntityManager） | `abp:user:dataChange` | `dataChange` | `abp:user` | `{ "dataChange": "onDataChange" }` |

- **EventContext.event**：完整事件名（eventKey:type），EventBus 按此路由，保证全局唯一
- **EventContext.type**：事件类型，"发生了什么"
- **EventListen.source**：监听哪个事件源（与发布方的 eventKey 对应），bindEventListen 用 `sourceComponent.on(event)` 监听
- **EventListen.events**：事件类型 → handler 方法名映射

### 17.14 不提供的机制

| 机制 | 为什么不提供 |
|------|------------|
| closest() | 组件间联动走 bridges，不需要按类型搜索祖先 |
| provide/inject | 组件间联动走 bridges，不需要跨层传递引用 |
| ComponentRegistry 查找 | 不需要全局查找组件实例 |
| DataSourceAbility | 数据联动走 bridges + EventContext，不需要单独 Ability |
| LocaleAbility | 本地化走 bridges，不需要单独 Ability |
| 事件冒泡 | 发布-订阅已足够，显式 emit 比隐式冒泡更可控 |
| ComponentRegistrar 类注册 | 用简单的映射对象替代，不需要 RegistrarBase 重量级机制 |

### 17.15 EventFlowRegistrar（事件流注册表）

EventFlowRegistrar 收集 bridges 的定义和运行时订阅关系，**只做收集和生命周期管理，不做调度执行**。

**为什么不做调度**：如果注册表接管调度，handler 执行时 `this` 会丢失（脱离组件上下文）。要保持 this 正确，注册表必须持有组件引用——这就回到了"组件搜索"的老路。调度还是走现有的 emit + bridges，this 自然指向组件。

#### 两层结构：定义 + 订阅

注册表分两层：

1. **定义层（类级别，只注册一次）**：组件类声明了哪些 bridges
2. **订阅层（实例级别，每个实例绑定）**：运行时的 on/off 订阅关系

```typescript
/** 定义层：组件类声明了哪些 bridges（类级别，只注册一次） */
interface EventFlowDefinition {
    /** 组件类型名 */
    componentType: string;
    /** 声明的 bridges */
    listens: EventListen[];
}

/** 订阅层：运行时的订阅关系（实例级别，每个实例绑定） */
interface EventFlowEntry {
    /** 监听者组件（弱引用，组件销毁后自动失效） */
    component: WeakRef<ComponentBase>;
    /** 监听的事件名 */
    event: string;
    /** 触发时调用的方法名 */
    handler: string;
    /** 取消订阅函数 */
    off: () => void;
}
```

#### 注册时机

**定义注册**：组件类第一次被 Renderer 渲染时，注册 bridges 定义到 EventFlowRegistrar。同一组件类型只注册一次：

```typescript
// Renderer 渲染逻辑（简化）
function renderNode(node: LayoutNode, context: RenderContext): ComponentBase {
    const component = createComponent(node);

    // 定义注册：同一组件类型只注册一次
    if (node.props.bridges?.length) {
        EventFlowRegistrar.registerDefinition({
            componentType: node.type,
            triggers: node.props.bridges,
        });
    }

    // 订阅绑定：每个实例都要绑定
    if (node.props.bridges?.length) {
        for (const trigger of node.props.bridges) {
            bindEventListen(trigger, component, context);
        }
    }

    return component;
}
```

**registerDefinition 内部去重**：

```typescript
registerDefinition(def: EventFlowDefinition): void {
    // 同一组件类型只注册一次
    if (this.definitions.has(def.componentType)) return;
    this.definitions.set(def.componentType, def);
}
```

#### 注册表接口

```typescript
class EventFlowRegistrar extends RegistrarBase<{
    definitions: Map<string, EventFlowDefinition>;  // 类级别定义
    subscriptions: Map<string, EventFlowEntry[]>;    // 实例级别订阅
}> {
    // --- 定义层 ---

    /** 注册组件类的 bridges 定义（同一类型只注册一次） */
    registerDefinition(def: EventFlowDefinition): void;

    /** 查询组件类的 bridges 定义 */
    getDefinition(componentType: string): EventFlowDefinition | undefined;

    /** 查询某个事件有哪些组件类型在监听 */
    getDefinitionListeners(event: string): EventFlowDefinition[];

    // --- 订阅层 ---

    /** 注册一个运行时订阅 */
    registerSubscription(entry: Omit<EventFlowEntry, never>): void;

    /** 按组件解绑所有订阅（组件销毁时调用） */
    unregisterByComponent(component: ComponentBase): void;

    /** 按事件名查询所有运行时监听者 */
    getSubscriptions(event: string): EventFlowEntry[];

    /** 获取某个事件的运行时监听者数量（用于引用计数） */
    getSubscriptionCount(event: string): number;

    // --- 调试 ---

    /** 调试：输出完整的事件监听关系图 */
    inspect(): void;

    /** 调试：输出指定组件的监听关系 */
    inspectComponent(component: ComponentBase): void;
}
```

#### 生命周期管理

组件销毁时，EventFlowRegistrar 自动解绑该组件的所有订阅（定义层不需要解绑，它是类级别的）：

```typescript
// ComponentBase.dispose() 中
dispose(): void {
    // 解绑该组件的所有运行时订阅
    EventFlowRegistrar.unregisterByComponent(this);
    // ... 其他清理
}
```

`unregisterByComponent` 实现：

```typescript
unregisterByComponent(component: ComponentBase): void {
    for (const [event, entries] of this.storage.subscriptions) {
        const remaining = entries.filter(entry => {
            const comp = entry.component.deref();
            if (comp === component) {
                entry.off();  // 调用取消订阅函数
                return false;
            }
            if (!comp) {
                // 组件已被 GC，清理失效条目
                entry.off();
                return false;
            }
            return true;
        });
        if (remaining.length === 0) {
            this.storage.subscriptions.delete(event);
        } else {
            this.storage.subscriptions.set(event, remaining);
        }
    }
}
```

#### 使用 WeakRef 的原因

`EventFlowEntry.component` 使用 `WeakRef<ComponentBase>` 而不是直接引用：

- 如果用直接引用，注册表会阻止组件被 GC 回收（注册表是全局单例，生命周期和应用一样长）
- 用 `WeakRef`，组件被销毁后 `deref()` 返回 `undefined`，注册表可以清理失效条目
- 组件 dispose 时主动调用 `unregisterByComponent` 做精确解绑，WeakRef 作为兜底防护

#### 调试输出示例

```
EventFlowRegistrar [🔓]

📋 Definitions (类级别):
├── Toolbar → [userTable → { selectionChange: onSelectionChange }]
├── Table  → [{ dataChange: onDataChange }, { localeChange: onLocaleChange }]
└── Button → [{ localeChange: onLocaleChange }]

🔗 Subscriptions (实例级别):
├── userTable:selectionChange
│   └── Toolbar#toolbar → onSelectionChange
├── abp:user:dataChange
│   └── Table#userTable → onDataChange
├── localeChange
│   ├── Button#saveBtn → onLocaleChange
│   └── Table#userTable → onLocaleChange
└── toolbar:add
    └── UserPage → onAdd
```

#### 与引用计数的关系

EventFlowRegistrar 的 `getSubscriptionCount(event)` 可以返回某个事件的运行时监听者数量。这个数量和 EventBus 的 `handlers.size` 应该一致（因为订阅都是通过 EventFlowRegistrar 注册的）。在调试时可以交叉验证。

#### 与 chain 事件链的关系

- **EventFlowRegistrar**：静态视角，"谁在监听什么事件"（声明时可知）
- **chain 事件链**：动态视角，"这个事件是怎么触发的"（运行时可知）
- 两者互补：调试时先看注册表了解全局监听关系，再看 chain 了解具体触发路径
- **都不持有对象引用**：EventFlowEntry 用 WeakRef，chain 只存原始值，无需手动释放

## 十八、JSON 模板与子组件插槽

### 18.1 JSON 模板（JsonTemplateNode）

withTemplate 支持 JSON 模板数组（`JsonTemplateNode[]`），自动转换为 HTML 字符串后走原有 precompileTemplate 流程。JSON 模板字段与 data-* 属性一一对应：

| JSON 字段 | data-* 属性 | 说明 |
|-----------|------------|------|
| content | data-content | 内容插槽声明 |
| event | data-event | 内部事件声明 |
| emit | data-emit | 外部事件声明 |
| target | data-target | 事件委托目标 |
| json | data-json | 组件类引用（字符串或类引用） |
| jsonMode | data-json-mode | 渲染模式（replace/child） |
| template | data-template | 嵌套模板引用 |
| i18n | data-i18n | 国际化翻译 key |

`jsonTemplateToHtml()` 返回 `{ html, componentMap }`，其中 componentMap 从 json 字段为组件类引用的节点提取 name → ComponentClass 映射。

### 18.2 新版模板格式（ComponentTemplate）

新版模板使用 `ComponentTemplate` 格式，相比旧版 `JsonTemplateNode[]` 有以下改进：

- **name/content 分离** — `name` 做 nodeMap 索引键，`content` 做语义描述
- **三类事件分离** — `events`/`forwards`/`bridges` 替代旧版 `event`/`emit`
- **tag/type 互斥** — DOM 元素用 `tag`，组件占位用 `type`
- **body 定义** — 模板可携带属性和方法，自动复制到组件实例

```typescript
interface TplNode {
    tag?: string;           // DOM 标签（与 type 互斥）
    type?: string;          // 组件类型（与 tag 互斥）
    name?: string;          // nodeMap 索引键（group:name 格式）
    content?: string;       // 语义描述（title/text/icon/value）
    events?: EventDecl[];   // 内部事件 — 触发组件自身 handler
    forwards?: EventDecl[]; // 转发事件 — 通过 eventScope 转发给持有方
    bridges?: EventDecl[];  // 桥接事件 — 通过 EventBridge 跨组件通信
    className?: string;     // CSS 类名
    style?: string | Record<string, any>;
    children?: TplNode[];
    // ... 其他字段
}

interface ComponentTemplate {
    tpl: TplNode;           // 根节点（不生成 HTML，根元素由组件 tag 创建）
    body?: Record<string, any>;  // 属性和方法，复制到组件实例
}
```

**新旧格式对比**：

| 旧版 JsonTemplateNode[] | 新版 ComponentTemplate |
|------------------------|----------------------|
| `content: 'button:icon'` | `name: 'button:icon', content: 'icon'` |
| `event: 'input'` | `events: ['input']` |
| `emit: 'click'` | `forwards: ['click']` 或 `bridges: ['click']` |
| `class: 'q-field'` | `className: 'q-field'` |
| 无 body | `body: { onClick(e) { ... } }` |

**事件声明语法**：

| 字段 | 语法 | 示例 | 语义 |
|------|------|------|------|
| events | `eventName[?modifier]` | `'click'`, `'input?debounce=300'` | 内部事件，handler 名自动推导（click → onClick） |
| forwards | `eventName[=targetName][?modifier]` | `'click'`, `'click=save'` | eventScope 转发，同名或重命名 |
| bridges | `eventName[=targetName][?modifier]` | `'click'`, `'click=click:save'` | EventBridge 桥接，同名或重命名 |

**事件修饰符**：

| 修饰符 | 含义 | 适用字段 |
|--------|------|---------|
| `?once` | 只触发一次 | events/forwards/bridges |
| `?debounce=N` | N 毫秒防抖 | events |
| `?throttle=N` | N 毫秒节流 | events |

**withTemplate 三格式支持**：

```typescript
// 格式 1：HTML 字符串
TemplateComponent.withTemplate('<div data-content="x:label"></div>')

// 格式 2：旧版 JsonTemplateNode[]（向后兼容）
TemplateComponent.withTemplate([{ tag: 'span', content: 'x:label' }])

// 格式 3：新版 ComponentTemplate
TemplateComponent.withTemplate({
    tpl: { tag: 'div', children: [
        { tag: 'span', name: 'x:label', content: 'text' },
    ]},
    body: {
        onClick(e) { /* ... */ },
    },
})
```

### 18.3 EventBridge 事件桥

EventBridge 是全局单例，解决组件间 eventScope 不同导致事件无法路由的问题。发送方和监听方的 eventScope 不同，但都通过 EventBridge 的统一 eventScope 中转。

**架构**：

```
发送方组件                    EventBridge（单例）                监听方组件
eventScope A  ─bridgeEmit→  bridgeScope  ─bridgeOn→  eventScope B
                              bridge:${sourceId}:${eventName}
```

**系统能力**：`EventBridgeAbility`（`src/system-abilities/system/`）提供组件实例方法：

```typescript
// 组件实例可直接调用
this.bridgeEmit(eventKey, eventName, data);
this.bridgeOn(sourceId, eventName, handler);
this.bridgeOnce(sourceId, eventName, handler);
```

**配置能力**：`EventBridgeConfigAbility`（`src/component-core/abilities/`）提供声明式桥接配置：

```typescript
// LayoutNode 中声明式配置
{
    type: 'Toolbar',
    props: {
        eventBridge: {
            pagination: { source: 'pager1' },
            crud: { source: 'crud1' },
        }
    }
}
```

**模板中声明桥接事件**：

```typescript
// 新版 ComponentTemplate
{
    tpl: {
        tag: 'div',
        children: [
            { tag: 'button', name: 'btn:save', bridges: ['click=click:save'] },
        ]
    }
}
// → 点击按钮时 EventBridge.bridgeEmit(eventKey, 'click:save', data)
```

### 18.4 三类事件的设计原则

| 类型 | 视角 | 通信范围 | 声明字段 | data-* 属性 |
|------|------|---------|---------|------------|
| events（内部事件） | 组件自身 | 组件内部 handler | `events: ['click']` | `data-event` |
| forwards（转发事件） | 持有方 | 父组件 eventScope | `forwards: ['click=save']` | `data-emit` |
| bridges（桥接事件） | 接收方 | EventBridge 全局 | `bridges: ['click=click:save']` | `data-bridge` |

**选择原则**：
- **events**：组件自身处理的事件（如 Input 的 input 事件 → 更新内部状态）
- **forwards**：需要父组件响应的事件（如 Button 的 click → 父组件执行保存）
- **bridges**：跨组件通信（如 Grid 选中 → 另一个组件过滤数据）

**handler 推导规则**：
- `events` 不支持 `=` 语法，handler 名固定推导：`click` → `onClick`
- 支持 before/after 钩子：`beforeClick()` → `onClick()` → `afterClick()`
- `forwards` 和 `bridges` 支持 `=` 重命名：`click=save` → 转发/桥接为 save 事件

### 18.2 子组件渲染（TemplateAbility._renderChildComponents）

模板中通过 data-json 声明占位节点，_renderChildComponents 遍历 nodeMap 中有 componentClass 的节点：

1. 从 static children 查找差异化 props
2. 创建子组件实例，设置 parent 引用
3. 根据 jsonMode（replace/child）挂载到 DOM
4. replace 模式记录 parentNode/nodeIndex 用于后续替换
5. 更新 nodeMap 中的 el、component、componentClass 字段

子组件销毁不使用 onCleanup（避免替换时回调累积），由 TemplateComponent.dispose 统一调用 _disposeChildComponents。

### 18.3 子组件插槽替换（ChildSlotAbility）

ChildSlotAbility 提供动态替换子组件的能力，按需组合（只有需要动态替换的场景才引入）：

- `_replaceChildComponent(name, newComponentClass, props)` — 替换指定位置的子组件
- 利用 NodeMetadata 中的 parentNode/nodeIndex 定位 DOM 位置
- 销毁旧组件后在原位挂载新组件
- 更新 nodeMap 中的引用

### 18.4 浮层宿主能力（OverlayHostAbility + TooltipOverlayAbility）

### 18.5 body.forwards 属性/方法透传

`forwards` 定义在 `ComponentTemplate.body` 上，是属性和方法透传的统一入口，替代 TplNode 上的 `forward` 属性。

**核心设计**：

- `forwards` 是一个映射：`{ 本地属性名: 'nodeMap路径' }`
- 路径沿 nodeMap 逐级解析，支持深层透传
- body 是组合定义层，引用自己的组件树结构不算破坏封装

**两种透传模式**：

| 模式 | 写法 | 含义 |
|------|------|------|
| 属性级透传 | `title: 'header.title'` | `dialog.title` 代理到 `headerComponent.title` |
| 组件级透传 | `icon: 'icon'` | `dialog.icon` 返回 iconComponent + 自动属性 + 方法代理 |
| 深层透传 | `icon: 'header.icon'` | 沿 nodeMap 逐级解析到 header 下的 icon 组件 |

**属性级透传**：在父组件上生成 getter/setter，代理到目标组件的指定属性。

**组件级透传**：
1. 生成 accessor：`dialog.icon` → iconComponent
2. 生成自动属性透传：`dialog.iconClassName` → `iconComponent.el.className` 等
3. 代理目标组件的公共方法：`dialog.open()` → `iconComponent.open()`

**深层透传**：中间组件无需声明任何 forwards，透传由组合层（body）统一管控。路径解析通过 nodeMap 逐级递归：`this.nodeMap.header.component.nodeMap.icon.component`。

**示例**：

```typescript
const DIALOG_TEMPLATE: ComponentTemplate = {
    tpl: {
        tag: 'div',
        className: 'q-dialog',
        children: [
            { name: 'header', type: HeaderComponent, className: 'q-dialog__header' },
            { name: 'icon', type: IconComponent, className: 'q-dialog__icon' },
        ]
    },
    body: {
        type: 'dialog',
        forwards: {
            title: 'header.title',   // dialog.title → headerComponent.title
            icon: 'icon',            // dialog.icon → iconComponent（自动属性+方法代理）
        },
    },
};
```

**实现位置**：`TemplateAbility._setupForwards()`，在 `_renderChildComponents()` 之后调用。

**与 TplNode.forward 的关系**：`forwards` on body 是 `forward` on TplNode 的统一替代，支持深层路径，由组合层声明而非节点层声明。

### 18.6 ItemGroup 派生组件体系

ItemGroupComponent 是子项管理的基座，多个领域组件从它派生，固化不同的 itemType 和选择行为：

| 派生组件 | itemType | 选择行为 | 场景 |
|----------|----------|---------|------|
| ButtonGroup | Toggle | 单选/多选（pressed 背景） | 工具栏按钮组 |
| TabBar | Toggle | 单选（底部粗线） | 标签栏、筛选 |
| Indicator | ToggleIcon/Toggle | 单选（●/○、数字、横线） | 走马灯、步骤条 |
| NavItemGroup | NavItem | 单选（active 高亮） | 导航栏 |

所有派生组件复用 ItemGroup 的池化、事件转发、溢出处理，零手动 DOM。

### 18.7 组件分类

**基础组件**：Icon、Avatar、Button、Toggle、ToggleIcon、Badge、Tips

**容器组件**：Card（Header+body+footer）、Panel（折叠）、Tabs（TabBar+内容区）

**项组派生**：ItemGroup、ButtonGroup、TabBar、Indicator、NavItemGroup

**语义别名**：Dropdown = Button、Toolbar = ItemGroup

**导航路由**：NavItem、NavItemGroup、RouteNav、RouteContainer

**菜单浮层**：MenuItem、Menu

浮层组件通过组合 OverlayHostAbility + 自身特有逻辑实现：

- OverlayHostAbility：浮层挂载、z-index 管理、定位计算、resize/scroll 重定位
- TooltipOverlayAbility：hover 事件、show/hide delay、i18n 内容、open/close 生命周期

宿主组件通过 OverlayAbility.createOverlay() 创建浮层实例，自动生成委托方法（openXxx/closeXxx/positionXxx）。

## 十九、Router 纯事件模式

### 19.1 设计思路

Router 重构为纯事件模式：路由变化时只发切换事件，不再解析配置去找组件/模板。事件名由路径转换而来（`/` 替换为 `:`）。

### 19.2 pathToEventName

```typescript
// /users/list → users:list
function pathToEventName(path: string): string {
    return path.split('/').map(s => s.trim()).filter(Boolean).join(':');
}
```

### 19.3 路由事件发布

Router 继承 ComposableBase.with(EventAbility)，通过 emit 发布路由切换事件：

```typescript
// source='router'，走 eventScope 隔离通道
this.emit(eventName, event, { source: 'router' });
```

监听方通过 EventBridgeAbility 监听 router 源事件实现刷新。

## 二十、emit 统一入口

### 20.1 设计思路

EventAbility.emit 作为统一入口，通过第三个参数 options 分流：

- `emit(event, data)` → 传统模式，直接走 eventScope.emit()
- `emit(event, data, { source })` → UI 事件模式，自动构建 EventContext

scopeId 由 eventScope 内部自动绑定，无需手动传入。

### 20.2 EventScope.emit 签名

```typescript
emit(event: string, data?: any, options?: { source?: any }): void
```

- 无 options 时 source 默认为 scope 自身
- 有 options.source 时使用指定的事件源

## 二十一、待定决策

### 18.1 可变行高虚拟列表

固定行高简单，可变行高需要：
- 首次渲染测量行高
- 缓存行高映射
- 滚动时动态计算偏移

是否在 Phase 1 就支持，还是后续优化？

### 18.3 模板继承的粒度

TemplateRegistry.extend 的扩展方式：
- `prepend` / `append` / `replace` / `insertBefore` / `insertAfter`
- 是否需要更复杂的模板组合？

## 十九、实施路线

### Phase 1：基础

- `@qimenjs/context` — EventContext + EventContextBuilder + EventType 枚举 + 预定义 data 结构类型 + EventChainLink
- `@qimen-lab/theme` — DesignTokens 类型定义 + ThemeManager + CSS 变量生成 + 原子化 CSS 生成器 + 亮/暗主题
- `@qimen-lab/component` — ComponentBase + TemplateRegistry + OverlayRoot + z-index 管理 + 基础能力（ThemeAbility, StyleAbility, VisibleAbility, DisableAbility, EventBindingAbility, HandlerAbility, AnimationAbility, markDirty）+ bridges 绑定 + EventFlowRegistrar + 翻译表达式解析

### Phase 2：核心组件

- `@qimen-lab/component` — Button, Input, Select, HBox, VBox, Grid, Space 组件
- 组件样式（CSS 类 + CSS 变量 + 原子化 CSS + 内置动画 keyframes）
- IDataSource 接口定义
- ComponentEventRegistry 事件注册表

### Phase 3：JSON 渲染

- `@qimen-lab/layout` — LayoutNode 类型定义 + HandlerAction + 解析 + 验证
- `@qimen-lab/renderer` — Renderer + RenderContext + RenderRegistrar + 内置渲染处理器 + Pipeline 集成

### Phase 4：高级组件

- Table, Form, Dialog, Pagination 组件
- VirtualListAbility + 固定行高虚拟列表
- DataSourceAbility + EntityManager 集成
- OverlayAbility + 弹窗/下拉定位
- 响应式布局

### Phase 5：生态

- 框架适配器（React / Vue）
- 可变行高虚拟列表
- 更多组件（DatePicker, Upload, TreeSelect...）
- 可视化 Layout 编辑器
