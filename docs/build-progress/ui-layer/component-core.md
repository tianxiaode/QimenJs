# @qimenjs/component-core

**层级**: UI 层  
**状态**: ⚠️ 开发中  
**测试**: ✅ 12 suites / 103 tests（含委托事件引擎 23 tests）
**覆盖率**: ~85%

## 构建历史

### 2026-07-25
- ✅ itemEvents 消融进 tplEvents.$items：统一事件声明和分发机制
  - 删除 ItemEventAction/ItemEvents 类型，新增 ItemTypeEvents
  - 删除 component-template.ts 的 itemEvents 字段
  - 删除 TemplateFactory 的 itemEvents 参数和 mergeItemEvents
  - 删除 Component 的 itemEvents 传参
- ✅ containsElement + getTargetItem 替代 childEventIndex/nodeElMap/data-cmp-id
  - TemplateComponent.containsElement(nodeName, target) 统一判断 target 所属节点
  - ItemGroupBaseComponent.getTargetItem(target) 遍历 items 定位 item
  - DelegatedEventEngine 不再预建索引，直接遍历 rules + containsElement 匹配
- ✅ keyProp 默认 'name'：编译时自动补上，支持 handler:true/emits/entities/router 动态名解析
- ✅ data 声明式数据：支持数组（共享）和对象（按事件类型区分），支持属性取值和 get 方法引用
- ✅ entities: true / router: true + keyProp：运行时从 item 取 key 值作为实体/路由名
  - TplEventAction.router 类型从 string 改为 boolean | string
  - DelegatedEventRule.router 类型从 string 改为 boolean | string
  - _dispatchRule router 分发逻辑与 entities 对齐
- ✅ 6 个组件迁移：ButtonGroup/Menu/NavItemGroup/TabBar/Accordion/InputFieldBodyComponent 从 itemEvents → tplEvents.$items
- ✅ RuntimeEngine 每个实例保证有 id：instance.id = props?.id || getId('cmp')
- ✅ _createItem 去掉 itemKey：直接用 instance.id 作为 nodeMap key
- ✅ EventDataType 新增 'handler'，修复 buildPayload 类型
- ✅ 委托事件引擎测试重写：删除旧 buildNodeElMap/buildChildEventIndex 测试，新增 $items/keyProp/entities:true/router:true 测试
- ✅ OverlayDispatchCenter/DragDispatchCenter 不需要修改（与 tplEvents 属于不同架构层）

### 2026-07-24
- ✅ 构建流程引擎化重构：utils/ → engine/，散落步骤整合为四个纯函数引擎
  - TemplateCompiler — 模板编译引擎（compile → { cache, nodeMetas }）
  - TemplateDeriver — 模板替换引擎（derive → { cache, nodeMetas }，cache 共享，nodeMetas 独立）
  - BodyMerger — Body 合并引擎（merge → newBody，纯函数不修改输入）
  - RuntimeEngine — 运行时引擎（init 统一编排 15 步管线）
- ✅ 删除 utils/ 目录（template-factory/template-compiler/template-init/template-constants/child-node-props/class-copy）
- ✅ 新增 CompiledTemplateCache 类型（只读可共享部分，与 nodeMetas 分离）
- ✅ CompiledComponentTemplate 标记 @deprecated
- ✅ TemplateComponent 新增 nodeMapMgr 字段，dispose 改为 nodeMapMgr.disposeAll()
- ✅ NodeMapManager 从 engine 导入路径更新
- ✅ 测试文件路径同步更新（utils/ → engine/）
- ✅ 委托事件引擎（DelegatedEventEngine）：DOM 事件从逐节点绑定改为组件根 el 委托模式
  - compileTplEvents — 编译 tplEvents 为 DelegatedEventRule[]
  - TemplateComponent.containsElement(nodeName, target) — 检查 target 是否在指定模板节点 DOM 范围内
  - ItemGroupBaseComponent.getTargetItem(target) — 遍历 _items 匹配 target 所属 item 组件
  - bindDelegatedEvents — 在根 el 上统一绑定委托监听器
  - handleDelegatedEvent — 事件分发：containsElement + getTargetItem 匹配 → _dispatchRule 转发
  - _dispatchRule — handler → emits(mergeEventData + ctx.domEvent) → bridges(check eventKey) → entities(check entityKey)
- ✅ ComponentTemplate 新增 tplEvents 字段（与 tpl/body 同级，含 $items 子组件事件声明）
- ✅ TemplateFactory.createInnerClass 接收 tplEvents，编译为 _delegatedEventRules
- ✅ RuntimeEngine.step_bindDomEvents 改用 DelegatedEventEngine.bindDelegatedEvents
- ✅ BodyMerger 新增 mergeTplEvents 静态方法
- ✅ Component.withTemplate 传递 tplEvents
- ✅ EventForwardAbility 完全移除（文件 + 测试 + TEMPLATE_COMPONENT_ABILITIES 引用）
- ✅ InputFieldBodyComponent 移除空的 bindDomEventBindings
- ✅ emits/bridges/entities 支持 `true` 自动推导 nodeName 作为事件名
- ✅ containsElement + getTargetItem 替代 childEventIndex/nodeElMap/data-cmp-id，分发时直接匹配
- ✅ 新增 tpl-events.ts 类型定义（TplEventAction / NodeEventDecl / TplEvents / DelegatedEventRule）
- ✅ 23 个委托事件引擎单元测试全部通过
- ✅ 全部 12 套件 / 103 测试通过

### 2026-07-23
- ✅ 双层架构重构：闭包基类（ComponentFactory）+ 内部类基类（InnerComponent）
  - ComponentFactory：纯工厂，不持有 el/nodeMap，withTemplate 编译模板生成内部类
  - InnerComponent：完整组件，拥有初始化流程/能力/el/nodeMap，是真正被实例化的组件
  - new OuterClass(props) 根据 when 条件选择内部类，直接返回内部类实例
- ✅ 多模板支持：ComponentTemplate.tpl 支持 TplNode | TplVariant[]，条件选择
  - TplVariant：{ tpl: TplNode, when?: (config) => boolean }，when 省略为兜底
  - 全部不匹配 → 抛出 ComponentError(COMPONENT_TPL_KEY_NOT_FOUND)
- ✅ 模板工厂重命名：createTemplateClass → createInnerClass, createReplaceClass → createReplaceFactory, 新增 createComponentFactory
- ✅ 新增 Component 闭包基类导出（component-core/index.ts）
- ✅ 新增 TplVariant 类型导出
- ✅ 新增错误码：COMPONENT_TPL_KEY_NOT_FOUND, COMPONENT_BODY_INVALID_FIELD
- ✅ tpl-node-def.ts / tpl-body-def.ts / component-template.ts 注释全面更新为双层架构
- ✅ TemplateComponent 改为 extends ComposableBase + withAbilities 注入能力
  - 新增 interface TemplateComponent 声明合并（InferAbility 逐能力提取公共签名）
  - 生命周期钩子声明为可选方法（onBeforeUnmount/onAfterInit/onBeforeInit/onMounted/onUpdated/onResize/onInitState/onLocaleChange）
  - dispose 拆分为 onBeforeDispose + onDisposed 两个钩子
- ✅ 模板工厂从闭包函数改为 class extends 继承
  - createInnerClass: class extends ParentClass，编译模板 + withAbilities + attachStaticMethods
  - createAbilityInnerClass: class extends ParentInner，withAbilities 附加额外能力
  - createDerivedInnerClass: class extends ParentInner，replace 场景派生
  - 单模板直接返回 InnerClass（真正的 class），多模板返回工厂函数
  - 移除 copyPrototypeMethods/copyStaticMethods/initForgedState，改用原生继承
  - InnerClass 自带 .create/.with/.replace 静态方法
- ✅ 能力方法添加 `this: any` 类型标注（withAbilities 模式下 this 指向宿主实例）
  - AnimationAbility / EventForwardAbility / LifecycleAbility / NodePropAbility / CommonPropsAbility
  - 能力对象从 `satisfies AbilityDefinition` 改为 `as AbilityDefinition`
- ✅ NodePropAbility 移除 _emitLifecycleEvent（已由 LifecycleAbility 提供）
- ✅ LifecycleAbility bridgeEmit 改为传 EventContext 对象（不再传 globalEventBus.getBusId()）
- ✅ CommonPropsAbility 新增 setNodeHtml 方法 + html 节点属性
- ✅ contentMode 拆分：html → text(textContent) + html(innerHTML)
  - DEFAULT_NODE_PROP_MAP: text → textContent, 新增 html → innerHTML
  - CONTENT_MODE_MAP: text → text, html → html
- ✅ template-init.ts 新增 listens 统一事件订阅机制
  - 支持 bridge/entity/float/drag/system/route 六种事件源
  - bindEventMappings 统一处理 once 和 handler 解析
  - setupListens 在 callInitMethods 之后自动调用
- ✅ template-init.ts 新增 onLocaleChange 钩子（i18n locale/messages 更新时调用）
- ✅ template-init.ts renderChildComponents 支持 _nodeOverrides 子组件差异化配置
  - override.type 可替换子组件类型（函数或字符串）
  - override.initConfig 合并子组件初始化配置
- ✅ composable/index.ts 新增导出 createForgedClass
- ✅ 新增 body.nodes 声明式节点配置机制（替代 nodeOverrides 和 replace 的 cls/itemsCls）
  - NodeConfig / NodesConfig 类型定义（tpl-body.ts）
  - BODY_SPECIAL_KEYS 新增 nodes: { category: 'init' }
  - addCls 字段：追加 CSS 类（与现有 cls 拼接），替代 replace 的 cls/itemsCls
  - cls/hidden/type/events/initConfig/style/flex/grid/role/attrs：覆盖/替换语义
  - mergeBodies 对 nodes 字段深合并（同 mergeNodeOverrides 逻辑）
  - createInnerClass/createDerivedInnerClass 调用 updateNodeMetasFromOverrides 处理 body.nodes
  - initNodeProps 新增 applyNodeConfig：先处理 body.nodes，再处理 nodeOverrides（向后兼容）
  - renderChildComponents 支持 body.nodes 中的 type/initConfig
  - replace 的 cls/itemsCls 自动转为 body.nodes.addCls（替代构造函数包装 hack）
- ✅ 构造函数去重：createInnerClass 和 createDerivedInnerClass 共享 templateComponentConstructor
- ✅ 11 个 replace 组件迁移到 body.nodes 新写法
  - InputComponent / PasswordInputComponent / DropdownComponent / FormComponent / InputInfoGroupComponent
  - NavItemGroupComponent / AccordionComponent / ButtonGroupComponent / MenuComponent / TabBarComponent / ToolbarComponent

### 2026-07-21
- ✅ CommonPropsAbility 两层架构重构：root getter/setter + 方法重载 + setNodeXxx + setNodeProp 兜底
- ✅ 移除 addCommonPropDesc / addClsMethodDescs / addComponentForwardDescs / addForwardClsMethodDescs
- ✅ 保留 addContentPropDesc（内容属性）和 addComponentRefDesc（$name 组件引用）
- ✅ CommonPropsAbility 补齐 10 个 CSS 便捷属性（width/height/x/y/margin/padding/fontSize/color/bg/cursor/border）
- ✅ 4 个组件迁移：Loading/Card/Avatar/Toggle 的 xxxHidden → setNodeHidden
- ✅ 5 个组件重构事件绑定：Indicator/MenuItem/NavItem/Panel 的 addEventListener → bind/声明式 events
- ✅ IndicatorComponent 新增 itemTpl 自定义模板支持
- ✅ 4 个组件模板 className → cls 修复（NavItem/OverflowScroll/Tabs/RouteContainer）
- ✅ toggleCls 支持 force + nodeName 重载
- ✅ NodePropAbility 子组件委托：_resolveNodeTarget 返回 {el,component}，子组件有同名属性时走 component[prop]
- ✅ CommonPropsAbility addCls/removeCls/toggleCls/setAttr/removeAttr 子组件有同名方法时委托
- ✅ _flushNodeProps 委托 _updateNode，不再绕过生命周期事件和动画
- ✅ 移除未使用的 applyCls 函数

### 2026-07-20
- ✅ 根节点统一纳入 nodeMap（编译时 root 写入 indexPath/nodeMetas，移除 rootMeta）
- ✅ 移除所有 root 特判：_resolveNodeEl 不再 if(nodeName==='root')、initNodeProps 不再跳过 root、initElementFromTemplate 不再单独 _updateNode('root')
- ✅ 根节点 events 支持：根节点可声明 events，自动走 bindDomEventBindings 统一绑定
- ✅ ToggleComponent/ToggleIconComponent 重构：移除 props/forwards、events 声明式事件转发、$icon 属性机制、onAfterInit 生命周期
- ✅ body.forwards 对简单组件转发已冗余（组件子节点改用 setNodeXxx 方法或 $name 直接访问）

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

### 通过的测试（12 suites / 103 tests）
- ✅ TemplateConstants — 常量定义
- ✅ TemplateCompiler — 预编译引擎
- ✅ ChildNodeProps — 子节点属性自动构建
- ✅ TemplateFactory — 模板组件工厂（createInnerClass + createDerivedInnerClass）
- ✅ NodePropAbility — 节点属性读写 + hiddenchange 事件
- ✅ DelegatedEventEngine — 委托事件引擎（compileTplEvents / containsElement / getTargetItem / handleDelegatedEvent / 嵌套组件 / _dispatchRule / _resolveHandlerName）
- ✅ CommonPropsAbility — 通用属性
- ✅ AnimationAbility — 声明式动画
- ✅ LifecycleAbility — 生命周期事件（bridgeEmit 传 EventContext）
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
