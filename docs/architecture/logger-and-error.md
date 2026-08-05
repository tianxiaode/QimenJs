# 日志与错误处理

> QimenJS 提供统一的日志系统（Logger）和结构化错误体系（ErrorBase），日志自动关联类名，错误码与 i18n 联动实现多语言错误消息。

## 日志系统

### 架构

```
Logger (根记录器)
  → LoggerChild (子记录器, Logger.for(target) 创建)
  → consoleSink (输出到控制台)
```

### 使用方式

```typescript
import { Logger } from '@qimenjs/logger';

// 获取子记录器（每个目标只有一个实例）
const logger = Logger.for('MyService');     // 字符串标识
const logger = Logger.for(MyComponent);     // 类构造函数

// 记录日志
logger.debug('Debug message');
logger.info('Info message');
logger.warn('Warning');
logger.error('Error occurred', error);
```

### 级别过滤

```typescript
// 默认级别 'info'，低于此级别不输出
Logger.setOptions({ level: 'debug' });  // 输出所有级别
```

| 级别 | 数值 | 说明 |
|------|------|------|
| debug | 0 | 调试信息 |
| info | 1 | 一般信息（默认） |
| warn | 2 | 警告 |
| error | 3 | 错误 |

### ComposableBase 自动日志

`ComposableBase` 构造时自动创建 `logger` 属性：

```typescript
class MyManager extends ComposableBase {
    doSomething() {
        this.logger.info('Doing something');  // 自动关联类名
    }
}
```

### 格式化

```
[2026-08-05T10:30:00.000Z] [INFO] [MyService] Doing something
```

统一格式，支持颜色（浏览器环境）。

## 错误处理体系

### 错误层次

```
Error
  └── ErrorBase (抽象)           ← code + timestamp + context + toJSON/toString
        ├── KernelError           ← 内核错误（使用 KernelErrorCode）
        ├── ComponentError        ← 组件错误
        ├── GestureError          ← 手势错误
        └── WorkerError           ← Worker 错误
              └── WorkerInitializationError
```

### ErrorBase 标准接口

```typescript
abstract class ErrorBase extends Error {
    readonly code: string | number;           // 错误代码
    readonly timestamp: Date;                 // 发生时间
    readonly context?: Record<string, any>;   // 上下文数据

    toJSON(): { name, message, code, stack, timestamp, context };
    toString(): `[KernelError] (ENTITY_NOT_FOUND) 未找到指定的实体 {"entityKey":"user"}`;
}
```

### KernelErrorCode 分类

| 分类 | 错误码 |
|------|--------|
| 实体操作 | ENTITY_OPERATION_IN_PROGRESS, ENTITY_FETCH_FAILED, ENTITY_NOT_FOUND, ENTITY_FETCH_TIMEOUT, ENTITY_FETCH_CANCELLED, ENTITY_PERMISSION_DENIED |
| 分页 | INVALID_PAGE_SIZE |
| 组合 | COMPOSABLE_NOT_FOUND, CIRCULAR_DEPENDENCY |
| 流式 | STREAM_REQUEST_FAILED |
| 手势 | GESTURE_RECOGNITION_ERROR, GESTURE_DISTANCE_INSUFFICIENT |
| Schema | SCHEMA_NOT_FOUND, SCHEMA_REGISTRATION_FAILED |
| 组件 | COMPONENT_TPL_KEY_NOT_FOUND, COMPONENT_BODY_INVALID_FIELD, COMPONENT_INIT_FAILED |
| 文件 | FILE_SIZE_EXCEEDED, FILE_HASH_FAILED, FILE_UPLOAD_FAILED, FILE_TYPE_MISMATCH, FILE_DOWNLOAD_FAILED |
| 初始化 | COMPILE_PRODUCT_NOT_FOUND, NODE_MAP_BUILD_FAILED, OVERRIDE_QUEUE_ERROR, CHILD_INSTANTIATE_FAILED, PHASE_EXECUTION_FAILED |

### 错误码与 i18n 联动

```typescript
// t(code, isError=true) 自动从三个命名空间查找翻译
t('ENTITY_NOT_FOUND', true);
// 查找顺序：
// 1. kernel.ENTITY_NOT_FOUND  → '未找到指定的实体'
// 2. validation.ENTITY_NOT_FOUND
// 3. http.ENTITY_NOT_FOUND
```

### 组件错误处理链

```
Entity 请求失败
  → KernelError { code, context }
  → EntityEventBus.emit('entity:error')
  → ComponentEntityDispatch → onEntityError(ctx, domain)
  → onBeforeEntityError?.()  // 返回 false 可阻止
  → defaultEntityErrorHandler(ctx, domain)  // 全局默认处理
  → onAfterEntityError?.()
```

**全局覆盖**：

```typescript
Component.setDefaultHandler({
    error: (ctx, domain) => {
        showToast(t(ctx.error.code, true));  // i18n 翻译错误码
    },
});
```

## 参见

- [i18n 国际化系统](./i18n-system.md)
- [实体管理与权限系统](./entity-and-permission.md)