# 渲染流程设计

> 最后更新：2026-07-09
>
> 基于 `src/layout/LayoutNode.ts` 的类型定义，设计组件的创建、初始化、渲染流程。
> 全部是新的，不需要兼容旧实现。

---

## 1. 核心原则

1. **分阶段初始化** — 不同操作依赖不同的前置条件（el 是否存在、props 是否已初始化），必须按顺序执行
2. **渲染器保证时序，Ability 不做防御** — Ability 的 setter 假设前置条件已满足，错了就报错
3. **LayoutNode.abilities 与 static abilities 无关** — 前者是渲染时复制给实例的配置，后者是类声明时的固有能力，注入方式相同但来源不同
4. **数据通过 props 传递，Ability 通过 `__initProps` 接收** — Ability 不直接依赖 LayoutNode 结构

---

## 2. 渲染流程

```
render(layout: LayoutNode, parentEl?: HTMLElement)
  │
  ├─ 阶段 1：创建实例（不依赖 el）
  │   ├─ 从 ComponentRegistrar 查找组件类
  │   ├─ new ComponentClass() → constructor 内自动 setupAbilities（静态能力）
  │   ├─ 注入 LayoutNode.abilities（setupAbilityDefinition，与 meta/extraFns 同级操作）
  │   ├─ 注入 extraFns（bind this → defineProperty）
  │   └─ 设置 meta
  │
  ├─ 阶段 2：创建 el + 注入模板
  │   ├─ component.el = createElement(layout)
  │   └─ component.el.appendChild(templateRegistrar.getFragment(type))
  │       └─ DocumentFragment 克隆，含 data-content / data-ref 标记
  │
  ├─ 阶段 3：初始化能力（依赖 el）
  │   ├─ 调用所有 Ability 的 __initProps(props)  ← el 已存在，ContentAbility 可查询 DOM
  │   └─ 调用所有 Ability 的 __init__ 标记方法   ← props 已初始化，EntityCore 可创建 Manager
  │
  ├─ 阶段 4：赋值属性（依赖 el）
  │   ├─ PositionProps → component.x / component.width / ...
  │   ├─ StyleProps → component.className / component.style
  │   ├─ AccessibilityProps → component.role / component.ariaLabel / ...
  │   ├─ EntityProps → component.entity
  │   ├─ TooltipProps / AnimationProps / PermissionProps
  │   └─ props（剩余属性）→ component.setProp(key, value)
  │
  ├─ 阶段 5：绑定事件（依赖 el + extraFns）
  │   ├─ handlers → component.onDom(event, handler) 绑定 DOM 事件
  │   └─ stateTriggers → globalEventBus.on(source:type, handler) 绑定
  │
  ├─ 阶段 6：条件/循环/响应式
  │   ├─ visible → 条件渲染
  │   ├─ repeat → 循环渲染
  │   └─ responsive → 响应式配置
  │
  ├─ 阶段 7：挂载 DOM
  │   └─ parentEl.appendChild(component.el)
  │
  ├─ 阶段 8：递归渲染 children
  │   └─ layout.children?.forEach(child => render(child, component.el))
  │
  └─ 阶段 9：生命周期
      └─ lifecycle.onMounted
```

---

## 3. 阶段详解

### 3.1 阶段 1：创建实例

此阶段不依赖 `el`，只做纯数据/逻辑初始化。

```typescript
// 渲染器伪代码
const ComponentClass = componentRegistrar.get(layout.type);
const component = new ComponentClass();

// 以下三者都是"从 LayoutNode 取数据 → 复制到实例"，无本质区别

// 1. 注入 LayoutNode.abilities
if (layout.abilities) {
    for (const ability of layout.abilities) {
        component.setupAbilityDefinition(ability);
    }
}

// 2. 注入 extraFns
if (layout.extraFns) {
    for (const [key, fn] of Object.entries(layout.extraFns)) {
        Object.defineProperty(component, key, {
            value: fn.bind(component),
            writable: true,
            configurable: true,
            enumerable: true,
        });
    }
}

// 3. 设置 meta
if (layout.meta) {
    component.meta = { ...layout.meta };
}
```

**注意**：`setupAbilityDefinition` 需从 `private` 改为 `public`，不加防护性检查，错了就报错。

### 3.2 阶段 2：创建 el + 注入模板

```typescript
// 创建根元素
component.el = document.createElement('div');

// 从模板注册表获取 DocumentFragment 并注入
const fragment = templateRegistrar.getFragment(layout.type);
component.el.appendChild(fragment);
```

模板注册表（`HtmlTemplateRegistrar`）的 `getFragment()` 通过 `<template>` 缓存 + `cloneNode(true)` 返回 DocumentFragment，跳过重复 HTML 解析。

模板中的标记：
- `data-content="prefix:name"` — 内容插槽，由 ContentAbility 在 `__initProps` 中查询和填充
- `data-ref="name"` — 元素引用，供组件操作

### 3.3 阶段 3：初始化能力

#### `__initProps(props)`

渲染器从 LayoutNode 提取 props，调用所有 Ability 的 `__initProps`：

```typescript
// 渲染器伪代码
const props = extractProps(layout);
callInitProps(component, props);

function callInitProps(component: any, props: Record<string, any>) {
    // 遍历实例上所有属性，找到 __initProps 方法并调用
    // 或者由组件基类提供统一入口
    for (const ability of getAllAbilities(component)) {
        if (typeof ability.__initProps === 'function') {
            ability.__initProps.call(component, props);
        }
    }
}
```

**关键**：`__initProps` 必须在 `el` 创建之后调用，因为 ContentAbility 需要查询 `data-content` 元素。

#### `__init__`

部分 Ability 声明 `__init__: 'methodName'`，表示需要在 props 初始化后执行：

```typescript
// 渲染器伪代码
callInitMethods(component);

function callInitMethods(component: any) {
    for (const ability of getAllAbilities(component)) {
        if (ability.__init__ && typeof component[ability.__init__] === 'function') {
            component[ability.__init__]();
        }
    }
}
```

**顺序**：`__initProps` → `__init__`，因为 `__init__` 依赖 `__initProps` 设置的配置。

### 3.4 阶段 4：赋值属性

此时 `el` 已存在，Ability 的 setter 可以操作 DOM：

```typescript
// PositionProps
if (layout.x !== undefined) component.x = layout.x;
if (layout.y !== undefined) component.y = layout.y;
if (layout.width !== undefined) component.width = layout.width;
// ...

// StyleProps
if (layout.className) component.className = layout.className;
if (layout.style) component.style = layout.style;

// AccessibilityProps
if (layout.role) component.role = layout.role;
if (layout.ariaLabel) component.ariaLabel = layout.ariaLabel;
// ...
```

### 3.5 阶段 5：绑定事件

此时 `extraFns` 已注入，handlers 中的字符串引用可解析：

```typescript
// handlers
if (layout.handlers) {
    for (const [event, handler] of Object.entries(layout.handlers)) {
        const resolved = resolveHandler(component, handler);
        component.onDom(event, resolved);
    }
}

// stateTriggers
if (layout.stateTriggers) {
    for (const trigger of layout.stateTriggers) {
        for (const [eventType, methodName] of Object.entries(trigger.events)) {
            const off = globalEventBus.on(
                trigger.source ? `${trigger.source}:${eventType}` : eventType,
                (e) => component[methodName]?.(e)
            );
            component.onCleanup(off);
        }
    }
}
```

### 3.6 阶段 6：条件/循环/响应式

- **visible**：`boolean` 直接控制显隐，`string` 为表达式需运行时求值
- **repeat**：根据数据源循环创建组件实例，每个实例共享 LayoutNode 模板但 id 需唯一化
- **responsive**：根据断点合并 `Partial<LayoutNode>` 覆盖当前属性

### 3.7 阶段 7-9：挂载 + 递归 + 生命周期

```typescript
// 挂载
parentEl.appendChild(component.el);

// 递归渲染 children
if (layout.children) {
    for (const child of layout.children) {
        render(child, component.el);
    }
}

// 生命周期
if (layout.lifecycle?.onMounted) {
    layout.lifecycle.onMounted.call(component);
}
```

---

## 4. LayoutNode 字段与能力类映射

### 4.1 直接映射（字段 → Ability setter）

| LayoutNode 字段 | 所属 Props 接口 | 对应 Ability | setter 操作 |
|-----------------|----------------|-------------|-------------|
| x, y, top, left, bottom, right | PositionProps | PositionAbility | el.style 定位 |
| width, height | PositionProps | PositionAbility | el.style 尺寸 |
| minWidth, maxWidth, minHeight, maxHeight | PositionProps | PositionAbility | el.style 约束 |
| margin, padding | PositionProps | PositionAbility | el.style 间距 |
| scrollable | PositionProps | PositionAbility | el.style overflow |
| center | PositionProps | PositionAbility | el.style 居中 |
| hideMode | PositionProps | PositionAbility | 显隐模式切换 |
| alwaysOnTop | PositionProps | PositionAbility | zIndex 管理 |
| fullscreen | PositionProps | PositionAbility | 全屏切换 |
| shadow | PositionProps | PositionAbility | el.style boxShadow |
| focused | PositionProps | PositionAbility | el.focus() |
| tabIndex | PositionProps | PositionAbility | el.tabIndex |
| zIndex | PositionProps | PositionAbility | el.style.zIndex |
| className | StyleProps | StyleAbility | el.className |
| style | StyleProps | StyleAbility | el.style 内联样式 |
| role | AccessibilityProps | — (直接设 el) | el.setAttribute('role', v) |
| ariaLabel | AccessibilityProps | — (直接设 el) | el.setAttribute('aria-label', v) |
| aria* 系列 | AccessibilityProps | — (直接设 el) | el.setAttribute 对应 ARIA 属性 |
| entity | EntityProps | EntityCoreAbility | 创建 EntityManager |
| tooltip, tooltipPlacement 等 | TooltipProps | ContentAbility (浮层) | 浮层管理器 |
| enterAnimation, leaveAnimation 等 | AnimationProps | AnimationAbility | 动画控制 |
| permission | PermissionProps | PermissionAbility | 权限控制 |

### 4.2 协议映射（字段 → Ability 初始化协议）

| LayoutNode 字段 | 处理方式 | 调用时机 |
|-----------------|---------|---------|
| abilities | `setupAbilityDefinition()` | 阶段 1（不依赖 el） |
| meta | 直接赋值 `component.meta` | 阶段 1 |
| extraFns | `bind(component)` + `defineProperty` | 阶段 1 |
| handlers | `component.onDom()` | 阶段 5（依赖 el + extraFns） |
| stateTriggers | `globalEventBus.on()` | 阶段 5（依赖 extraFns） |
| lifecycle | `bind(component)` 后在对应时机调用 | 阶段 9 |
| visible | 条件渲染 | 阶段 6 |
| repeat | 循环渲染 | 阶段 6 |
| responsive | 响应式配置 | 阶段 6 |
| props | `__initProps()` | 阶段 3 |
| field | Schema 绑定 | 阶段 3（通过 __initProps） |

### 4.3 需要新建的能力类

| 能力类 | 对应 LayoutNode 字段 | 说明 |
|--------|---------------------|------|
| PositionAbility | PositionProps | 位置/尺寸/约束/视觉，已有设计 |
| StyleAbility | StyleProps | 样式管理，已有 |
| AccessibilityAbility | AccessibilityProps | ARIA 无障碍属性，**需新建** |
| PermissionAbility | PermissionProps | 权限控制，**需新建** |
| AnimationAbility | AnimationProps | 动画控制，已有设计 |
| ContentAbility | TooltipProps + contentSlots | 内容位管理，已有 |
| EntityCoreAbility | EntityProps | 实体管理，已有 |

---

## 5. 模板与数据插槽

### 5.1 模板机制

模板存储在 `HtmlTemplateRegistrar` 中，以 HTML 字符串形式注册，首次使用时创建 `<template>` 缓存，后续通过 `cloneNode(true)` 返回 DocumentFragment。

模板不含外层根元素（外层由组件创建），只包含内部结构。

### 5.2 数据插槽

模板中的 `data-content` 标记由 ContentAbility 在 `__initProps` 中处理：

1. 一次性 `querySelectorAll('[data-content]')` 建 contentMap
2. contentMap 存入 `abilityState('ContentAbility:contentMap')`
3. `createContentManager` 从 contentMap 取元素，生成 getter/setter
4. 从 props 初始化值

### 5.3 元素引用

模板中的 `data-ref` 标记供组件直接操作 DOM 元素（如 input、header 等）。

---

## 6. ComposableBase 变更

### 6.1 `setupAbilityDefinition` 改为 public

```typescript
// 之前
private setupAbilityDefinition(definition: AbilityDefinition): void { ... }

// 之后
public setupAbilityDefinition(definition: AbilityDefinition): void { ... }
```

不加防护性检查，错了就报错。

### 6.2 无其他变更

ComposableBase 的核心机制（abilityState、debounce、onCleanup、collectAbilities、setupAbilities、dispose）不需要修改。

---

## 7. 待确认事项

| # | 问题 | 影响 |
|---|------|------|
| 1 | `visible` 字符串表达式的求值上下文和触发机制 | 阶段 6 实现 |
| 2 | `repeat` 数据源变化时的更新策略（全量重建 vs diff） | 阶段 6 实现 |
| 3 | `responsive` 断点切换时是否需要动画过渡 | 阶段 6 实现 |
| 4 | `data-ref` 是否需要统一的 RefAbility，还是组件自行 querySelector | 模板机制 |
| 5 | `__initProps` 的调用是渲染器遍历 Ability 还是组件基类提供统一入口 | 阶段 3 实现 |
| 6 | `lifecycle` 钩子与 Ability 生命周期（onCleanup）的执行顺序 | 阶段 9 实现 |
