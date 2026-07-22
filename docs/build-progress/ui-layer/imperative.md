# @qimenjs/imperative

**层级**: UI 层  
**状态**: ✅  
**测试**: ✅  
**覆盖率**: ~83%

## 构建历史

### 2026-07-22
- ✅ 修复 MsgboxManager 内存泄漏：instance.onClose 回调删除 Set 条目
- ✅ 修复 Msgbox resolve 无保障：_doResolve 防重复 + close() 兜底 cancel
- ✅ 修复 Msgbox 遮罩不可点击：alert 类型遮罩绑定 tap 事件关闭
- ✅ 修复 Toast 私有属性访问：ToastHandleImpl 加 isClosed getter 替代 _closed 直接访问
- ✅ 修复 index.ts 泄露内部类：移除 ToastHandleImpl 导出

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
