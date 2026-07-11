# withTemplate 统一架构方案

> 日期：2026-07-11
> 状态：讨论中

## 背景

当前 ComponentBase 存在两条模板路径：

1. **withTemplate 路径**：类定义时预编译，实例化时纯克隆
2. **TemplateRegistrar 路径**：运行时从注册表查找模板，首次实例化时编译优化

两条路径导致：
- 开发者需要理解两套机制，心智负担高
- NodeMapAbility 需要同时维护两条路径的逻辑
- TemplateRegistrar 作为默认路径，性能不如 withTemplate
- 模板和组件类分离，需要通过 type 字符串间接关联

## 决策

### 统一为 withTemplate 强类模型

**所有组件都是 withTemplate 强类，没有例外。**

```typescript
// 唯一的组件定义方式
const TEMPLATE = `<div>...</div>`;
export let MyComponent = class extends ComponentBase.withTemplate(TEMPLATE) {
    // 方法
};
```

### 架构变化

| 之前 | 之后 |
|------|------|
| 两条路径（withTemplate + TemplateRegistrar） | 一条路径（withTemplate） |
| TemplateRegistrar 查找模板 → 首次实例化编译 | withTemplate 预编译 → 纯克隆实例化 |
| NodeMapAbility.buildNodeMap 运行时编译 | withTemplate 预编译，NodeMapAbility 仅保留 i18n 等实例方法 |
| type 字符串 → TemplateRegistrar → 模板 → 编译 | type 字符串 → ComponentRegistrar → 强类 → 直接实例化 |
| 内容属性 defineProperty 在运行时 | 内容属性 defineProperty 在预编译时 |
| 事件模板在运行时推导 | 事件模板在预编译时完成 |

### 预编译内容

withTemplate 调用时一次性完成：

| 预编译项 | 说明 | 存储位置 |
|---------|------|---------|
| `_templateHtml` | 模板 HTML 字符串 | 强类静态属性 |
| `_indexPath` | 节点在 DOM 树中的位置路径 | 强类静态属性 |
| `_templateMetas` | 节点元数据（group/name/mode 等） | 强类静态属性 |
| `_internalEventTemplates` | 内部事件模板（handler 名已推导、eventAttr 已解析） | 强类静态属性 |
| `_externalEventTemplates` | 外部事件模板（emitKey 已计算） | 强类静态属性 |
| `_contentPropNames` | 内容属性名列表 | 强类静态属性 |
| `_templateCache` | HTMLTemplateElement 缓存 | 强类静态属性（懒创建） |
| 内容 getter/setter | text、icon 等属性描述符 | 强类原型 |

### 实例化流程

```
new StrongClass(props)
  → initialize(layout)
    → initElement()
      → createElement(tag)
      → _cloneFragment()           // 纯克隆，不查注册表
      → _buildNodeMapFromCompiled() // indexPath 定位 + 填 node 引用
      → _buildEventMapFromTemplates() // 预编译模板填 node 引用
```

零字符串处理开销，零 defineProperty 调用。

## 组件注册与查找

### ComponentRegistrar 保留

所有 withTemplate 强类注册到 ComponentRegistrar，JSON 配置驱动时通过 type 查找：

```typescript
// 注册
ComponentRegistrar.register('button', Button);
ComponentRegistrar.register('grid', Grid);
ComponentRegistrar.register('home', HomePage);

// 查找
const GridClass = ComponentRegistrar.get('grid');
const grid = new GridClass();
grid.initialize(config);
```

### TemplateRegistrar 弱化

TemplateRegistrar 不再作为默认模板查找机制，仅保留 `data-template` 嵌套注入功能。

## 模板替换

直接从 ComponentBase 重新 withTemplate，干净利落：

```typescript
// 定义
export let Button = class extends ComponentBase.withTemplate(BUTTON_TEMPLATE) {
    onClick() { ... }
};

// 替换 — 后续实例化用新模板
Button = class extends ComponentBase.withTemplate(CUSTOM_BUTTON_TEMPLATE) {
    onClick() { ... }
};
```

## 子组件与嵌套

模板声明结构，children 配置对齐 name：

```typescript
const HOME_TEMPLATE = `
<div class="page">
    <div data-content="page:grid"></div>
    <button data-content="page:saveBtn" data-event="click">保存</button>
</div>
`;

export let HomePage = class extends ComponentBase.withTemplate(HOME_TEMPLATE) {
    onSaveBtn(e) { ... }
};

// 使用
page.initialize({
    type: 'page',
    children: [
        { target: 'grid', type: 'grid', rowClass: SelectableRow, columns: [...] },
    ]
});
```

## Grid 行强类

Grid 外部用 withTemplate 构建行强类，指定给 Grid 使用：

```typescript
// 定义行强类
const SELECTABLE_ROW_TEMPLATE = `
<div class="q-row">
    <div data-content="row:selector" data-event="click">
        <input type="checkbox" data-content="row:checkbox" />
    </div>
    <div data-content="row:cells"></div>
</div>
`;

const SelectableRow = RowBase.withTemplate(SELECTABLE_ROW_TEMPLATE);

// Grid 使用
grid.initialize({
    type: 'grid',
    rowClass: SelectableRow,
    columns: [...],
});
```

模板声明了什么节点，withTemplate 就预编译出什么属性。不需要额外配置来声明"是否启用选择列"。

## 性能数据

withTemplate 预编译开销基准测试（Node.js 模拟）：

| 场景 | 耗时 |
|------|------|
| 单次页面模板预编译 | 0.008 ms |
| 单次简单组件预编译 | 0.039 ms |
| 50 个简单组件 | 0.16 ms |
| 10 页面 + 40 组件 | 0.36 ms |
| 100 个页面模板 | 0.83 ms |

结论：全部用 withTemplate 对启动性能没有实质影响。即使 100 个模板全部预编译，也只花不到 1ms。

## 启动入口

应用启动入口必须使用 withTemplate 强类，不能 `new ComponentBase()`：

```typescript
// app.ts
const APP_TEMPLATE = `
<div class="app">
    <div data-content="app:page"></div>
</div>
`;

export let App = class extends ComponentBase.withTemplate(APP_TEMPLATE) {};

// main.ts
const app = new App();
app.initialize({
    type: 'app',
    children: [
        { target: 'page', type: 'home' },
    ]
});
```

## 实施步骤

1. 确认 withTemplate 预编译机制稳定（已完成）
2. 确认 NodeMapAbility 事件模板预编译（已完成）
3. 将现有组件（Button、Input、Dialog 等）改为 withTemplate 定义
4. 弱化 TemplateRegistrar，移除 ComponentBase.initElement 中的 TemplateRegistrar 查找逻辑
5. NodeMapAbility.buildNodeMap 标记为 deprecated，保留 i18n 等实例方法
6. 更新组件注册流程，全部走 ComponentRegistrar
7. 更新文档和示例
