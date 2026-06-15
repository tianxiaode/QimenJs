# @orbitjs/http

**层级**: 第 3 层  
**状态**: ⚠️ 待更新  
**测试**: ⚠️ 待写  
**覆盖率**: -

## 概述

HTTP 客户端包，提供 HTTP 请求功能。

## 功能

- **HttpClient** - HTTP 客户端
- **请求/响应处理** - 请求和响应处理
- **中间件支持** - 中间件机制

## 依赖

```typescript
dependencies: {
  '@orbitjs/logger': 'L0',
  '@orbitjs/utils': 'L0',
  '@orbitjs/pipeline': 'L1',
  '@orbitjs/context': 'L0'
}
```

## 测试状态

### 待写的测试
- [ ] HttpClient 基本功能
- [ ] 请求处理
- [ ] 响应处理
- [ ] 中间件

## 已知问题

### 问题 1：需要更新
- **原因**: 需要适配新的 context 包
- **影响**: 功能可能不完整
- **解决方案**: 更新以使用 RequestContext
- **优先级**: 高

## 遗留工作

- [ ] 更新以使用新的 context 包
- [ ] 编写单元测试
- [ ] 完善文档
