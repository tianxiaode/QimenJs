# 路由系统

> QimenJS 路由系统基于事件总线，支持 Hash 和 History 两种模式，通过 RouteEventBus 实现组件与路由的解耦通信。

## 概述

路由系统的核心设计：

- **事件驱动**：Router 通过 RouteEventBus 双向通信（入站接收导航指令，出站通知路由变化）
- **双模式**：Hash 模式（默认）和 History 模式
- **路径参数**：支持 `:param` 动态路径参数匹配
- **路由守卫**：`addGuard()` 支持导航拦截

## 架构

Router 是单例，组合了 `SystemEventBusAbility` 和 `RouteEventBusAbility`：

```
Router (单例, extends ComposableBase.with([SystemEventBusAbility, RouteEventBusAbility]))
  → navigate(path, replace?)      → 执行导航
  → addGuard(guard)               → 添加路由守卫
  → routeEmit('change', payload)  → 通知路由变化
```

## 两种模式

### Hash 模式（默认）

- 监听 `hashchange` 事件
- 导航：`window.location.hash = path`
- URL 格式：`https://example.com/#/users/list`

### History 模式

- 监听 `popstate` 事件
- 导航：`history.pushState/replaceState`
- URL 格式：`https://example.com/users/list`

## 事件通信

### 入站（接收导航指令）

```
组件 → routeEmit('switch', { path: '/users', replace: false })
     → Router.routeOn('router', 'switch') → navigate(path, replace)
```

### 出站（通知路由变化）

```
Router → routeEmit('change', { path, previousPath, params })
      → 组件.routeOn('router', 'change', handler)
      → 细分路径事件：routeEmit('change:users:list', ...)
```

### 路径转事件名

`/users/list` → `users:list`（`/` 替换为 `:`）

组件可监听特定路径的变更事件：

```typescript
// 监听所有路由变化
this.routeOn('router', 'change', (ctx) => { /* ... */ });

// 监听特定路径变化
this.routeOn('router', 'change:users:list', (ctx) => { /* ... */ });
```

## 路径参数匹配

```typescript
matchPattern('/users/:id', '/users/123')  // → { id: '123' }
matchPattern('/posts/:postId/comments/:id', '/posts/5/comments/10')
// → { postId: '5', id: '10' }
```

## 路由守卫

```typescript
const router = Router.getInstance();

// 添加守卫（返回 false 阻止导航）
router.addGuard((from, to) => {
    if (!isAuthenticated() && to.startsWith('/admin')) {
        return false;  // 阻止未认证用户访问管理页面
    }
    return true;
});
```

## 参见

- [事件系统](./event-system.md)