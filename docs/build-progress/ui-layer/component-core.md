# @qimenjs/component-core

**层级**: UI 层  
**状态**: ⚠️ 开发中  
**测试**: ✅ 12 suites / 103 tests（含委托事件引擎 23 tests）
**覆盖率**: ~85%

## 构建历史

### 2026-07-28
- ✅ NodeMapManager 路径前缀匹配 Bug 修复
  - `_removeChildEntries` 从 `pathStr.startsWith(prefix)` 改为路径长度 + 逐元素精确匹配
  - 修复了同父节点名的兄弟节点互相误删的边界情况
- ✅ 禁止 remove('root')
  - `remove()` 开头添加 `if (name === 'root') throw new Error(...)` 守卫
  - 防止根节点被误删导致整个组件崩溃
- ✅ nodeMap 改为 getter
  - `Component.nodeMap` 从直接属性改为 getter：`get nodeMap() { return this.nodeMapMgr?.getAll() ?? {}; }`
  - 外部无法直接修改内部映射表，提升封装性
- ✅ readyAll / 深度等待
  - 新增 `Component.readyAll` getter（Promise），递归等待所有子组件 ready 完成
  - 实现 `_readyAll()`：遍历 nodeMap 中所有子组件，等待其 readyAll 或 ready
- ✅ 跳过空 FILL_PHASE
  - `init()` 添加 `if (FILL_PHASE.steps.length > 0)` 守卫，空阶段不再增加微任务延迟
- ✅ isItemContainer 替代 __noSkeletonRestore
  - `Component` 新增 `get isItemContainer()` getter（默认 false）
  - `onBeforeDispose` 骨架恢复条件增加 `!this.isItemContainer` 检查
  - `ItemGroupBaseComponent` 重写返回 true（骨架恢复的额外安全网）
- ✅ DelegatedEventEngine 事件引擎修复
  - 委托事件双重绑定修复：`bindDelegatedEvents` 只绑定根节点规则（`rule.nodeName !== ''`），命名节点规则通过委托分发
  - dispatchers 缓存机制：`bindDelegatedEvents` 预包装 debounce/throttle/once，存入 `_delegatedDispatchers`，分发时直接取用
  - handler 正确包装：命名节点规则的 handler 在分发时通过 dispatchers 获取已包装版本
- ✅ BindOptions 添加 delegated 标记
  - `event-dom/types/adapters/base.ts` 和 `system-abilities/types/abilities.ts` 中 `BindOptions` 新增 `delegated?: boolean`
  - 标记事件是否已由父元素委托处理，避免重复绑定
- ✅ 类型清理：节点纯结构，语义归使用方
  - 删除 `NodeBehavior` 接口：节点不携带实体/路由语义
  - 删除 `NodeEventConfig` 接口：节点不携带默认事件配置
  - 删除 `TplNode.behavior`、`TplNode.events` 字段
  - 删除 `NodeMetadata.behavior`、`NodeMetadata.events` 字段
  - 编译引擎（CompileEngine）不再感知事件信息，职责回归纯编译
  - 事件语义（entity/route 名）完全由 `tplEvents` 在使用时声明，支持旧写法（string）和 $items 动态写法
  - 理由：节点是多用途的，语义应在使用时确定而非写死
- ✅ 组件销毁骨架占位恢复机制
  - NodeMapManager 新增 restoreSkeleton(name) 方法：用 `<div class="q-skeleton">` 替换被销毁组件的 DOM 位置
  - Component.onBeforeDispose 增加条件性骨架恢复：仅对 slot 挂载的子组件（有 parent + slotName）恢复骨架
  - _disposing 标志：销毁时设为 true，子组件检查此标志跳过骨架恢复（防止父组件销毁时的重复恢复）
  - __noSkeletonRestore 标志：NodeMapManager.remove() / _removeChildEntries() 销毁子组件前设置，阻止递归骨架恢复
  - _replaceDOM 优化：优先使用 old.el.parentNode 定位（骨架恢复后 el 可能被替换为占位符）
- ✅ ItemGroup 直挂模式设计决策
  - ItemGroup 子组件通过 appendChild 直接追加到 itemContainer，不走 slot 挂载（无 parent/slotName）
  - 骨架恢复的 `this.parent && this.slotName` 条件天然排除 ItemGroup 子组件，无需额外 isItemContainer flag
  - 事件通信走 ComponentEventBus + eventKey 注册机制（pub/sub），不依赖 parent 冒泡
  - 配置访问通过 defaultItem 事件转发 + 直接方法调用（getAt/indexOf/updateAt）解决
  - 决策：当前不加 parent 是正确选择，避免引入循环引用和不必要的 flag 维护成本
- ✅ 初始化管线步骤拆分 + 异步化 + 子组件 self-mount + 委托事件绑定
  - step-override-queue.ts 拆为 3 个独立步骤文件：step-on-init-state / step-on-before-init / step-on-after-init
  - 删除 executeOverrideQueue / _overrideQueues / _compiled 分支（旧模式遗留，原生 super 替代）
  - InitStep 类型改为 `(ctx) => void | Promise<void>`，runPhase 改为 async
  - 新增 step-self-mount.ts：子组件在 MOUNT 阶段 buildDOM 后自行挂载到父占位符，骨架立即可见
  - 新增 step-instantiate-child-components.ts：INSTANTIATE 阶段通过 GlobalTaskQueue 队列化子组件创建
  - 新增 step-bind-delegated-events.ts：FINALIZE 阶段调用 DelegatedEventEngine.bindDelegatedEvents 绑定委托事件
  - Component 增加 parent / slotName 属性，子组件接收父引用后自主挂载
  - mountChildComponent 补上 child.parent 设置
  - MOUNT_PHASE: [ensureNodeMap, selfMount, setupNodeProps, onInitState, onBeforeInit]
  - INSTANTIATE_PHASE: [instantiateChildComponents]
  - FINALIZE_PHASE: [bindDelegatedEvents, onAfterInit]
  - component-core/index.ts 清理 RuntimeEngine / executeOverrideQueue / pipelineOverrideQueue 死导出
- ✅ NodeMapManager.replace() JSDoc 注释补充
  - replace() 保留（运行时动态替换，与模板编译期 Component.replace() 不同）
  - mountChildComponent() 补充 JSDoc（挂载已创建实例，不处理旧组件销毁）

### 2026-07-27
- ✅ CompileEngine 职责收归 + 结构分离
  - CompileEngine.ts 纯编译引擎类，散装函数内聚为静态方法
  - constants/compile-constants.ts：VOID_TAGS / SKELETON_CLS 等编译常量独立目录
  - types/compile-engine-types.ts：CompileResult 等编译类型独立目录
  - utils/dom-path.ts：findByPath 运行时 DOM 工具独立目录
  - compilePendingTemplate / compileSubtree 删除（旧 replace 模式遗留）
- ✅ 骨架屏编译时内化，运行时零开销
  - type 节点（组件）编译时 HTML 输出 `<div class="q-skeleton"></div>`，cls 元数据含 `q-skeleton`
  - tag 节点 `skeleton: true` 属性删除（组件天然有骨架，tag 节点不需要）
  - `skeletonPaths` 从 CompiledTemplateCache / CompileEngine 产物中移除
  - step-ensure-node-map.ts 运行时骨架逻辑（applySkeletonClasses）删除
- ✅ step-ensure-node-map.ts 简化
  - 去掉 ctor 缓存分支（`_cache`/`_nodeMetas`），统一走 TemplateRegistrar.createNodeMapManager()
  - buildDOM() 不再传 tag，从 nodeMetas root 取 rootTag
- ✅ NodeMapManager 精简
  - 删除 appendTo / _replaceWithSubtree / _compileSubtree（旧 replace 模式遗留）
  - replace() 简化为只接受组件类（TplNode 子树替换已由编译时 tplReplaces 处理）
  - 新增 rootTag getter，buildDOM() 无参数
- ✅ ChildNodeProps → ChildNodePropsEngine 引擎化
  - applyChildNodeProps / buildChildNodePropDescs → ChildNodePropsEngine.apply / buildDescs
  - 新增 step-setup-node-props.ts 管道步骤
- ✅ 初始化管道重构
  - MOUNT_PHASE: [ensureNodeMap, setupNodeProps, onInitState, onBeforeInit]
  - 删除 step-apply-node-configs.ts（依赖已删的 RuntimeEngine）
- ✅ 删除旧模式遗留文件
  - EventEngine.ts（DelegatedEventEngine 的旧别名，DelegatedEventEngine.ts 保留）
  - TemplateFactory.ts / TemplateDeriver.ts / BodyMerger.ts
  - 相关测试：template-factory.test.ts / TemplateDeriver.tplReplaces.test.ts / body-merger.test.ts / compile-bench.test.ts
- ✅ 类型清理
  - TplNode / NodeMetadata 删除 skeleton 属性
  - CompiledTemplateCache 删除 skeletonPaths
  - INodeMapManager 简化 replace 签名、删除 appendTo、新增 rootTag
  - tpl-node-def.ts 删除 skeleton 字段定义
- ✅ TemplateRegistrar 模板注册器（唯一注册生态，替代 ComponentRegistrar）

### 2026-07-26
- ✅ SystemAbility 注入 TemplateComponent：所有组件可通过 this.i18nConfig() / this.systemConfig() 访问
- ✅ FormFieldComponent 移除私有 getI18nUiConfig，改用 this.i18nConfig()?.ui 获取 i18n UI 配置
- ✅ onLocaleChange 钩子：FormFieldComponent 在 locale 变化时自动刷新 requiredMark/separator
- ✅ DayGridComponent 池化：初始化创建固定 7 weekday + 42 day cell，update 只改 textContent/classList/dataset，不重建 DOM
- ✅ DayGridComponent 从 i18nConfig 获取 weekdaysShort 和 weekStart，locale 切换自动刷新
- ✅ MonthPanelComponent 池化：初始化创建固定 12 cell，update 只改内容和样式
- ✅ MonthPanelComponent 从 i18nConfig 获取 monthsShort 显示，locale 切换自动刷新
- ✅ DatePanelComponent _updateLabel 用 i18nConfig().months 显示月份名
- ✅ 语言包补充日期显示配置：weekdays/weekdaysShort/weekdaysMin/months/monthsShort
- ✅ SystemRegistrar storage 默认值改为空对象，默认设置转移到 i18n

### 2026-07-25
- ✅ tplReplaces 模板子树替换机制
  - TemplateDeriver.deriveWithTplReplaces()：替换父模板中指定节点的 DOM 子树，产出新 cache
  - TemplateCompiler.compileSubtree()：编译子树为 HTML + indexPath + nodeMetas
  - TemplateFactory.createDerivedInnerClass() 支持 tplReplaces 选项，有 tplReplaces 时走 deriveWithTplReplaces
  - replace() 选项新增 tplReplaces 字段
- ✅ replaces 声明：body.replaces 声明直接覆盖（不走继承链）的方法名列表
  - tpl-body-def.ts 新增 replaces: { category: 'static' }
  - collectOverrideHooks/wrapOverrideMethodsOnProto 跳过 replaces 中的方法名
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
- ✅ LifecycleAbility componentEmit 改为传 EventContext 对象（不再传 globalEventBus.getBusId()）
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
- ✅ 有 eventKey 时自动发送组件事件（componentEmit）
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
- ✅ ComponentEventBusAbility（原 EventBridgeAbility → EventBridgeConfigAbility → ComponentEventBusAbility）
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
- ✅ CompileEngine — 编译引擎（compileTemplate / expandFragments / compileTypeNode / compileTagNode）
- ✅ ChildNodePropsEngine — 子节点属性引擎（buildDescs / apply）
- ✅ NodePropAbility — 节点属性读写 + hiddenchange 事件
- ✅ DelegatedEventEngine — 委托事件引擎（compileTplEvents / containsElement / getTargetItem / handleDelegatedEvent / 嵌套组件 / _dispatchRule / _resolveHandlerName）
- ✅ CommonPropsAbility — 通用属性
- ✅ AnimationAbility — 声明式动画
- ✅ LifecycleAbility — 生命周期事件（componentEmit 传 EventContext）
- ✅ tpl-body-def — Body 字段定义
- ✅ common-props — 属性定义

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
