# @orbitjs/entity

**层级**: 第 4 层  
**状态**: ⚠️ 待更新  
**测试**: ⚠️ 待写  
**覆盖率**: -

## 概述

实体管理包，提供实体管理功能。

## 功能

- **manager** - 实体管理器
- **state** - 实体状态
- **schema** - 实体模式
- **actions** - 实体动作处理器
- **abilities** - 实体相关能力

## 依赖

```typescript
dependencies: {
  '@orbitjs/composable': 'L1',
  '@orbitjs/http': 'L3',
  '@orbitjs/system-abilities': 'L3',
  '@orbitjs/events': 'L1',
  '@orbitjs/cache': 'L1',
  '@orbitjs/registry': 'L1',
  '@orbitjs/async': 'L0',
  '@orbitjs/context': 'L0'
}
```

## 测试状态

### 待写的测试
- [ ] 实体管理器测试
- [ ] 状态管理测试
- [ ] 动作处理测试

## 已知问题

### 问题 1：需要更新
- **原因**: 依赖的包正在重构
- **影响**: 功能可能不完整
- **解决方案**: 等待依赖包更新完成
- **优先级**: 高

## 遗留工作

- [ ] 等待依赖包更新完成
- [ ] 编写单元测试
- [ ] 完善文档
