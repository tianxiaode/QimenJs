# QimenJS 架构文档

本目录包含 QimenJS 的完整架构文档，包括架构原则、包说明等。

## 文档结构

```
docs/architecture/
├── README.md                    # 本文件
├── component-ability-index.md  # 组件能力索引（组件-能力映射、事件体系、分页设计等）
├── render-pipeline.md          # 渲染流程设计（基于 LayoutNode 的创建/初始化/渲染流程）
├── ui-component-design.md      # UI 组件层设计方案
├── token-management.md         # Token 管理设计
├── principles/                  # 架构原则
│   ├── dependencies.md         # 依赖管理原则
│   ├── imports.md              # 引用规范
│   └── boundary-defense.md     # 边界与防御原则
└── packages/                    # 包文档
    ├── README.md               # 包汇总
    ├── composable.md           # composable 包
    ├── component-ability-mapping.md # 组件-能力映射
    ├── context.md              # context 包
    ├── data-processor.md       # data-processor 包
    ├── error.md                # error 包
    ├── event-dom.md            # event-dom 包
    ├── i18n.md                 # i18n 包
    ├── icon.md                 # icon 包
    ├── oauth2.md               # oauth2 包
    ├── permission.md           # permission 包
    ├── schema.md               # schema 包
    ├── system-abilities.md     # system-abilities 包
    ├── theme.md                # theme 包
    ├── utils.md                # utils 包
    └── validation.md           # validation 包
```

## 快速导航

### 架构原则
- [依赖管理原则](./principles/dependencies.md) - 包的依赖关系和层级
- [引用规范](./principles/imports.md) - 如何正确引用其他包
- [边界与防御原则](./principles/boundary-defense.md) - 输入校验和防御代码的职责划分

### 组件层
- [组件能力索引](./component-ability-index.md) - 组件-能力映射、事件体系、分页设计等（增量更新）
- [渲染流程设计](./render-pipeline.md) - 基于 LayoutNode 的创建/初始化/渲染流程
- [UI 组件层设计方案](./ui-component-design.md) - 组件层整体设计

### 包文档
- [包汇总](./packages/README.md) - 所有包的概览
- 各包详细文档见 `packages/` 目录

### 设计决策
- [设计决策记录](../design-decisions/README.md) - 重要的设计决策

## 架构概览

### 包层级结构

```
第 0 层：核心基础包（9 个，零依赖或极轻依赖）
├── @qimenjs/error
├── @qimenjs/logger
├── @qimenjs/utils
├── @qimenjs/async
├── @qimenjs/runtime
├── @qimenjs/crypto
├── @qimenjs/types
├── @qimenjs/i18n
└── @qimenjs/context

第 1 层：基础设施工具包（6 个，只依赖第 0 层）
├── @qimenjs/registry
├── @qimenjs/cache
├── @qimenjs/events
├── @qimenjs/task
├── @qimenjs/composable
└── @qimenjs/pipeline

第 2 层：功能工具包（7 个，依赖第 0-1 层）
├── @qimenjs/schema
├── @qimenjs/validation
├── @qimenjs/event-dom
├── @qimenjs/mime
├── @qimenjs/pattern
├── @qimenjs/data-processor
└── @qimenjs/permission

第 3 层：高级功能包（5 个，依赖第 0-2 层）
├── @qimenjs/http
├── @qimenjs/system-abilities
├── @qimenjs/oauth2
├── @qimenjs/data-processor-abp
└── @qimenjs/data-processor-spring

第 4 层：业务包（2 个）
├── @qimenjs/entity
└── @qimenjs/router

UI 层（7 个，依赖应用层及以下）
├── @qimenjs/component-core
├── @qimenjs/component-abilities
├── @qimenjs/component
├── @qimenjs/layout
├── @qimenjs/theme
├── @qimenjs/icon
└── @qimenjs/imperative
```

### 核心原则

1. **零循环依赖** - 严格按照层级依赖，不能反向引用
2. **单一职责** - 每个包只负责一个明确的功能
3. **最小依赖** - 只依赖必要的包
4. **类型安全** - 所有包都有完整的类型定义
5. **可独立使用** - 每个包都可以独立安装和使用

### 关键架构模式

1. **Ability/Composable 模式** - `ComposableBase` 基类 + `AbilityDefinition` 纯对象，通过 `withAbilities` 注入到类原型，`InferAbilities` 自动推导接口
2. **Registry 模式** - `RegistrarBase<M>` 抽象基类 + `RegistryHub` 中央管理
3. **Pipeline 模式** - weight+offset 排序、熔断、追踪、计时、统计
4. **Entity Manager 模式** - 5 种 Manager 通过 `extends + withAbilities + InferAbilities` 组合获得不同功能
5. **Component 模式** - 双层架构：闭包基类（ComponentFactory）+ 内部类基类（InnerComponent），withTemplate 预编译 + 纯克隆实例化 + 多模板条件选择
6. **EventBridge 单例模式** - 统一 eventScope 路由，解决跨作用域事件通信
7. **自动注册模式** - 模块导入时自动注册，"引入即注册"约定

### 架构关键设计详解

#### withTemplate 预编译架构（双层架构）

组件系统采用双层架构，彻底解耦模板结构与组件逻辑：

**闭包基类（ComponentFactory）** — 工厂层，纯闭包：
- 不持有 el、nodeMap，不挂载能力
- `withTemplate(templates)` → 编译模板 → 生成内部类 → 闭包保存
- `replace()` → 基于已有内部类派生新内部类
- 构造函数 / `create()` → 根据 `when` 条件选择内部类，返回内部类实例

**内部类基类（InnerComponent）** — 实现层，完整组件：
- 拥有完整初始化流程、能力（Ability）、el、nodeMap
- 预编译产物直接挂在自己身上
- 是真正被实例化的组件，外部拿到的就是这个实例
- 不需要代理、不需要 forwards 转发 nodeMap

`TemplateComponent.withTemplate(template)` 是组件创建的核心机制，实现了"类定义时预编译，实例化时纯克隆"的高效模式：

- **预编译阶段**（类定义时执行一次）：
  - 提取节点数据（`data-content` 属性 → 内容属性映射）
  - 生成 `contentProperties` 配置
  - 预编译事件模板（`data-event`/`data-emit`/`data-bridge` → InternalEventBinding/BridgeEventTemplate）
  - 创建模板 DOM 元素（`templateEl`）

- **实例化阶段**（每次 `new Xxx()` 执行）：
  - 遍历 `_variants`，`when(props)` 首个为 true 的变体胜出
  - `cloneNode(true)` 深克隆模板 DOM
  - 填充 node 引用（`nodeMap`）
  - 零字符串处理开销

- **多模板支持**：`ComponentTemplate.tpl` 支持 `TplNode | TplVariant[]`
  - 单模板（TplNode）→ 直接使用，无条件
  - 多模板（TplVariant[]）→ 每个 `when(props)` 首个为 true 的胜出，省略 when 为兜底

- **构造即完整**：`new Xxx()` 自动完成 initElement + 内容填充 + 事件绑定 + 注册，不需要 `initialize()`

- **static 配置**：`static children` / `static bridges` 等类级别配置，所有实例共享，props 可覆盖

- **支持三种模板格式**：HTML 字符串 / 旧版 JsonTemplateNode[] / 新版 ComponentTemplate

#### 组件事件体系

组件事件分为内部事件和外部事件，通过不同机制处理：

- **内部事件**（`data-event`）：
  - 通过 `this.bind` 统一绑定
  - 使用 event-dom 事件规范命名（`tap`/`click`/`input`/`change`/`scroll` 等），跨平台兼容
  - 支持 `?debounce=N`/`?throttle=N` 修饰符

- **外部事件**（`data-emit`），三种模式按优先级：
  1. `bridges` 声明的 → 走事件桥 `emitUI` 发布
  2. 实例有 `onXxx` 方法 → emitKey 驼峰化自动绑定（`saveBtn:tap` → `onSaveBtnTap`）
  3. 默认 → 走事件桥 `emitUI` 发布

- **EventBridge 单例**：
  - `src/events/EventBridge.ts` 统一 eventScope，解决发送方/监听方 eventScope 不同导致事件无法路由的问题
  - `EventBridgeAbility`（system-abilities）提供组件实例方法 `this.bridgeEmit()`/`this.bridgeOn()`/`this.bridgeOnce()`
  - `EventBridgeAbility`（component-core/abilities/）是配置能力，声明式事件桥接

#### 主题切换流程

```
ThemeRegistrar.apply('dark')
  → flattenTokens(tokens) 扁平化 DesignTokens
  → applyCSSVariables() 更新 :root CSS 变量（所有组件自动生效）
  → GlobalEventBus.emit('theme:change', payload)
  → ThemeAbility._initTheme() 中检查 static themeAware
  → 声明了 themeAware 的组件调用 onThemeChange(event)
```

- CSS 变量自动生效：所有组件通过 CSS 变量引用主题色，切换主题时无需组件配合
- JS 层面感知：组件声明 `static themeAware = true` 后，主题切换时触发 `onThemeChange(event)`
- 7 个中国传统色主题（青瓷/朱砂/靛蓝/鹅黄/紫檀/墨色/黛色）通过 `registerChineseThemes()` 按需注册

#### 权限控制流程

```
PermissionRegistrar.registerBatch(entries)
  → GlobalEventBus.emit('permission:change', payload)
  → PermissionAbility setter 中 _listenPermissionChange()
  → applyPermission() 根据 behavior 控制 UI
```

- 域范围权限码：`domain:code` 格式
- `PermissionRegistrar` extends RegistrarBase，通过 GlobalEventBus 触发 `permission:change` 事件
- `createDomainPermissions()` 域前缀权限码工厂
- LayoutNode 声明 `permission` 字段后自动监听权限变化

#### 能力锻造（forge.ts）

`src/composable/forge.ts` 提供能力锻造工具函数，用于将多个 AbilityDefinition 合并到目标类：

- `withAbilities(Class, abilities)` — 将能力列表中的属性/方法/getter/setter 复制到类原型，保留 instanceof
- `withDefinitions(Class, definitions)` — 将非能力定义（body 方法、getter/setter、普通值）复制到类原型
- 能力有特殊协议属性：`__propAliases`（属性别名映射）、`__initProps`（从 props 初始化）、`__init__`（初始化方法名）
- `InferAbilities<typeof abilities>` — 从能力数组自动推导交叉类型，通过声明合并注入到类接口

## 相关文档

- [构建进度](../build-progress/README.md) - 构建进度
- [ComposableBase 最佳实践](../best-practices/composable-best-practices.md) - 能力系统最佳实践
