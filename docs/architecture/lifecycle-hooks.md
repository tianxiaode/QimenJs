# 钩子函数体系

> QimenJS 的钩子函数贯穿组件的完整生命周期，从初始化到销毁，每个阶段提供可覆写的钩子入口。

## 概述

钩子函数分为两大类：

1. **组件生命周期钩子**：定义在 `body` 中，通过 `LifecycleAbility` 和编译管线触发
2. **ComposableBase 生命周期钩子**：`onBeforeDispose`/`onDisposed`，由 `dispose()` 触发

## 完整钩子列表

### 初始化阶段

| 钩子 | 触发时机 | 作用 | 参数 |
|------|---------|------|------|
| `onBeforeInit` | Phase 1 MOUNT 最后，模板注入后、事件绑定前 | 初始化前逻辑，此时 el 已创建但事件未绑定 | `props?: ComponentProps` |
| `onAfterInit` | Phase 3 FINALIZE 最后，所有事件/权限绑定完成后 | 初始化完成，可安全使用所有能力 | `props?: ComponentProps` |
| `onMounted` | 组件 ready 后 | DOM 已渲染，可访问 el 和 nodeMap | 无 |

### 运行时阶段

| 钩子 | 触发时机 | 作用 | 参数 |
|------|---------|------|------|
| `onUpdated` | 属性或内容变更后 | 更新后逻辑 | `data?: any` |
| `onResize` | 元素尺寸变化时 | 响应式布局调整 | `entry: ResizeObserverEntry` |
| `onLocaleChange` | 语言切换时 | 重新翻译 i18n 内容 | 无 |
| `onPermissionChange` | 权限变更时 | 响应权限变化 | `data?: any` |

### 实体操作钩子

| 钩子 | 触发时机 | 作用 | 参数 |
|------|---------|------|------|
| `onBeforeEntityError` | 实体错误处理前 | 返回 false 可阻止默认错误处理 | 无 |
| `onAfterEntityError` | 实体错误处理后 | 错误处理完成后的逻辑 | 无 |
| `onBeforeEntityLoading` | 实体加载处理前 | 返回 false 可阻止默认 loading 处理 | 无 |
| `onAfterEntityLoading` | 实体加载处理后 | loading 处理完成后的逻辑 | 无 |

### 销毁阶段

| 钩子 | 触发时机 | 作用 | 参数 |
|------|---------|------|------|
| `onBeforeUnmount` | `onBeforeDispose` 中调用 | 组件即将从 DOM 移除 | 无 |
| `onBeforeDispose` | `dispose()` 首步 | 组件清理的入口，可覆写 | 无 |
| `onDisposed` | `dispose()` 末步 | 内部清理完成通知（不可覆写） | 无 |

## 执行顺序

### 初始化

```
new Component(props)
  → constructor → init()
    → Phase 1 MOUNT:
        ensureNodeMap → selfMount → setupNodeProps → onBeforeInit(props)
    → Phase 2 INSTANTIATE:
        instantiateChildComponents (异步)
    → Phase 3 FINALIZE:
        bindListens → bindChildEvents → bindDomEvents → bindPermission → onAfterInit(props)
    → finally: _flushNodeProps + _commitFloats + _commitDrags + _commitDrops
  → ready Promise resolve
  → _emitMounted() → onMounted() + emit('mounted')
```

### 运行时

```
属性/内容变更 → onUpdated() + emit('updated')
元素尺寸变化 → onResize(entry) + emit('resize')
语言切换     → onLocaleChange()
权限变更     → onPermissionChange(data)
```

### 销毁

```
dispose()
  → onBeforeDispose()
    → onBeforeUnmount()           // 组件即将从 DOM 移除
    → emit('beforeUnmount')
    → restoreSkeleton(slotName)   // 非容器组件恢复父占位骨架
    → _disposeChildComponents()   // 销毁所有子组件
    → el.remove()                 // 从 DOM 移除
    → 清理 meta/props/dirtyNodes
  → onCleanup (LIFO 逆序)        // 执行所有注册的清理回调
  → abilityState.cancel()         // 自动取消有 cancel() 的状态对象
  → onDisposed()                  // 内部清理完成
    → emit('dispose')
```

## 关键约束

- `onDisposed` 不暴露给组件 body，销毁由框架内部保证执行，不可覆写
- 组件清理逻辑统一放在 `onBeforeDispose` 中
- `onResize` 只有定义了此方法才自动绑定 `ResizeObserver`，否则不绑（性能优化）
- `onBeforeInit` 接收 `props` 参数，此时可修改 props 影响后续初始化
- 实体操作钩子（`onBeforeEntityError` 等）返回 `false` 可阻止默认处理

## 使用示例

```typescript
class MyComponent extends Component {
    onBeforeInit(props) {
        // el 已创建，事件未绑定
        this.logger.info('Initializing', props);
    }

    onAfterInit(props) {
        // 所有能力已就绪
        this.loadData();
    }

    onMounted() {
        // DOM 已渲染
        this.setupResizeObserver();
    }

    onResize(entry) {
        // 响应式布局调整
        this.adjustLayout(entry.contentRect);
    }

    onBeforeEntityError() {
        // 返回 false 阻止默认 toast 错误提示
        return false;
    }

    onBeforeDispose() {
        // 清理自定义资源
        this.cleanup();
    }
}
```

## 参见

- [ComposableBase 能力模式](./composable-ability-pattern.md)
- [组件编译引擎与模板系统](./compile-engine-and-template.md)
- [实体管理与权限系统](./entity-and-permission.md)