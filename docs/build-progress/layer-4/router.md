# @qimenjs/router

**层级**: 第 4 层  
**状态**: ✅  
**测试**: ✅  
**覆盖率**: ~85%

## 构建历史

### 2026-07-22
- ✅ 路由事件重构：Router 作为 RouteEventBus 双向参与者
- ✅ 新增 RouteEventBus（独立路由事件总线，routeScope 隔离）
- ✅ 新增 RouteEventBusAbility（暴露 routeEmit/routeOn/routeOnce 实例方法）
- ✅ Router 监听 `switch` 事件执行导航，发出 `change` 事件通知变化
- ✅ 窗口事件（hashchange/popstate）移入 SystemEventBus 懒桥接
- ✅ 删除 RouteAbility/RouteEmitAbility/RouteListenAbility（改用 RouteEventBusAbility 直接交互）
- ✅ tpl-body.ts 新增 RouteListen 类型（`{ route: 'router', events: { change: 'onRouteChange' } }`）

### 2026-07-12
- ✅ Router 重构为纯事件模式，pathToEventName 路径转事件名
- ✅ RouteAbility/RouteEmitAbility/RouteListenAbility 组件级路由能力

## 交互模型

```
组件 → routeEmit(switch) → RouteEventBus → Router.navigate() → routeEmit(change) → RouteEventBus → 组件.routeOn(change)
```

- **导航**：`this.routeEmit(switchCtx)` — 需混入 RouteEventBusAbility
- **监听**：`this.routeOn('router', 'change', handler)` 或 `listens: [{ route: 'router', events: { change: 'onRouteChange' } }]`
- **Router** 混入 SystemEventBusAbility + RouteEventBusAbility，通过 `this.systemOn` 监听窗口事件

## 测试状态

### 通过的测试
- ✅ Router - 路径转事件名
- ✅ Router - 事件发射与监听
- ✅ Router - switch 事件驱动导航

## 已知问题

无

## 使用统计

### 依赖的包
- @qimenjs/events (L1) — RouteEventBus、SYSTEM_EVENTS
- @qimenjs/composable (L1) — ComposableBase
- @qimenjs/system-abilities (L3) — SystemEventBusAbility、RouteEventBusAbility
- @qimenjs/context — EventContextBuilder

### 被以下包使用
- @qimenjs/component (UI)
