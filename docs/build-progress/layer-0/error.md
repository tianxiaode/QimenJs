# @qimenjs/error

**层级**: 第 0 层  
**状态**: ✅ 完成  
**测试**: ✅ 通过  
**覆盖率**: 100%

## 概述

错误处理包，提供统一的错误类型和错误处理机制。

## 功能

- **ErrorBase** - 基础错误类，支持错误代码和上下文信息
- **KernelError** - 内核错误基类，继承自 ErrorBase
- **GestureError** - 手势错误类，继承自 KernelError
- **KernelErrorCode** - 内核错误代码枚举
- **错误工具函数** - 错误处理工具

## 依赖

```typescript
dependencies: {}  // 零依赖
```

## 目录结构

```
src/error/
├── ErrorBase.ts
├── KernelError.ts
├── GestureError.ts
├── codes.ts
└── index.ts
```

## 使用示例

```typescript
import { ErrorBase, KernelError, GestureError, KernelErrorCode } from '@qimenjs/error';

// 基础错误
throw new ErrorBase('Something went wrong', 'CUSTOM_ERROR');

// 内核错误
throw new KernelError('Operation failed', KernelErrorCode.ENTITY_NOT_FOUND, {
    entityId: '123'
});

// 手势错误
throw new GestureError('Gesture recognition failed', KernelErrorCode.GESTURE_RECOGNITION_ERROR, {
    gestureType: 'swipe'
});
```

## 测试状态

### 通过的测试
- ✅ 所有测试通过
- ✅ 代码覆盖率 100%

## 构建进度

### ✅ 已完成

1. **错误类实现**
   - ✅ ErrorBase - 基础错误类
   - ✅ KernelError - 内核错误类
   - ✅ GestureError - 手势错误类

2. **错误代码**
   - ✅ KernelErrorCode 枚举
   - ✅ 包含所有内核错误代码

3. **测试**
   - ✅ 所有测试通过
   - ✅ 100% 代码覆盖率

### 📝 变更历史

#### 2026-06-26
- 从 kernel 包迁移错误类到 error 包
- 新增 KernelError 和 GestureError
- 新增 KernelErrorCode 枚举
- 保持从 ErrorBase 派生的错误类层次结构

#### 初始版本
- 实现基础错误类
- 定义错误类型

## 已知问题

无

## 遗留工作

无

## 参考资料

- [边界与防御原则](../../architecture/principles/boundary-defense.md)
