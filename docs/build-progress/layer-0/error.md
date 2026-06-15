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

```typescript
dependencies: {}  // 零依赖
```

## 目录结构

```
src/error/
├── OrbitError.ts
├── types.ts
└── index.ts
```

## 使用示例

```typescript
import { OrbitError } from '@orbitjs/error';

throw new OrbitError('Something went wrong');
```

## 测试状态

### 通过的测试
- ✅ 所有测试通过（20 个测试）
- ✅ 代码覆盖率 100%

## 已知问题

无

## 遗留工作

无

## 参考资料

- [边界与防御原则](../../architecture/principles/boundary-defense.md)
