# 2026-07-11 主题注册表与事件驱动重构

## 背景

ThemeManager 是独立单例，不继承 RegistrarBase，自维护 listeners 集合。与项目中其他注册器（TemplateRegistrar、ComponentRegistrar、PermissionRegistrar）的模式不一致。同时，ThemeAbility 让所有组件实例都注册 `theme:change` 监听器，导致事件风暴。

## 决策

### 1. ThemeManager → ThemeRegistrar

将 ThemeManager 重构为 ThemeRegistrar（extends RegistrarBase），统一注册器模式：

- `initEventBus(eventBus)` 注入 GlobalEventBus（与 PermissionRegistrar 一致）
- `apply()` 通过 `this.eventBus?.emit(THEME_CHANGE_EVENT, payload)` 触发事件
- 移除自维护的 `listeners` Set 和 `onThemeChange()` 方法
- 新增 `register.ts`：引入包时自动注册预设主题 + 注册到 RegistryHub

### 2. 主题感知：static themeAware 声明式驱动

ThemeAbility 不再无条件注册监听器。改为读取组件类的 `static themeAware` 属性：

```typescript
class ButtonComponent extends ComponentBase {
    static themeAware = true;  // 声明需要 JS 层面感知主题
    onThemeChange(event) { /* 主题切换时重新计算 */ }
}
```

- 未声明 `themeAware` 的组件：零开销，CSS 变量自动生效
- 声明了 `themeAware` 的组件：注册 GlobalEventBus 监听器

**为什么不用 LayoutNode 声明**：按钮等基础组件不管 LayoutNode 有没有声明都需要感知主题，这是组件类级别的决策，不是实例级别的配置。

### 3. 权限感知：LayoutNode 声明驱动

PermissionAbility 在 setter 中注册 `permission:change` 监听器：

```typescript
// LayoutNode 声明
{ type: 'Button', permission: { code: ['system:user:delete'], behavior: 'disable' } }
// → assignProps 中 c.permission = layout.permission → setter 触发 → 注册监听
```

**为什么与主题不同**：权限是实例级配置，只有声明了 `permission` 字段的组件才需要监听权限变更。

### 4. Tooltip 属性归属

tooltip 属性的 getter/setter 从 InitAbility 移到 OverlayAbility，职责归一。InitAbility 的 `assignProps` 中赋值逻辑不变（调用 setter），只是属性定义位置变了。

### 5. 重导出清理

- `component-abilities/index.ts`：移除从 `@qimenjs/component-core` 的所有重导出
- `component/index.ts`：移除从 `@qimenjs/component-core` 和 `@qimenjs/component-abilities` 的所有重导出
- 删除 `component-abilities/core/` 目录（纯重导出）

外部应直接从各自的包导入，如 `import { ComponentBase } from '@qimenjs/component-core'`。

### 6. 废弃文件清理

- 删除 `src/renderer/`（旧渲染流程残留）
- 删除 `src/component-core/renderer/`（同上）
- 删除 `src/theme/ThemeManager.ts`（被 ThemeRegistrar 替代）
- 删除 `src/composable/DescriptorFactory.ts`（无引用）
- 删除 `src/validation/processors/compare/`（无引用）
- 删除 `src/schema/presets.ts`（无引用）
- 清理 `tsconfig.json` 中 `@qimenjs/renderer` 路径映射

## 影响范围

- `src/theme/`：ThemeManager → ThemeRegistrar + register.ts
- `src/component-core/abilities/ThemeAbility.ts`：__init__ 读取 static themeAware
- `src/component-core/abilities/PermissionAbility.ts`：setter 中注册监听
- `src/component-core/abilities/InitAbility.ts`：tooltip 赋值保留，ThemeProps 赋值移除
- `src/component-core/abilities/OverlayAbility.ts`：新增 tooltip getter/setter
- `src/component-core/ComponentBase.ts`：COMPONENT_BASE_ABILITIES 新增 6 个能力
- `src/component-abilities/children/ChildrenAbility.ts`：新增 add(layout) 方法
- `src/layout/LayoutNode.ts`：无新增 ThemeProps（改用 static themeAware）
- 测试文件：导入路径更新
