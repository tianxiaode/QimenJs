# @qimenjs/router

**层级**: 第 4 层  
**状态**: ✅  
**测试**: ✅  
**覆盖率**: ~85%

## 构建历史

### 2026-07-12
- ✅ Router 重构为纯事件模式，pathToEventName 路径转事件名
- ✅ emit source='router'，EventAbility.emit 统一入口分流
- ✅ EventScope.emit 支持 options.source 参数
- ✅ RouteAbility/RouteEmitAbility/RouteListenAbility 组件级路由能力
- ✅ 新增 Router.test.ts 单元测试

## 测试状态

### 通过的测试
- ✅ Router - 路径转事件名
- ✅ Router - 事件发射与监听
- ✅ RouteAbility - 组件路由能力

## 已知问题

无

## 遗留工作

### 低优先级
- [ ] 路由守卫/拦截器支持
- [ ] 路由参数解析

## 使用统计

### 依赖的包
- @qimenjs/events (L1)
- @qimenjs/composable (L1)

### 被以下包使用
- @qimenjs/component (UI)
- @qimenjs/component-core (UI)
