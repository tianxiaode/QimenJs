# @orbitjs/utils

**层级**: 第 0 层  
**状态**: ✅ 完成  
**测试**: ✅ 通过  
**覆盖率**: ~95%

## 概述

工具函数包，提供常用的工具函数。

## 功能

- **string** - 字符串工具
- **array** - 数组工具
- **object** - 对象工具
- **function** - 函数工具

## 依赖

零依赖

## 设计原则

遵循[边界与防御原则](../principles/boundary-defense.md)：
- utils 不做输入校验
- 假定输入已经合法
- 类型即契约

## 使用示例

```typescript
import { string, array } from '@orbitjs/utils';

const trimmed = string.trim('  hello  ');
const cloned = array.clone([1, 2, 3]);
```

## 测试状态

- ✅ 606 个测试全部通过
- ✅ 代码覆盖率 ~95%

## 变更历史

### 初始版本
- 实现各种工具函数
- 遵循边界与防御原则
