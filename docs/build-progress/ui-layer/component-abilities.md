# @qimenjs/component-abilities

**层级**: UI 层  
**状态**: ⚠️ 开发中  
**测试**: ✅  
**覆盖率**: ~80%

## 构建历史

### 2026-07-13
- ✅ 新增 GroupSelectAbility（radio 互斥/checkbox 多选）
- ✅ 新增 MenuItemManageAbility（池化复用菜单项）
- ✅ OverlayHostAbility 改为从 component-core 重导出

### 2026-07-12
- ✅ 新增 ChildSlotAbility 子组件插槽替换能力
- ✅ 新增 FloatingLayerAbility 浮层通用能力
- ✅ 新增 TemplateCacheAbility 模板缓存与快速克隆
- ✅ 新增 OverflowScrollAbility/OverflowMenuAbility 溢出处理
- ✅ 新增 ArrowAbility/ExpandArrowAbility 箭头能力
- ✅ 新增 TooltipOverlayAbility/OverlayMaskAbility 浮层能力

## 测试状态

### 通过的测试
- ✅ GroupSelectAbility - 分组选择
- ✅ MenuItemManageAbility - 菜单项管理
- ✅ ChildSlotAbility - 插槽替换
- ✅ OverflowScrollAbility - 溢出滚动
- ✅ OverflowMenuAbility - 溢出菜单

## 遗留工作

### 中优先级
- [ ] 补充 FloatingLayerAbility 测试
- [ ] 补充 TemplateCacheAbility 测试

## 使用统计

### 依赖的包
- @qimenjs/composable (L1)
- @qimenjs/component-core (UI)

### 被以下包使用
- @qimenjs/component (UI)
