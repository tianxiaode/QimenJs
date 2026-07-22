# @qimenjs/events

**层级**: 第 1 层  
**状态**: ✅ 完成  
**测试**: ✅ 通过  
**覆盖率**: ~80%

## 概述

事件系统包，提供环境无关的事件订阅、发布、作用域管理功能。

## 功能

- **EventBus** - 按 scopeId 隔离的底层订阅/发布
- **EventScope** - 事件作用域生命周期管理
- **GlobalEventBus** - 全局事件总线单例
- **EventBridge** - 桥接事件收发（bridgeScope 隔离）
- **EntityEventBus** - 实体事件总线（entityScope 隔离）
- **OverlayEventBus** - 浮层事件总线（overlayScope 隔离）
- **DragEventBus** - 拖拽事件总线（dragScope 隔离）
- **RouteEventBus** - 路由事件总线（routeScope 隔离）
- **SystemEventBus** - 系统事件总线（systemScope 隔离）
- **WindowEventBridge** - 窗口事件懒桥接（resize/visibility/hashChange/popState 等）
- **I18nEventBridge** - i18n 事件懒桥接
- **EventSourceRegistrar** - 事件源注册器
- **EventFlowRegistrar** - 事件流注册表

## 事件总线架构

```
GlobalEventBus (单例)
  └── EventBus (底层，按 scopeId 隔离)
       ├── rootScope          → 全局事件
       ├── bridgeScope        → EventBridge 桥接事件
       ├── entityScope        → EntityEventBus 实体事件
       ├── overlayScope       → OverlayEventBus 浮层事件
       ├── dragScope          → DragEventBus 拖拽事件
       ├── routeScope         → RouteEventBus 路由事件
       ├── systemScope        → SystemEventBus 系统事件
       └── [组件 eventScope]  → 每个组件独立作用域
```

## 依赖

```typescript
dependencies: {
  '@qimenjs/logger': 'L0',
  '@qimenjs/utils': 'L0'
}
```

## 测试状态

- ✅ 所有测试通过
- ✅ 代码覆盖率 ~80%

## 已知问题

无
