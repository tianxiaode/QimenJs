# @qimenjs/imperative

**层级**: UI 层  
**状态**: ✅  
**测试**: ✅  
**覆盖率**: ~83%

## 构建历史

### 2026-07-12
- ✅ 重构：Toast/Msgbox 拆分为独立实例类 + Manager 调度器
- ✅ ToastManager 只管队列调度和堆叠定位
- ✅ MsgboxManager 只管创建/销毁调度
- ✅ Toast/Msgbox 使用 ComposableBase.with() 组合能力
- ✅ ToastOptions/MsgboxOptions 新增 eventKey 字段
- ✅ 新增 19 个单元测试

## 测试状态

### 通过的测试
- ✅ Toast - 创建/显示/关闭
- ✅ Msgbox - alert/confirm/prompt
- ✅ ToastManager - 队列调度
- ✅ MsgboxManager - 创建/销毁

## 使用统计

### 依赖的包
- @qimenjs/composable (L1)
- @qimenjs/events (L1)
- @qimenjs/component-core (UI)
- @qimenjs/component-abilities (UI)

### 被以下包使用
- 应用层直接使用
