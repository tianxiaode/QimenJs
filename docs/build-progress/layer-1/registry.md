# @orbitjs/registry

**层级**: 第 1 层  
**状态**: ✅ 完成  
**测试**: ✅ 通过  
**覆盖率**: ~80%

## 概述

注册器系统包，提供统一的注册器基类和管理机制。

## 功能

- **RegistrarBase** - 注册器基类
- **注册管理** - 注册、注销、获取
- **锁定机制** - 防止运行时修改
- **单例模式** - 确保唯一实例
- **Token 管理** - DomainRegistrar 提供 token 更新方法

## 核心组件

### 1. DomainRegistrar
- 管理域名配置
- 提供 `updateToken(token, ...domains)` 方法批量更新 token
- 提供 `clearToken(...domains)` 方法批量清除 token

### 2. DomainConfig
- 存储 domain 配置
- 新增 `token?: string` 字段存储 token
- 新增 `authInjector?: 'bearer' | 'basic' | ((context) => void)` 字段配置注入方式

## 依赖

```typescript
dependencies: {
  '@orbitjs/error': 'L0'
}
```

## 测试状态

### 通过的测试
- ✅ 所有测试通过
- ✅ 代码覆盖率 ~80%

## 已知问题

无

## 遗留工作

无
