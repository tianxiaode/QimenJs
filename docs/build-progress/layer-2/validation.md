# @orbit-js/validation

**层级**: 第 2 层  
**状态**: ✅ 完成  
**测试**: ✅ 通过  
**覆盖率**: 81.84%（分支）

## 概述

验证系统包，提供数据验证功能。

## 功能

- **doValidate** - 验证执行函数
- **ValidationExecutor** - 验证执行器
- **验证规则** - 规则定义和执行
- **错误处理** - 验证错误处理

## 依赖

```typescript
dependencies: {
  '@orbit-js/error': 'L0',
  '@orbit-js/pipeline': 'L1'
}
```

## 测试状态

### 通过的测试
- ✅ 所有测试通过
- ✅ 代码覆盖率 ~85%

## 已知问题

无

## 遗留工作

无

## 设计原则

遵循[边界与防御原则](../../architecture/principles/boundary-defense.md)：
- validation 是唯一的输入校验层
- 负责 unknown → 已知类型
- 所有非法输入处理
