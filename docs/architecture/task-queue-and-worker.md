# 任务队列与 Worker

> QimenJS 提供全局任务队列（GlobalTaskQueue）和 Worker 管理器，用于异步任务调度和 CPU 密集型计算的线程分离。

## 全局任务队列（GlobalTaskQueue）

单例模式，管理异步任务的优先级调度：

```typescript
import { globalTaskQueue } from '@qimenjs/task';

globalTaskQueue.addTask(
    async () => fetch('/api/data'),  // 任务函数
    'HIGH',       // 优先级：HIGH / NORMAL / LOW
    3,            // 最大重试次数
    1000,         // 重试延迟(ms)
    true,         // 是否轮询
    5000          // 轮询间隔(ms)
);
```

### 特性

| 特性 | 说明 |
|------|------|
| **优先级排序** | HIGH=1 > NORMAL=2 > LOW=3，高优先级任务先执行 |
| **最大并发** | 默认 5，可配置 |
| **重试机制** | 失败后延迟重新入队，最多重试 maxRetries 次 |
| **轮询任务** | 成功后按 interval 继续入队，适用于定期刷新 |

### 组件实例化中的应用

子组件通过 `GlobalTaskQueue` 队列化创建，避免阻塞主线程：

```
Phase 2 INSTANTIATE:
  instantiateChildComponents
    → GlobalTaskQueue.addTask(() => new ChildComponent(props), 'NORMAL')
    → 逐个创建，不阻塞
```

## Worker 管理

### WorkerManagerBase → SimpleWorkerManager

```typescript
import { SimpleWorkerManager } from '@qimenjs/task';

const worker = new SimpleWorkerManager('/workers/hash.js', {
    onMessage: (event) => { /* 处理结果 */ },
    onError: (error) => { /* 处理错误 */ },
});
```

**配置优于继承**：通过 `WorkerManagerOptions` 回调函数配置，而非子类化。

### HashTask 子系统

完整的文件哈希计算方案：

| 组件 | 作用 |
|------|------|
| WorkerPool | Worker 池管理（Browser/Default 两种实现） |
| WorkerHandle | 单个 Worker 的句柄和通信 |
| HashTaskRunner | 哈希任务编排 |
| StreamChunkProvider | 流式分块提供器 |
| BrowserFileChunkProvider | 浏览器文件分块提供器 |
| HashTaskHealthMonitor | 健康监控 |

## 参见

- [组件编译引擎与模板系统](./compile-engine-and-template.md)