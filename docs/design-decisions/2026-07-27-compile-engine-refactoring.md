# 编译引擎重构 + ComponentRegistrar 移除

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
├── constants/
│   └── compile-constants.ts      # VOID_TAGS 等编译常量
├── types/
│   └── compile-engine-types.ts   # CompileResult 等编译类型
└── utils/
    └── dom-path.ts               # findByPath（运行时 DOM 工具）
```

**散装函数内聚为静态方法**：

| 原散装函数 | 新归属 | 可见性 |
|-----------|--------|--------|
| `compileTemplate()` | `CompileEngine.compileTemplate()` | public static |
| `compileSubtree()` | `CompileEngine.compileSubtree()` | public static |
| `expandFragments()` | `CompileEngine.expandFragments()` | public static |
| `compileNode()` | `CompileEngine.compileNode()` | private static |
| `compileTypeNode()` | `CompileEngine.compileTypeNode()` | private static |
| `compileTagNode()` | `CompileEngine.compileTagNode()` | private static |
| `buildTagHtml()` | `CompileEngine.buildTagHtml()` | private static |
| `inferContentMode()` | `CompileEngine.inferContentMode()` | private static |

**移除不属于编译引擎的方法**：

| 移除方法 | 原因 | 去向 |
|---------|------|------|
| `compilePendingTemplate()` | 编译+ctor装饰混血，ctor装配不是编译职责 | 删除（消费者改为 `CompileEngine.compile()` + 自行装配） |
| `findByPath()` | 运行时 DOM 工具，不是编译职责 | 移至 `engine/utils/dom-path.ts` |

### CompileEngine 最终职责边界

```
CompileEngine
├── compile(tpl, owner?)         # 主入口：tpl → CompileResult
├── expandFragments(node, ns?)   # 预处理：fragment → children
├── compileTemplate(root, logger) # 核心编译：TplNode → HTML + 元数据
└── compileSubtree(node, logger) # 局部编译：子树替换场景
```

### 理由

- **类型/常量独立目录**：避免不经意的互相引用造成循环依赖
- **散装函数→静态方法**：内聚到类中，调用链清晰（`CompileEngine.compileTemplate()` vs `compileTemplate()`）
- **私有静态**：内部实现细节（compileNode/compileTagNode 等）不暴露，减少 API 表面积
- **JSDoc 补全**：每个公开方法标注职责、参数、返回值、示例，方便排查问题

## 决策 2：移除 ComponentRegistrar，统一到 TemplateRegistrar

### 背景

项目同时维护 ComponentRegistrar（组件类注册）和 TemplateRegistrar（模板注册）两套注册生态：

- **ComponentRegistrar**：存储 `type → ComponentClass` 映射，用于按 type 名动态实例化
- **TemplateRegistrar**：存储 `name → TplNode` 映射，懒编译返回编译产物

问题：
1. **两套生态**：同一组件可能同时注册到两个注册器，维护成本翻倍
2. **引擎模式遗留**：RowEngine/HeaderEngine 动态生成类后注册到 ComponentRegistrar，是"模板驱动代码生成"模式
3. **ComponentRegistrar 未纳入 RegistryHub**：没有类型声明增强，游离于注册体系之外
4. **defaultEventData 耦合**：EventEngine 通过 `ComponentRegistrar.getMeta()` 获取事件元数据，元数据应内聚到组件类自身

### 决策

**删除 ComponentRegistrar**，统一基于模板的单一生态：

1. **TemplateRegistrar 为唯一注册器**：所有模板通过 TemplateRegistrar 注册，编译产物由 `get()` 懒编译返回
2. **type→类 映射下放到消费者**：ItemGroup/Tabs/Overlay 等需要动态实例化的组件，内部维护自己的 type 映射表
3. **defaultEventData 移为组件静态属性**：`ButtonComponent.defaultEventData = ['name']`，EventEngine 直接从类读取
4. **Row/Header 改为组件模式**：预定义 RowComponent/HeaderComponent，tpl 由 columns 动态生成后传入

### 引擎模式 → 组件模式

```
之前（引擎模式）：
  columns → RowEngine.compile() → 动态生成 RowClass → 注册到 ComponentRegistrar
  模板驱动，引擎生成类，类是产物的附庸

之后（组件模式）：
  定义 RowComponent extends Component → 类内注入 tpl（由 columns 生成）→ TemplateRegistrar
  类驱动，模板是类的数据参数，和 ButtonComponent 走同一条路
```

### 理由

- **单一生态**：不再维护两套注册体系，TemplateRegistrar 统一管理
- **类是一等公民**：组件类预定义，模板是输入参数，而非引擎动态生成
- **依赖显式化**：编译产物通过参数传递，不经过全局注册表中转
- **与 Direct Extends 模式一致**：所有组件都是 `class extends Component` + 声明式定义 + 显式 compile()

## 决策 3：ComponentRegistrar 消费者迁移方案

| 消费者 | 原用法 | 迁移方案 |
|--------|--------|----------|
| `register.ts` | `registrar.register('Button', ButtonComponent)` | 删除，组件通过 import 直接引用 |
| `ItemGroupBaseComponent` | `ComponentRegistrar.get(itemType)` | 内部 `ITEM_TYPE_MAP` 映射表 |
| `TabsComponent` | `ComponentRegistrar.get(content)` | 内部 `CONTENT_TYPE_MAP` 映射表 |
| `OverlayDispatchCenter` | `ComponentRegistrar.get(def.type)` | 内部 `OVERLAY_TYPE_MAP` 映射表 |
| `HeaderEngine` | `ComponentRegistrar.get(cellType)` | 内部 `HEADER_CELL_TYPE_MAP` 映射表 |
| `MenuItemManageAbility` | `ComponentRegistrar.get('MenuItem')` | 直接 import MenuItemComponent |
| `OverflowMenuComponent` | `ComponentRegistrar.get('Menu')` | 直接 import MenuComponent |
| `EventEngine` | `ComponentRegistrar.getMeta(type).defaultEventData` | 从组件类静态属性读取 |
| `DelegatedEventEngine` | 同上 | 同上 |