# @qimenjs/component-core

**层级**: UI 层  
**状态**: ⚠️ 开发中  
**测试**: ✅ 14 suites / 69 tests  
**覆盖率**: ~82%

## 构建历史

### 2026-07-19
- ✅ 子节点属性自动构建（child-node-props.ts）：contentMode→属性映射、通用属性、组件子节点 $name + 属性转发、i18n 节点特殊处理
- ✅ template-constants.ts 常量集中管理（CONTENT_MODE_MAP/COMMON_NODE_PROPS/RESERVED_KEYS/ANIMATION_PRESETS）
- ✅ template-compiler.ts i18nNodes 编译时收集，applyBody init 字段存 ctor._key
- ✅ template-init.ts i18n 初始化 + localeChange 事件绑定 + 进入动画播放 + 拖拽初始化
- ✅ AnimationAbility 声明式动画（playEnter/playLeave，纯 getter 读 ctor._animation）
- ✅ DragAbility 声明式拖拽（move 本地处理，start/end 走 DragEventBus）
- ✅ NodePropAbility._updateNode hidden 动画通过 _state 对比 + playEnter/playLeave
- ✅ LifecycleAbility 组件生命周期事件能力（mounted/updated/resize 事件发送）
- ✅ COMPONENT_LIFECYCLE_EVENTS 常量（init/mounted/beforeunmount/dispose/updated/resize/hiddenchange）
- ✅ 组件生命周期事件发送：初始化→init、挂载→mounted、卸载→beforeunmount、销毁→dispose、更新→updated、尺寸变化→resize、hidden变化→hiddenchange
- ✅ 有 eventKey 时自动发送桥接事件（bridgeEmit）
- ✅ class-copy.ts copyPrototypeMethods 跳过目标已有方法
- ✅ 包入口 index.ts 完全重写，只导出当前实际存在的模块
- ✅ 14 个测试套件全部通过（69 tests）
- ✅ 删除 11 个过时的旧测试文件 + 19 个 .bak 文件

### 2026-07-18
- ✅ 新增 ToggleComponent 切换按钮（pressed 态 + aria-pressed）
- ✅ 新增 ToggleIconComponent 图标切换（onIcon/offIcon 双图标）
- ✅ 新增 ButtonGroupComponent 按钮组（单选/多选，继承 ItemGroup）
- ✅ 新增 AvatarComponent 头像（图片/文字/图标，圆形裁切）
- ✅ 新增 CardComponent 卡片（HeaderComponent + body + footer）
- ✅ 新增 IndicatorComponent 指示器（dot/number/dash，继承 ItemGroup）
- ✅ 新增 TabBarComponent 标签栏（继承 ItemGroup，可独立使用）
- ✅ 新增 TabsComponent 标签页（TabBar + 内容区，content 支持 HTML/type/类）
- ✅ 新增 DropdownComponent 下拉按钮（Button 语义别名）
- ✅ ItemGroup 内置溢出处理（overflowMode + OverflowScrollAbility/OverflowMenuAbility）
- ✅ ToolbarComponent 改为 ItemGroup 语义别名
- ✅ Indicator 从手动 DOM 改为继承 ItemGroupComponent
- ✅ 全部新增组件 Metro 风格 CSS

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

### 通过的测试（14 suites / 69 tests）
- ✅ template-constants — 常量定义
- ✅ template-compiler — 预编译引擎
- ✅ child-node-props — 子节点属性自动构建
- ✅ class-copy — 类原型方法复制
- ✅ template-factory — 模板组件工厂 + init 事件
- ✅ NodePropAbility — 节点属性读写 + hiddenchange 事件
- ✅ EventForwardAbility — 事件转发
- ✅ CommonPropsAbility — 通用属性
- ✅ AnimationAbility — 声明式动画
- ✅ DragAbility — 拖拽能力
- ✅ LifecycleAbility — 生命周期事件
- ✅ tpl-body-def — Body 字段定义
- ✅ common-props — 属性定义
- ✅ ComponentTypes — 组件类型常量

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
