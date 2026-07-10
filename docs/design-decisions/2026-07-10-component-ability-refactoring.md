# ComponentBase 能力拆分与模板包重命名

> 日期：2026-07-10
> 状态：当前有效

## 背景

ComponentBase 的初始化逻辑、节点扫描、浮层管理等功能直接写在基类中，导致：
1. 基类职责过重，难以独立测试
2. AnimationAbility/EntityCoreAbility/PermissionAbility 仍使用旧的 AbilityBase 类模式（文件不存在，导入报错）
3. html-template 包名带有 "html" 前缀，但实际也管理 JSON 组件定义，命名不准确
4. HtmlTemplateRegistrar/HtmlTemplateRegistrarName 废弃别名仍在代码中

## 决策

### 1. ComponentBase 能力拆分为 AbilityDefinition

将 ComponentBase 的核心功能拆分为独立的 AbilityDefinition 对象：

| 能力 | 职责 |
|------|------|
| InitAbility | 统一初始化流程（initialize/initConfig/initContent/assignProps/bindEvents） |
| NodeMapAbility | 模板节点扫描、属性生成、data-i18n + refreshI18n 集中刷新 |
| OverlayAbility | 浮层管理（createOverlay/initTooltipOverlay） |

方法使用 `this` 直接访问宿主组件，不传实例参数。

### 2. 旧 AbilityBase 类模式迁移

AnimationAbility、EntityCoreAbility、PermissionAbility 从 `class extends AbilityBase` 改为 `AbilityDefinition` 纯对象：
- 属性用 `this.props` + `this.setProp`
- 方法用 `this` 直接访问
- 删除不存在的 AbilityBase 文件引用

### 3. content 目录精简

从 `src/component-abilities/content/` 迁出：
- `createOverlayManager` → `OverlayAbility.createOverlay`
- `positionOverlay` → `src/component-core/abilities/positionOverlay.ts`
- `normalize` → 内联到 ContentAbility
- `createContentManager` → 删除（功能由 InitAbility + NodeMapAbility 替代）
- IContentAbility 接口 → 删除（功能分散到 NodeMapAbility/OverlayAbility）

### 4. html-template → template 重命名

- 目录：`src/html-template/` → `src/template/`
- 包别名：`@qimenjs/html-template` → `@qimenjs/template`
- 类名：`HtmlTemplateRegistrar` → `TemplateRegistrar`
- 常量：`HtmlTemplateRegistrarName` → 删除（仅保留 `TemplateRegistrarName`）
- RegistryHub 键：`'html'` → `'template'`（与 TemplateRegistrarName 值一致）
- register.ts 新增 `RegistryHub.use(TemplateRegistrar.getInstance())`

## 原因

1. **AbilityDefinition 是统一模式**：所有能力都应是纯对象，方法用 `this` 访问宿主，不需要类继承
2. **命名准确性**：template 包同时管理 HTML 模板和 JSON 定义，不应带 "html" 前缀
3. **RegistryHub 键一致性**：之前 ComponentBase/NodeMapAbility 用 `'html'`，OverlayAbility 用 `'template'`，不一致
4. **消除死代码**：AbilityBase 文件不存在、HtmlTemplateRegistrar 空子类、IContentAbility 过时接口

## 影响

- 所有引用 `HtmlTemplateRegistrar` 的文件改为 `TemplateRegistrar`
- 所有引用 `@qimenjs/html-template` 的文件改为 `@qimenjs/template`
- `RegistryHub.get('html')` 改为 `RegistryHub.get('template')`
- component-abilities/content 目录从 7 个文件精简为 2 个
- component-core/abilities 新增 InitAbility、NodeMapAbility、OverlayAbility、positionOverlay

## 替代方案

1. **保留 AbilityBase 类模式**：需要创建 AbilityBase.ts 文件，但与 AbilityDefinition 纯对象模式不一致
2. **保留 html-template 名称**：命名不准确，且 RegistryHub 键不一致问题无法解决
3. **保留 IContentAbility**：接口方法已分散到不同能力，保留空接口无意义

## 实施细节

### 文件变更

**新增**：
- `src/component-core/abilities/InitAbility.ts`
- `src/component-core/abilities/NodeMapAbility.ts`
- `src/component-core/abilities/OverlayAbility.ts`
- `src/component-core/abilities/positionOverlay.ts`
- `src/template/TemplateRegistrar.ts`（从 HtmlTemplateRegistrar.ts 重命名）

**删除**：
- `src/component-core/abilities/ContentAbility.ts`（空壳）
- `src/component-core/interfaces/IContentAbility.ts`
- `src/component-abilities/content/createContentManager.ts`
- `src/component-abilities/content/createOverlayManager.ts`
- `src/component-abilities/content/normalize.ts`
- `src/component-abilities/content/positionOverlay.ts`
- `src/component-abilities/content/index.ts`
- `src/html-template/HtmlTemplateRegistrar.ts`

**重写**（AbilityBase → AbilityDefinition）：
- `src/component-core/abilities/AnimationAbility.ts`
- `src/component-core/abilities/EntityCoreAbility.ts`
- `src/component-core/abilities/PermissionAbility.ts`

**重命名**：
- `src/html-template/` → `src/template/`

### 外部引用更新

ComponentBase.ts、Renderer.ts、NodeMapAbility.ts、OverlayAbility.ts、ToastManager.ts、MsgboxManager.ts、component/index.ts、component-abilities/index.ts

## 后续工作

- 无。本次重构为清理性质，不引入新功能。
