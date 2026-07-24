# @qimenjs/composable

**层级**: 第 2 层  
**状态**: 重构中（消费者迁移未完成）  
**测试**: 待更新

## 构建历史

### 2026-07-23
- 移除 `createForgedClass`、`initForgedState`、`ForgedConstructor` 导出
- 移除 `copyCallerPrototype`、内置方法独立导出
- `ComposableBase` 恢复为正常 class 定义，构造器自动初始化
- 新增 `withAbilities` 独立函数（向已有类注入能力，保留 instanceof）
- 新增 `withDefinitions` 独立函数（向已有类注入非能力定义）
- 导出 `ABILITY_STATES_KEY` / `CLEANUPS_KEY` Symbol keys
- 修复 `with` 方法在继承链中断裂的 bug（根本解决：移除 `with` 方法）

### 2026-07-22
- 重构为原型工厂函数架构（createForgedClass）
- ComposableBase 从 class 改为 const 语法糖
- debounce 迁移为 DebounceAbility（移至 system-abilities 包）
- 移除 getStatic / setStatic / setupAbilities / applyOverrides / host
- 内置方法不可被能力覆盖
- 新增 onBeforeDispose / onDisposed 可覆写钩子
- 提取 initForgedState()
- 修复 copyPrototypeMethods 不遍历原型链的 bug
- IComposableBase 接口更新

### 2026-07-01
- 完成 AbilityDefinition 迁移：15 个 Manager Ability 从 class 迁移为纯对象
- 移除 AbilityBase、DebounceAbilityBase、ComposableRegistrar 旧版代码

### 2026-07-01（早期）
- 实现 Per-Host Ability 私有状态（abilityStates）
- 修复多宿主共享 Ability 实例时的隔离问题

## 当前架构

### 核心机制

| 导出 | 说明 |
|------|------|
| `ComposableBase` | 正常 class，构造器自动初始化 |
| `withAbilities` | 向已有类注入能力（原地修改原型，保留 instanceof） |
| `withDefinitions` | 向已有类注入非能力定义（body 方法、getter/setter、普通值） |

### 内置方法（所有 ComposableBase 子类实例自动拥有）

| 方法 | 说明 |
|------|------|
| `abilityState(key, creator?)` | 获取/创建能力私有状态（per-instance 隔离） |
| `setAbilityState(key, value)` | 设置能力私有状态 |
| `onCleanup(callback)` | 注册清理回调（dispose 时逆序执行） |
| `onBeforeDispose()` | 释放前置钩子（可覆写） |
| `onDisposed()` | 释放后置钩子（可覆写） |
| `dispose()` | 释放：onBeforeDispose → onCleanup → 清理状态 → onDisposed |
| `logger` | 日志记录器 |

### 目录结构

```
src/composable/
├── ComposableBase.ts      # 正常类定义（构造器自动初始化）
├── forge.ts               # withAbilities / withDefinitions
├── index.ts               # 统一导出
└── types/
    ├── ability.ts         # 能力类型定义
    └── composable.ts      # 接口类型定义
```

## 待迁移消费者

以下文件仍使用旧 API（`ComposableBase.with()` / `createForgedClass` / `initForgedState`），需迁移到新架构：

- `src/entity/manager/CoreEntityManager.ts` — `ComposableBase.with(CORE_ENTITY_ABILITIES)`
- `src/entity/manager/managers.ts` — `BaseEntityManager.with(...)`
- `src/component-core/TemplateComponent.ts` — `ComposableBase.with(TEMPLATE_COMPONENT_ABILITIES)`
- `src/router/Router.ts` — `ComposableBase.with([SystemEventBusAbility, RouteEventBusAbility])`
- `src/imperative/Msgbox.ts` — `ComposableBase.with([TemplateCacheAbility, FloatingLayerAbility, EventAbility])`
- `src/imperative/Toast.ts` — `ComposableBase.with([TemplateCacheAbility, FloatingLayerAbility, EventAbility])`
- `src/component-core/engine/TemplateFactory.ts` — `templateComponentConstructor` / `InnerClass.with(extraAbilities)`
- 组件 `.with()` 调用 — ButtonComponent, TipsComponent, MenuComponent, RouteNavComponent, RouteContainerComponent 等

## 参考资料

- [包文档：composable](../../architecture/packages/composable.md)
- [能力系统使用指南](../../guides/with-abilities-guide.md)
