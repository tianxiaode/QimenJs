# withTemplate 最佳实践

> 日期：2026-07-11
> 状态：当前有效

## withTemplate 是什么

`withTemplate` 是 `TemplateComponent` 的静态工厂方法，接收 HTML 模板字符串，在**类定义时**预编译，返回一个带模板的强类。

**为什么用 withTemplate**：

1. **性能** — 类定义时预编译（提取节点、生成属性、预编译事件），实例化时纯克隆（cloneNode + 填引用），零字符串处理开销
2. **类型安全** — 模板声明了什么节点，强类就有什么属性，编译期可检查
3. **跨平台** — 事件绑定使用 event-dom 规范命名（`tap`/`click`/`input`/`change`），自动适配 pointer/touch/mouse
4. **统一架构** — 所有组件都是 withTemplate 强类，不需要区分模板组件和 JSON 组件

## 核心原则

**所有组件都是 withTemplate 强类，没有例外。**

## 1. 基础组件定义

```typescript
// Button.ts
import { BUTTON_TEMPLATE } from '@qimenjs/template';

const ButtonBase = TemplateComponent.withTemplate(BUTTON_TEMPLATE);

export class ButtonComponent extends ButtonBase {
    static readonly abilities = [ContentAbility, ClickAbility, DisableAbility, LoadingAbility, SizeAbility];

    onClick(e) {
        // 按钮点击逻辑
    }
}
```

**要点**：
- 模板从 `@qimenjs/template` 导入，不在组件文件中定义
- `const XxxBase = TemplateComponent.withTemplate(XXX_TEMPLATE)` 创建基类
- `class XxxComponent extends XxxBase` 继承并添加业务逻辑
- `data-content` 声明节点，自动生成同名属性（`this.text`、`this.icon`）
- `data-event` 声明事件，自动推导 handler 名（`onClick`）

## 2. 页面组件定义

```typescript
// HomePage.ts
const HOME_TEMPLATE = `
<div class="page">
    <header data-content="page:header">
        <h1 data-content="page:title" data-i18n="home.title"></h1>
    </header>
    <main data-content="page:main">
        <div data-content="page:grid"></div>
    </main>
    <footer data-content="page:footer"></footer>
</div>
`;

const HomePageBase = TemplateComponent.withTemplate(HOME_TEMPLATE);

export class HomePage extends HomePageBase {
    // 页面级逻辑
}

// 路由注册
router.register('home', HomePage);
```

**要点**：
- 页面也是 withTemplate 强类，和基础组件写法一致
- `data-i18n` 声明翻译 key，自动翻译
- 子组件位置用 `data-content` 声明，通过 children 配置填入

## 3. 子组件嵌套

```typescript
// 使用
const page = new HomePage();
page.initialize({
    type: 'page',
    children: [
        { target: 'grid', type: 'grid', rowClass: SelectableRow, columns: [...] },
    ]
});
```

**要点**：
- `target` 对齐模板中 `data-content` 的 name 部分
- 子组件类型通过 `type` 从 ComponentRegistrar 查找
- 不需要手动 `add` + `appendChild`

## 4. Grid 行强类

```typescript
// 行模板定义
const SELECTABLE_ROW_TEMPLATE = `
<div class="q-row">
    <div data-content="row:selector" data-event="tap">
        <input type="checkbox" data-content="row:checkbox" />
    </div>
    <div data-content="row:cells"></div>
</div>
`;

const EDITABLE_ROW_TEMPLATE = `
<div class="q-row">
    <div data-content="row:selector" data-event="tap">
        <input type="checkbox" data-content="row:checkbox" />
    </div>
    <div data-content="row:id"></div>
    <div data-content="row:cells"></div>
    <div data-content="row:actions">
        <button data-content="row:editBtn" data-event="tap">编辑</button>
        <button data-content="row:deleteBtn" data-event="tap">删除</button>
    </div>
</div>
`;

// 行强类
const SelectableRow = RowBase.withTemplate(SELECTABLE_ROW_TEMPLATE);
const EditableRow = RowBase.withTemplate(EDITABLE_ROW_TEMPLATE);

// Grid 使用
grid.initialize({
    type: 'grid',
    rowClass: EditableRow,
    columns: [...],
});
```

**要点**：
- 行强类在外部定义，Grid 只是引用
- 模板声明了什么节点，withTemplate 就预编译出什么属性
- 不需要额外配置来声明"是否启用选择列"——模板里有就有，没有就没有
- 不同行模板生成不同强类，互不干扰

## 5. 模板替换

```typescript
// 定义
export let Button = class extends TemplateComponent.withTemplate(BUTTON_TEMPLATE) {
    onClick() { ... }
};

// 替换 — 直接从 TemplateComponent 重新生成
Button = class extends TemplateComponent.withTemplate(CUSTOM_BUTTON_TEMPLATE) {
    onClick() { ... }
};
```

**要点**：
- 每次都是从 TemplateComponent 出发生成全新强类
- 方法手动重新声明
- 已有实例不受影响，后续实例化用新模板

## 6. 事件处理

### 事件规范命名

使用 event-dom 的规范命名，跨平台兼容（pointer/touch/mouse 自动适配）：

| 规范命名 | 类型 | 说明 |
|---------|------|------|
| `tap` | GestureSemantic | 轻触 |
| `click` | GestureSemantic | 点击 |
| `dblclick` | GestureSemantic | 双击 |
| `longpress` | GestureSemantic | 长按 |
| `swipe` | GestureSemantic | 滑动 |
| `drag` | GestureSemantic | 拖拽 |
| `hover` | GestureSemantic | 悬停 |
| `input` | InputSignal | 输入 |
| `change` | InputSignal | 变更 |
| `focus` / `blur` | InputSignal | 焦点 |
| `scroll` | InputSignal | 滚动 |
| `keydown` / `keyup` | InputSignal | 键盘 |

### 内部事件（data-event）

组件自身处理的事件，handler 名自动推导，通过 `this.bind` 绑定：

```html
<button data-content="page:saveBtn" data-event="tap">保存</button>
<!-- → handler: onSaveBtn -->
```

### 外部事件（data-emit）

向外发布的事件，声明即生效，通过 `this.bind` 绑定 + `emitUI` 发布到事件桥：

```html
<button data-content="page:saveBtn" data-emit="tap">保存</button>
<!-- → emitUI('saveBtn:tap', data, domEvent) -->
```

emitKey 格式为 `name:event`（如 `saveBtn:tap`），同一组件内多个 tap 可区分。

### bridges 配置

声明走事件桥发布的事件，其他组件通过 `eventBus.on` 监听：

```typescript
page.initialize({
    type: 'page',
    bridges: ['saveBtn:tap', 'cancelBtn:tap'],
});
```

### handlers 配置

绑定具体函数，直接执行：

```typescript
page.initialize({
    type: 'page',
    handlers: {
        'saveBtn:tap': (e) => { /* 保存逻辑 */ },
        'cancelBtn:tap': (e) => { /* 取消逻辑 */ },
    }
});
```

### 带特殊数据

在 handler 里处理完再手动 `emitUI`：

```typescript
handlers: {
    'saveBtn:tap': (e) => {
        const data = { id: this.selectedId, action: 'save' };
        this.emitUI('saveBtn:tap', data, e);
    }
}
```

### 选择建议

- **withTemplate 基础组件**：用 `data-event`，handler 写在类方法上
- **JSON 驱动动态组件**：用 `data-emit`，handler 在 handlers 配置中
- **跨组件通信**：用 `bridges` + `emitUI`，其他组件通过事件桥监听

## 7. 组件注册

```typescript
// 注册所有组件（启动时）
ComponentRegistrar.register('button', ButtonComponent);
ComponentRegistrar.register('grid', GridComponent);
ComponentRegistrar.register('home', HomePage);

// JSON 配置驱动时查找
const config = { type: 'grid', ... };
const GridClass = ComponentRegistrar.get(config.type);
const grid = new GridClass();
grid.initialize(config);
```

## 8. 应用启动

```typescript
// app.ts
const APP_TEMPLATE = `
<div class="app">
    <div data-content="app:page"></div>
</div>
`;

const AppBase = TemplateComponent.withTemplate(APP_TEMPLATE);
export class App extends AppBase {}

// main.ts
const app = new App();
app.initialize({
    type: 'app',
    children: [
        { target: 'page', type: 'home' },
    ]
});
```

**要点**：
- 启动入口必须使用 withTemplate 强类
- 不能 `new TemplateComponent()`，因为没有模板

## 9. 多区域组件

```typescript
// Dialog 是多区域组件
class Dialog extends TemplateComponent {
    static isMultiArea = true;
}

const DIALOG_TEMPLATE = `
<div class="q-dialog">
    <div data-content="dialog:header"></div>
    <div data-content="dialog:body"></div>
    <div data-content="dialog:footer"></div>
    <button data-content="dialog:closeBtn" data-event="tap">×</button>
</div>
`;

const DialogComponent = Dialog.withTemplate(DIALOG_TEMPLATE);
// 属性名：dialogHeader, dialogBody, dialogFooter
// 事件 handler：onDialogCloseBtn
```

## 10. 反模式

### 不要裸实例化 TemplateComponent

```typescript
// 错误
const comp = new TemplateComponent();
comp.initialize({ type: 'button' });

// 正确
const button = new ButtonComponent();
button.initialize({ type: 'button' });
```

### 不要在运行时拼接模板后走 TemplateRegistrar

```typescript
// 错误
TemplateRegistrar.register('dynamic-row', rowTemplateHtml);
const row = new RowBase();
row.initialize({ type: 'dynamic-row' });

// 正确
const DynamicRow = RowBase.withTemplate(rowTemplateHtml);
const row = new DynamicRow();
```

### 不要用 withAbilities 注入 DOM 节点相关功能

```typescript
// 错误 — 选择列是 DOM 节点，不能靠能力注入
const Row = RowBase.withTemplate(BASE_ROW_TEMPLATE).with(SelectionAbility);

// 正确 — 在模板中声明选择列节点
const Row = RowBase.withTemplate(SELECTABLE_ROW_TEMPLATE);
```

### 不要直接用 addEventListener 绑定 DOM 事件

```typescript
// 错误 — 绕过 event-dom，无法跨平台
node.el.addEventListener('click', handler);

// 正确 — 使用 this.bind，自动适配 pointer/touch/mouse
this.bind(node.el, 'tap');
this.on('tap', handler);
```
