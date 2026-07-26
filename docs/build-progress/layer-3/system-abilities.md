# @qimenjs/system-abilities

**层级**: 第 3 层  
**状态**: ✅ 完成  
**测试**: ✅ 通过  
**覆盖率**: 88.23%（分支）

## 概述

系统能力实现包，提供可组合的系统能力类。

## 功能

- **EventAbility** - 事件能力，提供事件监听和发射功能
- **DomEventsAbility** - DOM 事件能力，提供手势事件处理功能
- **EventBridgeAbility** - 事件桥能力，暴露 bridgeEmit/bridgeOn/bridgeOnce
- **EntityEventBusAbility** - 实体事件总线能力，暴露 entityEmit/entityOn/entityOnce
- **OverlayEventBusAbility** - 浮层事件总线能力，暴露 overlayEmit/overlayOn/overlayOnce
- **DragEventBusAbility** - 拖拽事件总线能力，暴露拖拽相关方法
- **SystemEventBusAbility** - 系统事件总线能力，暴露 systemEmit/systemOn/systemOnce
- **RouteEventBusAbility** - 路由事件总线能力，暴露 routeEmit/routeOn/routeOnce
- **DomainAbility** - 域配置能力，提供域配置访问功能
- **SystemAbility** - 系统配置能力，提供系统配置访问功能 + i18nConfig() 获取当前语言区域配置
- **registerSystemAbilities()** - 能力注册函数

## 依赖

```typescript
dependencies: {
  '@qimenjs/composable': 'L1',
  '@qimenjs/registry': 'L1',
  '@qimenjs/events': 'L1',
  '@qimenjs/event-dom': 'L2'
}
```

## 构建进度

### ✅ 已完成

1. **能力类实现**
   - ✅ EventAbility - 事件能力
   - ✅ DomEventsAbility - DOM 事件能力
   - ✅ DomainAbility - 域配置能力
   - ✅ SystemAbility - 系统配置能力

2. **能力注册**
   - ✅ 创建 registerSystemAbilities() 函数
   - ✅ 注册所有能力（已迁移为 AbilityDefinition 纯对象）

3. **类型定义**
   - ✅ ComposableEntry 接口
   - ✅ IEventAdapter 接口
   - ✅ BindOptions 接口
   - ✅ GestureSemantic 类型

4. **测试**
   - ✅ 1 个测试套件
   - ✅ 20 个测试用例
   - ✅ 核心功能覆盖（EventAbility、DomEventsAbility、DomainAbility、SystemAbility）

### 📊 测试结果

```
Test Suites: 1 passed, 1 total
Tests:       11 passed, 11 total
Snapshots:   0 total
Time:        1.847 s
```

### 🔧 技术细节

**模块引用优化**:
- 所有 `@qimenjs/` 引用改为 `@/`
- 简化 Jest 配置
- 统一引用方式

**能力注册**:
- 提供系统能力定义（AbilityDefinition 纯对象）
- 通过 ComposableBase.abilities 声明使用

**类型定义**:
- 完整的类型定义
- 导出所有必要的接口和类型

### 📝 变更历史

#### 2026-07-26
- SystemAbility 新增 i18nConfig(locale?) 方法，直接从 I18nManager 获取当前语言的完整区域配置
- 组件通过 this.i18nConfig() 获取最新 i18n 配置，事件触发后获取保证是最新的

#### 2026-06-30
- 补充单元测试，分支覆盖率从 0% 提升到 88.23%
- 新增 EventAbility、DomEventsAbility、DomainAbility、SystemAbility 完整测试
- 发现需在 afterEach 中清理 ComposableBase 实例避免 Ability 状态共享问题（已通过 abilityState per-host 隔离解决）

#### 2026-06-26
- 修正所有模块引用，使用 `@/` 代替 `@qimenjs/`
- 创建能力注册函数 `registerSystemAbilities()`
- 创建完整的类型定义
- 编写单元测试
- 所有测试通过

#### 初始版本
- 实现各种能力类
- 提供能力入口定义
