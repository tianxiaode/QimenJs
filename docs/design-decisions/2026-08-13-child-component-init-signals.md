# 子组件递归创建的异步派发设计

> 日期：2026-08-13

## 1. 背景

QimenJs 采用模板模式 + 骨架占位渲染。父组件根据 LayoutNode 递归创建子组件时，若采用同步递归或逐层 `await` 的异步递归，会导致：

- **同步递归**：父组件被阻塞，必须等最深层子组件实例化完才能继续自己的后续初始化，深层组件树形成长同步栈。
- **异步递归（逐层 await）**：虽不阻塞主线程，但逻辑依赖链不变——父的完成时刻仍取决于最深层子组件，与同步在「何时可用」上无本质区别。

骨架模式下，子组件位置先有骨架占位，子组件创建完即替换骨架。因此父组件的「显示」不依赖子树内容就绪，只需骨架先出，子树渐进式填充。

## 2. 问题

递归创建子组件时，需要打破「父等子、子等子的子」的同步阻塞链，使父组件在**派发**子组件创建后即可继续自己的后续初始化，不等子树构建完成。同时，父组件需要感知每个子组件的就绪时机，以便执行依赖该子组件的工作。

## 3. 决策：双 callback + setTimeout(0) 异步派发

### 3.1 模板 el 生成无需信号

`new ChildComponent(props)` 是同步操作，子组件实例化时模板 el 随即生成。父组件 `new` 之后直接拿到 `child.el` 替换骨架，无需子组件回调通知——同步操作没有「等待」问题。

### 3.2 两个 callback

| callback | 触发时机 | 语义 | 父组件放什么工作 |
|----------|---------|------|-----------------|
| `onChildrenDispatched` | `setTimeout(0)` 调度后立即同步调用 | 子已派发创建其子的请求，递归链已铺开 | 不依赖子树的工作（绑自己的事件、跑自己的 init） |
| `onChildReady(name, type)` | 每个子组件 mount 完即逐个调用 | 某个子组件已就绪 | 依赖该子组件的工作（按 name/type 分发处理） |

### 3.3 为何用 name/type 逐个通知而非计数聚合

- **不需要计数器**：每个子就绪就通知，无需聚合所有子就绪。
- **渐进式**：哪个子先好就先处理，不用等最慢的。
- **不怕单个失败**：一个子挂了不影响其他子的 ready 通知（计数模式下会卡死）。
- **细粒度**：父可按 `type` 做通用处理、按 `name` 做特定处理。

name 和 type 来源于 NodeMeta：遍历 NodeMeta 时，有 `type` 和 `name` 的节点才 `new`，callback 直接返回这两个字段，无需额外构造。

## 4. 实现流程

### 4.1 整体流程

```
父 new ChildComponent(props)          // 同步，子实例 + 模板 el 就绪
父用 child.el 替换骨架                  // 同步，用户立即看到子的真实模板结构
父调用 child.createChildren({          // 触发子创建其子
  onChildrenDispatched: () => {        // 子已派发创建，递归链已铺开
    // 父继续不依赖子树的工作
  },
  onChildReady: (name, type) => {      // 某个子就绪
    // 父根据 name/type 执行依赖该子的工作
  }
})
```

### 4.2 createChildren 内部实现

`createChildren` 用 `setTimeout(..., 0)` 将递归创建推到下一个事件循环，**立即**调用 `onChildrenDispatched`，不等 setTimeout 内的创建完成。setTimeout 内遍历 NodeMeta，有 `type` 和 `name` 的节点才 `new`，`new` + mount 完即调用 `onChildReady(name, type)`：

```typescript
/**
 * 异步派发创建子组件。
 * - 立即通过 onChildrenDispatched 通知父组件已派发（同步调用）。
 * - 每个子组件 mount 完后通过 onChildReady(name, type) 逐个通知父组件。
 * 子组件的实际创建在下一个事件循环执行，不阻塞父组件。
 *
 * @param callbacks - 回调对象
 * @param callbacks.onChildrenDispatched - 子组件创建已派发的通知回调
 * @param callbacks.onChildReady - 某个子组件就绪的通知回调，返回 name 和 type
 */
createChildren(callbacks: {
    onChildrenDispatched: () => void;
    onChildReady: (name: string, type: string) => void;
}): void {
    setTimeout(() => {
        for (const nodeMeta of this.nodeMetas) {
            if (!nodeMeta.type || !nodeMeta.name) continue;

            const child = new ChildComponent(nodeMeta);
            child.mount(this.el);
            callbacks.onChildReady(nodeMeta.name, nodeMeta.type);

            child.createChildren({
                onChildrenDispatched: () => {},
                onChildReady: (name, type) => { callbacks.onChildReady(name, type); }
            });
        }
    }, 0);

    callbacks.onChildrenDispatched();
}
```

关键点：
- `setTimeout(..., 0)` 把 for 循环创建子的子推到下一个 tick，异步执行。
- `callbacks.onChildrenDispatched()` **同步立即调用**，在 setTimeout 调度后、返回前执行。
- 每个子 `new` + `mount` 完即 `callbacks.onChildReady(name, type)`，逐个通知，不等其他子。
- `onChildReady` 透传向上冒泡，父组件能收到任意层级子组件的就绪通知。

### 4.3 用户可见的渐进过程

```
骨架 → 子的真实模板壳 → 子的子逐个填充 → ... → 完整页面
```

每步都有可见反馈，不会长时间空白。

## 5. 设计要点

### 5.1 为何 templateReady 不需要信号

`new` + 模板 el 生成是同步轻量操作，父直接拿到 el 替换骨架。信号只用于异步协调，同步操作无需信号。

### 5.2 onChildrenDispatched 的语义边界

`onChildrenDispatched` 表示「已发起创建子的请求」，**不保证子的子已就绪**。父组件收到此信号后，不应依赖子的子状态，只应推进不依赖子树的工作。子的子在 setTimeout 调度的下一个 tick 各自异步推进，完成后各自替换其骨架。

### 5.3 onChildReady 的逐个通知模式

`onChildReady(name, type)` 在每个子组件 mount 完后**逐个触发**，非聚合所有子就绪。父组件根据 `name` 和 `type` 分发处理：

- 按 `type`：对某类组件做通用处理（如所有 `button` 类型绑定点击事件）。
- 按 `name`：对特定组件做专属处理（如 `header` 子组件就绪后刷新标题）。

此模式假设父的依赖子树的工作能**按子拆分**。若存在「必须等所有子都就绪」的工作（如布局计算需要所有子尺寸），需额外聚合。

### 5.4 setTimeout(0) 的作用

`setTimeout(fn, 0)` 将递归创建推到下一个事件循环 tick，使 `createChildren` 调用能同步返回并立即触发 `onChildrenDispatched`。这把「深度递归的同步创建」变成「广度铺开 + 异步推进」，父组件不被阻塞。

### 5.5 父组件后续流程的依赖前提

此设计成立的前提：父组件的后续初始化不依赖子树内容就绪，只依赖骨架占位。骨架模式天然满足此前提——骨架已占位，用户不会看到空白，父可安全推进。

### 5.6 递归链的并行性

父组件的后续初始化与子树的递归构建是**并行**的，非串行阻塞：

- 父收到 `onChildrenDispatched` 后立即推进自己的后续初始化。
- 子树在后续 tick 中异步构建，每个子组件 mount 完即通过 `onChildReady` 通知父，替换对应骨架。

## 6. 总结

| 环节 | 方式 | callback |
|------|------|----------|
| 子模板 el 生成 | `new` 同步 | 无，父直接拿 el |
| 子派发创建其子 | `setTimeout(0)` 异步调度 | `onChildrenDispatched`（同步立即调用） |
| 某个子就绪 | `new` + mount 完逐个通知 | `onChildReady(name, type)` |
| 父后续初始化 | 收到 callback 后执行 | 父自身状态，无需 callback |

核心：同步操作直接进行，异步递归创建用 `setTimeout(0)` 派发 + callback 协调。`onChildrenDispatched` 让父不被阻塞，`onChildReady(name, type)` 让父按子逐个处理，无需计数聚合。
