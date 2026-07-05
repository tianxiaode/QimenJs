# QimenJS UI 组件层设计方案

> 状态：草案 v0.4，持续打磨中

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
    type: 'Button',
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

## 十七、待定决策

### 17.1 组件间通信

- 父子：props 传递 + 事件冒泡
- 兄弟：共享事件总线 / 共享数据源
- 跨层：RenderContext 传递？还是组件树查找？

### 17.2 可变行高虚拟列表

固定行高简单，可变行高需要：
- 首次渲染测量行高
- 缓存行高映射
- 滚动时动态计算偏移

是否在 Phase 1 就支持，还是后续优化？

### 17.3 模板继承的粒度

TemplateRegistry.extend 的扩展方式：
- `prepend` / `append` / `replace` / `insertBefore` / `insertAfter`
- 是否需要更复杂的模板组合？

## 十八、实施路线

### Phase 1：基础

- `@qimen-lab/theme` — DesignTokens 类型定义 + ThemeManager + CSS 变量生成 + 原子化 CSS 生成器 + 亮/暗主题
- `@qimen-lab/component` — ComponentBase + ComponentRegistrar + TemplateRegistry + OverlayRoot + z-index 管理 + 基础能力（ThemeAbility, StyleAbility, VisibleAbility, DisableAbility, EventBindingAbility, HandlerAbility, AnimationAbility, markDirty）

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
