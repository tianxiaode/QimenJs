# EventAbility 组合模式替代 ComponentBase 继承

## 背景

UI 组件事件系统设计中，最初计划创建 `ComponentBase` 基类，在基类内部定义 `emitUI`/`on`/`off`/`once`/`executeWithEventContext` 等方法。但 QimenJS 已有完整的 Ability 组合体系（ComposableBase + AbilityDefinition），EventAbility 和 DomEventsAbility 已经提供了基础事件能力。

## 决策

不创建独立的 ComponentBase 基类，而是将 UI 事件能力（emitUI/eventKey/chain/executeWithEventContext）作为 EventAbility 的扩展注入。

## 原因

1. **一致性**：QimenJS 的核心设计理念是"能力赋能组件"，所有功能都通过 Ability 注入。在 ComponentBase 内部定义方法违反了这个原则。
2. **复用性**：EventAbility 已经提供了 on/once/emit/eventScope，emitUI 是事件能力的自然扩展，不需要独立基类。
3. **灵活性**：Ability 组合让组件可以按需选择能力，不需要的组件不会继承无用方法。
4. **避免继承膨胀**：如果每种能力都在 ComponentBase 中定义方法，基类会越来越臃肿。

## 影响

- `EventAbility` 从 4 个方法扩展到 8 个（新增 emitUI/executeWithEventContext/_initEventKey/_unregisterEventKey）
- 组件使用方式：`static readonly abilities = [EventAbility]; static readonly eventKey = 'toolbar';`
- 不再需要 `src/component/ComponentBase.ts`，删除了该文件
- `EventBus.emit` 增加预构建 EventContext 重载，emitUI 传入 Builder 构建的 ctx 不再被覆盖

## 替代方案

1. **ComponentBase 继承**：在基类中定义所有方法。被否决，违反 Ability 组合原则。
2. **独立 UIEventAbility**：创建新的 Ability 专门处理 UI 事件。被否决，与 EventAbility 职责重叠，且 emitUI 需要访问 eventScope。
3. **__init__ 钩子**：通过 Ability 的 __init__ 字段自动调用初始化方法。被否决，eventScope getter 惰性初始化更简洁。

## 实施细节

1. EventAbility 新增 emitUI/executeWithEventContext/_initEventKey/_unregisterEventKey
2. eventKey 通过 eventScope getter 惰性初始化（首次访问 eventScope 时触发 _initEventKey）
3. dispose 时通过 onCleanup 注册 _unregisterEventKey，自动注销 eventKey
4. EventBus.emit 增加运行时检测：如果第二个参数有 event+timestamp+busId 属性，视为预构建 EventContext
5. GlobalEventBus.emit 同步增加预构建 EventContext 重载
6. 删除 src/component/ComponentBase.ts 和 src/component/index.ts

## 后续工作

- Step 6: 实现 EventListen 绑定逻辑（bindEventListen）
- Step 7: 实现 EventFlowRegistrar（事件流生命周期管理）
