# @orbitjs/error

**层级**: 第 0 层  
**状态**: ✅ 完成  
**测试**: ✅ 通过  
**覆盖率**: 100%

## 概述

错误处理包，提供统一的错误类型和错误处理机制。

## 功能

- **OrbitError** - 基础错误类
- **错误类型定义** - 各种错误类型
- **错误工具函数** - 错误处理工具

## 依赖

零依赖

## 使用示例

```typescript
import { OrbitError } from '@orbitjs/error';

throw new OrbitError('Something went wrong');
```

## API

```typescript
class OrbitError extends Error {
    constructor(message: string, code?: string);
    readonly code?: string;
}
```

## 测试状态

- ✅ 20 个测试全部通过
- ✅ 代码覆盖率 100%

## 变更历史

### 初始版本
- 实现基础错误类
- 定义错误类型
