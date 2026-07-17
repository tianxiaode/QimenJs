# @qimenjs/component-core

**层级**: UI 层  
**状态**: ⚠️ 开发中  
**测试**: ✅  
**覆盖率**: ~82%

## 构建历史

### 2026-07-17
- ✅ 新增 body.forwards 属性/方法透传机制（替代 TplNode.forward，支持深层路径）
- ✅ TemplateAbility 新增 _setupForwards/_resolveForwardPath/_setupPropertyForward/_setupComponentForward/_forwardAutoProps/_proxyComponentMethods
- ✅ TemplateComponent.withTemplate body 处理新增 forwards 特殊 key（存为 _forwards 静态属性）
- ✅ 命名冲突检测排除 forwards 特殊 key

### 2026-07-16
- ✅ 新增 common-props.ts 通用属性定义（14 个属性 + 值转换器 + MarginPadding/Border 类型）
- ✅ content-properties.ts v2 模式重构（三层属性生成：组件自身 / DOM 子节点 / 组件子节点）
- ✅ nodeMap 改为一级结构（nodeMap[name] 替代 nodeMap[group][name]）
- ✅ NodeMetadata 移除 group 字段
- ✅ body 新增 bridges 属性支持（映射为 eventBridge 静态属性）
- ✅ 编译时命名冲突检测
- ✅ 恢复误删的 BadgeAbility 和 TooltipAbility
- ✅ 删除 12 个纯赋值能力（Position*/Style/Accessibility/Permission/Theme/ColorVariant）

### 2026-07-14
- ✅ EventBridgeAbility 重命名为 EventBridgeConfigAbility
- ✅ 新版模板格式 template-types.ts（TplNode/ComponentTemplate）
- ✅ template-json.ts 新增 convertTemplate() 支持 ComponentTemplate → HTML
- ✅ template-compiler.ts 新增 BridgeEventTemplate/parseBridgeEventAttr/data-bridge
- ✅ parseEventAttr 支持 ?debbounce=N/?throttle=N 修饰符
- ✅ TemplateAbility 新增 bindBridgeEvents() 方法
- ✅ 模板预设全量迁移到 ComponentTemplate 格式

### 2026-07-12
- ✅ 新增 LayoutAbility 布局能力
- ✅ 新增 BadgeAbility 角标能力
- ✅ 新增 DragAbility/DropAbility
- ✅ 新增 ColorVariantAbility
- ✅ 新增 TooltipAbility（从 OverlayAbility 拆分）
- ✅ OverlayHostAbility 从 component-abilities 迁回
- ✅ template-compiler.ts/template-json.ts/template-presets.ts 从 template 包迁入
- ✅ content-properties.ts 统一内容属性生成

## 测试状态

### 通过的测试
- ✅ TemplateComponent - withTemplate 三格式支持
- ✅ template-compiler - 预编译引擎
- ✅ template-json - JSON模板转换
- ✅ LayoutAbility - 布局能力
- ✅ BadgeAbility - 角标能力
- ✅ InitAbility - 初始化流程
- ✅ OverlayAbility - 浮层管理
- ✅ TooltipAbility - Tooltip能力

## 已知问题

### 问题 1：build-config.json 残留配置
- **原因**: theme 模块 dependencies 为空数组但实际依赖 @qimenjs/registry 和 @qimenjs/events
- **影响**: 构建顺序可能不正确
- **优先级**: 中

## 遗留工作

### 高优先级
- [ ] 补充 TemplateAbility 边界测试
- [ ] 补充 EventBridgeConfigAbility 集成测试

### 中优先级
- [ ] 清理 build-config.json 残留配置

## 使用统计

### 依赖的包
- @qimenjs/composable (L1)
- @qimenjs/events (L1)
- @qimenjs/registry (L1)
- @qimenjs/event-dom (L2)
- @qimenjs/system-abilities (L3)

### 被以下包使用
- @qimenjs/component-abilities (UI)
- @qimenjs/component (UI)
