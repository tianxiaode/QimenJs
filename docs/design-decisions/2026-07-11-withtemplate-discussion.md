# withTemplate 统一架构讨论

> 日期：2026-07-11
> 状态：讨论中

## 讨论过程

### 1. 初始问题：两条路径的复杂性

ComponentBase 存在两条模板路径：
- withTemplate：类定义时预编译
- TemplateRegistrar：运行时查找模板

开发者需要理解两套机制，NodeMapAbility 需要同时维护两条路径。

### 2. 消除动态属性生成

**问题**：NodeMapAbility.buildNodeMap 在首次实例化时调用 buildContentPropertiesOnProto 做 Object.defineProperty，这是运行时动态生成。

**结论**：withTemplate 路径由 buildContentPropertiesOnClass 在预编译时完成，实例化时零 defineProperty 开销。NodeMapAbility 路径保留 buildContentPropertiesOnProto 供非 withTemplate 场景使用。

### 3. 事件模板预编译

**问题**：buildEventMap/buildEventMapFromMetas 每次都重新推导 handler 名和解析 eventAttr。

**结论**：引入 InternalEventTemplate/ExternalEventTemplate 预编译结构，handler 名推导和 eventAttr 解析只做一次，实例化时只填 node 引用。两条路径都使用此优化。

### 4. withTemplate 强类是否依赖 TemplateRegistrar

**问题**：withTemplate 强类的 initElement 是否还需要 TemplateRegistrar？

**讨论**：
- withTemplate 强类自带模板，不需要通过 type/template ID 查找注册表
- data-template 嵌套模板注入在 withTemplate 路径中不需要（模板是完整的）
- 结论：withTemplate 强类的 initElement 是纯克隆流程，不依赖 TemplateRegistrar

### 5. 两条路径的定位

**问题**：withTemplate 和 TemplateRegistrar 各自适用什么场景？

**讨论**：
- withTemplate：基础组件（代码定义），模板固定在类中
- TemplateRegistrar：JSON 定义 / 嵌套模板，运行时从注册表获取模板

**关键转折**：用户指出"更常用的应该是在 JSON 定义或者在模板中嵌套模板，从模板注册表获取并动态编译优化"。

### 6. Grid 行强类场景

**问题**：Grid 内部如何高效创建行实例？

**讨论**：
- 方案 A：Grid 内部 withTemplate 构建行强类
- 方案 B：Grid 外部 withTemplate 构建行强类，指定给 Grid 使用

**结论**：方案 B 更好。行强类在外部定义，Grid 只是引用。这样行强类可以在构建阶段预编译，不需要运行时动态构建。

### 7. 模板组合 vs 能力注入

**问题**：行需要选择列、ID列等功能，是通过能力注入还是模板组合？

**讨论**：
- 能力注入（withAbilities）：在强类原型上追加能力方法
- 模板组合：在模板 HTML 中声明选择框、ID列节点

**结论**：模板组合是正确方向。选择列、ID列本质是 DOM 节点，必须在模板中声明，withTemplate 才能预编译提取。能力只是操作这些节点的行为。

```html
<!-- 带选择列的行模板 -->
<div class="q-row">
    <div data-content="row:selector" data-event="click">
        <input type="checkbox" data-content="row:checkbox" />
    </div>
    <div data-content="row:cells"></div>
</div>
```

### 8. 全部 withTemplate 化的启动性能

**问题**：全部用 withTemplate 会不会导致启动缓慢？

**讨论**：基准测试数据表明，100 个页面模板全部预编译只花 0.83ms，远小于一帧渲染时间（16ms）。总开销和 TemplateRegistrar 路径一样，只是时机不同。如果担心启动集中开销，用懒加载分散即可。

**结论**：全部用 withTemplate 没有性能问题。

### 9. 模板替换

**问题**：withTemplate 强类不依赖 TemplateRegistrar，如何替换模板？

**讨论**：
- 方案 A：Button.withTemplate(newTemplate) 链式调用，新类继承旧类方法
- 方案 B：直接从 ComponentBase 重新 withTemplate

**结论**：方案 B 更简单直接。每次都是从 ComponentBase 出发生成全新的强类，方法手动重新声明。不需要链式替换。

```typescript
Button = class extends ComponentBase.withTemplate(CUSTOM_BUTTON_TEMPLATE) {
    onClick() { ... }
};
```

### 10. 事件处理

**问题**：withTemplate 模板中 data-event 推导的 handler 名，IDE 无法从 HTML 字符串跳转到类方法。

**讨论**：
- data-event="click" → onSaveBtn，命名规则固定但 IDE 无法跳转
- data-emit + handlers 配置，模板和逻辑分离
- data-event="click:onSaveBtn" 显式声明 handler 名

**结论**：对于 withTemplate 基础组件，data-event + 类方法是自然写法，跳转问题靠约定解决。data-emit + handlers 留给 JSON 驱动场景。

### 11. 统一为 withTemplate

**问题**：是否可以完全取消 TemplateRegistrar 路径？

**讨论**：
- TemplateRegistrar 仍有 data-template 嵌套注入的用途
- 但核心观点：能用 withTemplate 的场景都应该用 withTemplate
- ComponentRegistrar 按 type 查找强类，不需要 TemplateRegistrar 查找模板

**结论**：统一为 withTemplate 强类模型。TemplateRegistrar 弱化为嵌套模板辅助工具。所有组件都是 withTemplate 强类，没有例外。

### 12. 开发体验

**问题**：withTemplate 写法的开发效率和接受度如何？

**讨论**：
- 纯 TypeScript 写法，不需要特殊文件格式（对比 Vue 的 .vue 三段式）
- 模板是字符串常量，类是类，方法在类上
- IDE 原生支持类型推断、跳转定义、重构
- 子组件通过 name 对齐，逻辑清晰

**结论**：比 Vue 三段式更自然，更接近 TypeScript 原生写法。

## 待解决问题

1. **事件跳转**：data-event 推导的 handler 名无法 IDE 跳转，需要工具链支持或约定
2. **data-template 嵌套**：withTemplate 强类中是否还需要支持 data-template 嵌套注入？
3. **NodeMapAbility 废弃**：buildNodeMap 何时标记 deprecated？i18n 方法如何迁移？
4. **构建阶段预编译**：是否需要构建插件在发布阶段把 withTemplate 结果序列化为硬编码数据？
