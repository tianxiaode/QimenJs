# 编译引擎重构 + 旧模式清理 + 管道化

> 日期：2026-07-27
> 状态：当前有效

## 决策 1：CompileEngine 职责收归 + 结构分离

### 背景

CompileEngine.ts 原先混杂了类型定义、常量、散装导出函数和类，存在以下问题：
- 类内定义的类型被其他文件引用时易形成循环依赖
- 散装函数（`expandFragments`、`findByPath`、`compilePendingTemplate`）与类平级导出，职责不清
- `compilePendingTemplate` 混合了编译和构造函数装饰，违反单一职责
- `findByPath` 是运行时 DOM 工具，不属于编译职责

### 决策

**目录结构分离**，避免循环依赖：

```
engine/
├── CompileEngine.ts              # 编译引擎类（纯编译）
├── ChildNodePropsEngine.ts       # 子节点属性引擎
├── DelegatedEventEngine.ts       # 委托事件引擎
├── constants/
│   └── compile-constants.ts      # VOID_TAGS / SKELETON_CLS 等编译常量
├── types/
│   └── compile-engine-types.ts   # CompileResult 等编译类型
└── utils/
    └── dom-path.ts               # findByPath（运行时 DOM 工具）
```

**散装函数内聚为静态方法**：

| 原散装函数 | 新归属 | 可见性 |
|-----------|--------|--------|
| `compileTemplate()` | `CompileEngine.compileTemplate()` | public static |
| `expandFragments()` | `CompileEngine.expandFragments()` | public static |
| `compileNode()` | `CompileEngine.compileNode()` | private static |
| `compileTypeNode()` | `CompileEngine.compileTypeNode()` | private static |
| `compileTagNode()` | `CompileEngine.compileTagNode()` | private static |
| `buildTagHtml()` | `CompileEngine.buildTagHtml()` | private static |
| `inferContentMode()` | `CompileEngine.inferContentMode()` | private static |

**移除不属于编译引擎的方法**：

| 移除方法 | 原因 | 去向 |
|---------|------|------|
| `compilePendingTemplate()` | 编译+ctor装饰混血，ctor装配不是编译职责 | 删除 |
| `compileSubtree()` | 旧 replace 模式遗留，新模式全模板编译 | 删除 |
| `findByPath()` | 运行时 DOM 工具，不是编译职责 | 移至 `engine/utils/dom-path.ts` |

### CompileEngine 最终职责边界

```
CompileEngine
├── compile(tpl, owner?)         # 主入口：tpl → CompileResult
├── expandFragments(node, ns?)   # 预处理：fragment → children
└── compileTemplate(root, logger) # 核心编译：TplNode → HTML + 元数据
```

## 决策 2：骨架屏编译时内化

### 背景

原骨架屏方案在编译时收集 `skeletonPaths`，运行时通过 `applySkeletonClasses` 动态加/减 `q-skeleton` 类。问题：
- type 节点（组件）编译时已输出 `<div class="q-skeleton"></div>`，运行时再加一遍是冗余
- 组件挂载时 placeholder.replaceWith(child.el) 自然移除骨架类，不需要运行时移除
- tag 节点 `skeleton: true` 语义不清，组件天然有骨架

### 决策

1. **type 节点**：编译时 HTML 含 `class="q-skeleton"`，cls 元数据含 `q-skeleton`，运行时零开销
2. **tag 节点**：删除 `skeleton` 属性，不需要骨架标记
3. **skeletonPaths 移除**：从 CompiledTemplateCache / CompileEngine 产物 / TplNode / NodeMetadata 中删除
4. **运行时骨架逻辑移除**：step-ensure-node-map.ts 删除 applySkeletonClasses

## 决策 3：旧 replace 模式清理

### 背景

TemplateFactory / TemplateDeriver / BodyMerger / compileSubtree 是旧 replace 模式的遗留：
- 新模式下模板替换在编译时由 TemplateRegistrar 的 tplReplaces 完成
- 运行时不需要再编译子树或动态替换 DOM 子树
- NodeMapManager.appendTo / _replaceWithSubtree 无调用方

### 决策

删除以下文件和功能：
- TemplateFactory.ts / TemplateDeriver.ts / BodyMerger.ts
- CompileEngine.compileSubtree()
- NodeMapManager.appendTo() / _replaceWithSubtree() / _compileSubtree()
- NodeMapManager.replace() 简化为只接受组件类
- 相关测试全部删除

## 决策 4：ChildNodeProps 引擎化 + 管道化

### 背景

ChildNodeProps 原为散装函数（applyChildNodeProps / buildChildNodePropDescs），不符合引擎化架构风格，且不在初始化管道中。

### 决策

1. **引擎化**：`ChildNodePropsEngine` 类，`apply()` / `buildDescs()` 静态方法
2. **管道化**：新增 `step-setup-node-props.ts`，MOUNT_PHASE 中 ensureNodeMap 之后执行
3. **幂等**：`ctor._nodePropsSetup` 防重复安装

## 决策 5：初始化管道重构

### 最终管道结构

```
MOUNT_PHASE:    [ensureNodeMap, setupNodeProps, onInitState, onBeforeInit]
FILL_PHASE:     []
INSTANTIATE_PHASE: []
FINALIZE_PHASE: [onAfterInit]
```

- **ensureNodeMap**：从 TemplateRegistrar 获取 NodeMapManager，buildDOM，挂 nodeMap
- **setupNodeProps**：安装子节点内容属性描述符到 ctor.prototype
- **onInitState / onBeforeInit / onAfterInit**：生命周期钩子

## 决策 6：事件引擎整理

- **DelegatedEventEngine.ts**：当前事件引擎，保留
- **EventEngine.ts**：旧别名（`export const DelegatedEventEngine = EventEngine`），删除