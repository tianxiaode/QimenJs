# @qimenjs/validation

**层级**: 第 2 层  
**状态**: ✅ 完成  
**测试**: ✅ 通过  
**覆盖率**: ~85%

## 概述

验证系统包，提供数据验证功能。

## 功能

- **doValidate** - 验证执行函数
- **ValidationExecutor** - 验证执行器
- **验证规则** - 规则定义和执行

## 依赖

```typescript
dependencies: {
  '@qimenjs/error': 'L0',
  '@qimenjs/pipeline': 'L1'
}
```

## 设计原则

遵循[边界与防御原则](../principles/boundary-defense.md)：
- validation 是唯一的输入校验层
- 负责 unknown → 已知类型
- 所有非法输入处理

## 使用示例

```typescript
import { doValidate } from '@qimenjs/validation';

const result = await doValidate(value, rule);
if (!result.success) {
    console.error(result.error);
}
```

## API

```typescript
function doValidate(value: any, rule: ValidationRule): Promise<ValidationResult>;

interface ValidationResult {
    success: boolean;
    value?: any;
    error?: ValidationError;
}
```

## 测试状态

- ✅ 所有测试通过
- ✅ 代码覆盖率 ~85%

## 变更历史

### 重构版本
- 使用统一 pipeline 执行器
- 简化验证逻辑
- 添加统计和报告功能
