# 组件编译引擎与模板系统

> QimenJS 组件系统采用**双层架构**：定义时预编译模板，实例化时纯克隆 DOM。通过管道化编译流程和 NodeMap 统一索引，实现高效的组件构建与渲染。

## 概述

组件系统的核心设计目标：

- **编译时优化**：模板只编译一次，产物可跨组件共享
- **运行时高效**：`cloneNode(true)` 克隆预解析 DOM，零字符串处理开销
- **骨架先行**：Phase 1 同步完成，el 立即可用，子组件异步实例化
- **统一索引**：NodeMap 管理所有命名 DOM 节点和子组件

## 组件与模板的关系

### ComponentTemplate 结构

```typescript
interface ComponentTemplate {
    tpl: TplNode;   // DOM 骨架结构定义
    body?: BodyDef; // 组件行为配置（方法、getter/setter、静态配置）
}
```

**body 接受三类内容**：

| 类型 | 示例 | 编译时处理 |
|------|------|-----------|
| 静态类属性 | `type`、`entityKey`、`eventKey`、`listens` | 设为类静态属性 |
| 函数 | 生命周期钩子、事件 handler、自定义方法 | 挂到原型 |
| getter/setter | 计算属性 | `defineProperty` 到原型 |

### useTemplate 使用方式

```typescript
// 定义模板
const BUTTON_TPL: TplNode = {
    tag: 'button',
    name: 'root',
    cls: 'q-btn',
    children: [
        { name: 'icon', tag: 'i', cls: 'q-btn__icon', hidden: true },
        { name: 'label', tag: 'span', cls: 'q-btn__label' },
    ],
};

// 注册模板
class ButtonComponent extends Component {}
ButtonComponent.useTemplate(BUTTON_TPL);

// 实例化
const btn = new ButtonComponent({ label: '保存' });
container.appendChild(btn.el);  // 骨架立即可见
await btn.ready;                // 等子组件 + 收尾完成
```

`useTemplate` 内部：
1. 将 tpl 定义为类的 `_tpl` 静态属性
2. 调用 `ComponentRegistrar.register(this, tpl)` 注册并编译

## 编译引擎流程

### 定义时编译（`CompileEngine.compile`）

```
TplNode → expandFragments → compileTemplate → CompiledTemplateCache
```

| 步骤 | 方法 | 作用 |
|------|------|------|
| 1. 展开 Fragment | `expandFragments(tpl)` | 递归将 `fragment` 展开为普通 `children`，`fragment.name` 作为命名空间前缀追加到子节点 name（如 `header:icon`） |
| 2. 编译模板 | `compileTemplate(expandedTpl)` | 递归遍历节点树，生成 HTML 字符串 + 收集元数据 |
| 3. 节点分派 | `compileNode(node, path, ctx)` | 根据 `node.type` 是否存在，分派到 `compileTypeNode` 或 `compileTagNode` |
| 4. type 节点 | `compileTypeNode` | 产出骨架占位 HTML `<div class="q-skeleton"></div>`，组件类引用存入 `meta.componentClass` |
| 5. tag 节点 | `compileTagNode` | 根据 tag 推导 `contentMode`（value/src/html/link），生成真实 HTML |
| 6. HTML 构建 | `buildTagHtml` | void 标签自闭合，其余递归编译 children 后包裹开闭标签 |
| 7. 缓存构建 | 主入口 `compile()` | 创建 `<template>` 元素缓存 HTML 片段 |

### 编译产物

```typescript
interface CompiledTemplateCache {
    html: string;                    // HTML 字符串
    indexPath: Record<string, number[]>;  // name → DOM 路径索引
    exposeNames: string[];           // 暴露的子组件名
    i18nNodes: I18nNodeMeta[];       // 需要 i18n 翻译的节点
    permissionNodes: PermissionNodeMeta[];  // 需要权限控制的节点
    templateCache: HTMLTemplateElement;     // 预解析的 <template> 元素
}
```

- `cache`（只读可共享）：所有同类组件实例共享
- `nodeMetas`（每类独立）：运行时附加 `el` 和 `component` 引用

## 实例化管线

实例化管线分 3 个 Phase：

```
Phase 1 MOUNT（同步，el 立即可用）:
  ensureNodeMap → selfMount → setupNodeProps → onBeforeInit

Phase 2 INSTANTIATE（异步，TaskQueue 队列化）:
  instantiateChildComponents

Phase 3 FINALIZE（同步）:
  bindListens → bindChildEvents → bindDomEvents → bindPermission → onAfterInit
```

### 各步骤详解

| 步骤 | 作用 |
|------|------|
| `ensureNodeMap` | 从 ComponentRegistrar 获取编译产物，创建 NodeMapManager，调用 `buildDOM()` 生成 el |
| `selfMount` | 如果组件有 `parent + slotName`，立即挂载到父的占位节点（骨架立即可见） |
| `setupNodeProps` | 类装饰步骤，在 `ctor.prototype` 上挂 getter/setter，使 `this.title = 'Hello'` 可用（仅首次编译执行） |
| `onBeforeInit` | 触发 `onBeforeInit` 钩子（模板注入后、事件绑定前） |
| `instantiateChildComponents` | 异步，通过 GlobalTaskQueue 队列化创建子组件实例，eventKey/entityKey 按传播规则向下传递 |
| `bindListens` | 绑定外部事件订阅（body.listens） |
| `bindChildEvents` | 绑定子组件事件 |
| `bindDomEvents` | 绑定 DOM 委托事件 |
| `bindPermission` | 绑定权限控制 |
| `onAfterInit` | 触发 `onAfterInit` 钩子，标记 `_templateInitialized = true` |

## NodeMap

NodeMapManager 是**运行时 DOM 管理器**，实例级，每个组件实例创建自己的。

### 核心职责

- **buildDOM**：从 `cache.templateCache` 克隆模板 + `_buildNodeMap`（遍历 `indexPath`，用 `findByPath` 定位 DOM 元素，关联元数据）
- **节点映射**：`_map` 是 `name → NodeMetadata` 的映射表，包含 `el`（DOM 元素）、`component`（子组件实例）、`tag`、`cls` 等
- **动态替换**：`replace(name, ComponentClass, props)` — 销毁旧组件 → 创建新实例 → DOM 原位替换 → 合并 nodeMap
- **子组件挂载**：`mountChildComponent(node, child)` — 用子组件 el 替换占位符，合并 nodeMap
- **Badge 构建**：`_buildBadgeOverlays()` — 为声明了 `badge` 的节点创建绝对定位 DOM，注册为 `{name}:badge` 节点
- **资源清理**：`disposeAll()` — 遍历销毁所有子组件，清空映射表

### $ 前缀访问器

```typescript
// this.$icon → nodeMap.icon.component
// this.$label → nodeMap.label.el
```

编译时自动在原型上创建 `$` 前缀 getter，直接访问 nodeMap 中的子组件实例或 DOM 元素。

## 组件间通信

| 机制 | 方式 | 场景 |
|------|------|------|
| **ComponentEventBus** | `eventKey` 通道标识，`componentEmit`/`componentOn` | 跨组件层事件通信 |
| **listens** | `body.listens` 声明式订阅 | 监听 source/entity/float/drag/route 事件 |
| **domEvents** | 三层嵌套委托：DOM事件 → 组件路径 → action | 父组件在自身 el 上监听子组件 DOM 事件 |
| **forwards** | `body.forwards` 透传属性/方法 | 跨组件层属性/方法代理 |
| **parent/slotName** | 直接引用 | 父子组件直接访问 |
| **$ 前缀访问器** | `this.$icon` → `nodeMap.icon.component` | 父组件访问子组件实例 |
| **eventKey/entityKey 传播** | 实例化时自动向下传播 | 子组件继承父组件的事件/实体通道 |

### eventKey/entityKey 传播规则

| 子组件声明 | fixed | 结果 |
|-----------|-------|------|
| 声明了 key 且 `fixed: true` | 是 | 保留子组件的值 |
| 声明了 key 且非 fixed | 否 | 替换为父组件的 key |
| 未声明 | — | 不传播 |

## 编译优化策略

### 编译时优化

1. **模板共享**：`ComponentRegistrar` 的 `tplRefs` 表（`Map<TplNode, string>`），同一模板对象只编译一次
2. **懒编译**：`getCompiled(type)` 首次访问时才编译，编译后缓存
3. **`<template>` 元素缓存**：运行时 `cloneNode(true)` 直接克隆，避免重复 `innerHTML` 解析
4. **indexPath 路径索引**：编译时生成 `name → number[]` 映射，运行时 `findByPath` O(k) 定位（k=路径深度），无需 querySelector
5. **类装饰一次性**：`setupNodeProps` 只在首次编译时执行，后续实例共享原型上的 getter/setter
6. **contentMode 自动推导**：编译时根据 tag 推导内容操作模式（value/src/html/link），运行时直接用对应 API

### 运行时优化

1. **骨架先行**：Phase 1 同步完成，el 立即可用
2. **TaskQueue 队列化**：子组件通过 `GlobalTaskQueue` 逐个创建，避免阻塞主线程
3. **脏追踪批量写**：`_markNodeDirty` + `_flushNodeProps`，合并多次 DOM 写入
4. **cloneNode**：`buildDOM()` 使用 `templateCache.content.cloneNode(true)` 克隆，比 innerHTML 快

## 参见

- [组件定义最佳实践](../best-practices/withtemplate-best-practices.md)
- [模板驱动机制](../best-practices/html-template-best-practices.md)
- [ComposableBase 能力模式](./composable-ability-pattern.md)
- [事件系统](./event-system.md)