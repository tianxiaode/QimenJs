# withTemplate 最佳实践

> 日期：2026-07-12
> 状态：当前有效

## withTemplate 是什么

`withTemplate` 是 `TemplateComponent` 的静态工厂方法，接收 HTML 模板字符串、JSON 模板数组或 ComponentTemplate 对象，在**类定义时**预编译，返回一个带模板的强类。

**为什么用 withTemplate**：

1. **性能** — 类定义时预编译（提取节点、生成属性、预编译事件），实例化时纯克隆（cloneNode + 填引用），零字符串处理开销
2. **类型安全** — 模板声明了什么节点，强类就有什么属性，编译期可检查
3. **跨平台** — 事件绑定使用 event-dom 规范命名（`tap`/`click`/`input`/`change`），自动适配 pointer/touch/mouse
4. **统一架构** — 所有组件都是 withTemplate 强类，不需要区分模板组件和 JSON 组件

## 核心原则

**所有组件都是 withTemplate 强类，没有例外。**

## 1. 推荐写法

```typescript
import { TemplateComponent } from '@qimenjs/component-core';
import { HOME_TEMPLATE } from '@qimenjs/component-core';

class HomePage extends TemplateComponent.withTemplate(HOME_TEMPLATE) {
    // static 配置 — 类级别，所有实例共享
    static children = [
        { target: 'grid', type: 'grid', columns: [...] },
    ];
    static bridges = ['saveBtn:tap', 'cancelBtn:tap'];

    // handler — 直接写方法，自动发现
    onSaveBtnTap(e) { /* 保存逻辑 */ }
    onCancelBtnTap(e) { /* 取消逻辑 */ }
}

// 实例化 — 不需要 initialize，构造即完整
const home = new HomePage();

// 动态覆盖 — props 可覆盖 static 配置
const home2 = new HomePage({ children: [...], data: someData });
```

**要点**：
- `class Xxx extends TemplateComponent.withTemplate(tpl)` — 模板是类定义的一部分
- `static children` / `static bridges` — 类级别配置，所有实例共享
- `onXxx` 方法 — 外部事件自动发现，不需要 handlers 配置映射
- `new Xxx()` 即完整实例，不需要再调 `initialize()`
- `new Xxx(props)` 可覆盖 static 配置，满足动态场景

### 配置优先级

```
static 属性（类定义时） < props 参数（实例化时）
```

props 会覆盖同名的 static 配置。children 和 bridges 会浅拷贝，不会污染 static。

## 2. 基础组件定义

```typescript
// Button.ts
import { TemplateComponent } from '@qimenjs/component-core';
import { BUTTON_TEMPLATE } from '@qimenjs/component-core';

class ButtonComponent extends TemplateComponent.withTemplate(BUTTON_TEMPLATE) {
    static readonly abilities = [ContentAbility, ClickAbility, DisableAbility, LoadingAbility, SizeAbility];
    static readonly elTag = 'button';

    // 内部事件 — data-event 声明，handler 名自动推导
    onClick(e) {
        // 按钮点击逻辑
    }
}
```

**要点**：
- 模板从 `@qimenjs/component-core` 导入，不在组件文件中定义
- `data-content` 声明节点，自动生成同名属性（`this.text`、`this.icon`）
- `data-event` 声明内部事件，handler 名自动推导（`onClick`）

## 3. 页面组件定义

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

class HomePage extends TemplateComponent.withTemplate(HOME_TEMPLATE) {
    static children = [
        { target: 'grid', type: 'grid', columns: [...] },
    ];
    static bridges = ['saveBtn:tap', 'cancelBtn:tap'];

    onSaveBtnTap(e) { /* 保存 */ }
    onCancelBtnTap(e) { /* 取消 */ }
}

// 路由注册 — 只指定组件名
router.register('home', HomePage);
```

**要点**：
- 页面也是 withTemplate 强类，和基础组件写法一致
- `data-i18n` 声明翻译 key，自动翻译
- 子组件位置用 `data-content` 声明，`static children` 配置填入
- 路由只管组件名，实例化时自动从 static 读取配置

## 4. Grid 行强类

```typescript
// 行模板定义
const SELECTABLE_ROW_TEMPLATE = `
<div class="q-row">
    <div data-content="row:selector" data-emit="tap">
        <input type="checkbox" data-content="row:checkbox" />
    </div>
    <div data-content="row:cells"></div>
</div>
`;

const EDITABLE_ROW_TEMPLATE = `
<div class="q-row">
    <div data-content="row:selector" data-emit="tap">
        <input type="checkbox" data-content="row:checkbox" />
    </div>
    <div data-content="row:id"></div>
    <div data-content="row:cells"></div>
    <div data-content="row:actions">
        <button data-content="row:editBtn" data-emit="tap">编辑</button>
        <button data-content="row:deleteBtn" data-emit="tap">删除</button>
    </div>
</div>
`;

// 行强类 — 可复用
class SelectableRow extends TemplateComponent.withTemplate(SELECTABLE_ROW_TEMPLATE) {
    static bridges = ['selector:tap'];
}

class EditableRow extends TemplateComponent.withTemplate(EDITABLE_ROW_TEMPLATE) {
    static bridges = ['selector:tap'];
    onEditBtnTap(e) { /* 编辑 */ }
    onDeleteBtnTap(e) { /* 删除 */ }
}

// Grid 使用 — 直接 new
for (const item of items) {
    const row = new EditableRow({ data: item });
    this.el.appendChild(row.el);
}
```

**要点**：
- 行强类在外部定义，Grid 只是引用
- 模板声明了什么节点，withTemplate 就预编译出什么属性
- 不需要额外配置来声明"是否启用选择列"——模板里有就有，没有就没有
- 不同行模板生成不同强类，互不干扰
- `new RowClass({ data: item })` 即完整实例

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

### 外部事件（data-emit）— 三种模式

向外发布的事件，通过 `this.bind` 绑定。三种模式按优先级：

**1. bridges — 走事件桥发布**

```typescript
class HomePage extends TemplateComponent.withTemplate(tpl) {
    static bridges = ['saveBtn:tap', 'cancelBtn:tap'];
}
// → emitUI('saveBtn:tap', data, domEvent)，其他组件通过 eventBus.on 监听
```

**2. onXxx 方法 — 自动发现绑定**

emitKey 驼峰化为方法名，自动绑定：

| emitKey | 方法名 |
|---------|--------|
| `saveBtn:tap` | `onSaveBtnTap` |
| `cancelBtn:click` | `onCancelBtnClick` |
| `submit` | `onSubmit` |

```typescript
class HomePage extends TemplateComponent.withTemplate(tpl) {
    onSaveBtnTap(e) { /* 保存逻辑 */ }
    onCancelBtnTap(e) { /* 取消逻辑 */ }
}
```

**3. 默认 — 走事件桥发布**

既不在 bridges 中，也没有 onXxx 方法，自动走 emitUI 发布。

### 选择建议

- **需要跨组件通信**：用 `bridges`，其他组件通过事件桥监听
- **组件自身处理**：写 `onXxx` 方法，自动发现绑定
- **不需要处理**：默认走事件桥，其他组件可监听

## 7. 组件注册

```typescript
// 注册所有组件（启动时）
ComponentRegistrar.register('button', ButtonComponent);
ComponentRegistrar.register('grid', GridComponent);
ComponentRegistrar.register('home', HomePage);

// 路由配置 — 只指定组件名
{ path: '/home', component: 'Home' }

// JSON 配置驱动时查找
const config = { type: 'grid', ... };
const GridClass = ComponentRegistrar.get(config.type);
const grid = new GridClass(config);
```

## 8. 应用启动

```typescript
// app.ts
const APP_TEMPLATE = `
<div class="app">
    <div data-content="app:page"></div>
</div>
`;

class App extends TemplateComponent.withTemplate(APP_TEMPLATE) {
    static children = [
        { target: 'page', type: 'home' },
    ];
}

// main.ts
const app = new App();
document.body.appendChild(app.el);
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

class DialogComponent extends Dialog.withTemplate(DIALOG_TEMPLATE) {
    // 属性名：dialogHeader, dialogBody, dialogFooter
    // 事件 handler：onDialogCloseBtn
}
```

## 10. 反模式

### 不要裸实例化 TemplateComponent

```typescript
// 错误
const comp = new TemplateComponent();
comp.initialize({ type: 'button' });

// 正确
const button = new ButtonComponent();
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

### 不要用 handlers 配置映射 onXxx 方法

```typescript
// 错误 — 多余的映射，onXxx 方法会被自动发现
class Home extends TemplateComponent.withTemplate(tpl) {
    static handlers = {
        'saveBtn:tap': 'onSaveBtnTap',
    };
    onSaveBtnTap(e) { /* ... */ }
}

// 正确 — 直接写方法，自动发现
class Home extends TemplateComponent.withTemplate(tpl) {
    onSaveBtnTap(e) { /* ... */ }
}
```

### 不要忘记 static 关键字

```typescript
// 错误 — children/bridges 是类级别配置，必须用 static
class Home extends TemplateComponent.withTemplate(tpl) {
    children = [...];   // 实例属性，每次 new 都重新创建
    bridges = [...];    // 实例属性，浪费内存
}

// 正确 — static 属性，所有实例共享
class Home extends TemplateComponent.withTemplate(tpl) {
    static children = [...];
    static bridges = [...];
}
```

## 11. JSON 模板

withTemplate 支持三种模板格式：

### 11.1 HTML 字符串（原始格式）

```typescript
const TEMPLATE = '<div data-content="x:label"></div>';
class MyComponent extends TemplateComponent.withTemplate(TEMPLATE) { }
```

### 11.2 旧版 JsonTemplateNode[]（向后兼容）

```typescript
import type { JsonTemplateNode } from '@qimenjs/component-core';

const BUTTON_TEMPLATE: JsonTemplateNode[] = [
    { tag: 'span', content: 'button:icon' },
    { tag: 'span', content: 'button:text' },
];

class ButtonComponent extends TemplateComponent.withTemplate(BUTTON_TEMPLATE) {
    onClick() { /* ... */ }
}
```

**JSON 模板字段速查**：

| 字段 | 对应 HTML 属性 | 说明 |
|------|---------------|------|
| `content` | `data-content` | 元素身份标识（必须） |
| `event` | `data-event` | 内部事件声明 |
| `emit` | `data-emit` | 外部事件声明 |
| `target` | `data-target` | 事件委托目标选择器 |
| `json` | `data-json` | JSON 组件定义引用 |
| `jsonMode` | `data-json-mode` | JSON 渲染模式 |
| `template` | `data-template` | 嵌套模板引用 |
| `i18n` | `data-i18n` | 国际化翻译 key |
| `hidden` | `data-hidden` | 初始隐藏状态（`hidden: true` → `el.hidden = true`） |
| `class` | `class` | CSS 类名 |
| `style` | `style` | 内联样式 |
| `tag` | — | DOM 标签名，默认 `div` |
| `text` | — | 文本内容 |
| `attrs` | — | 其他 HTML 属性 |
| `children` | — | 子节点 |

### 11.3 新版 ComponentTemplate（推荐）

```typescript
import type { ComponentTemplate } from '@qimenjs/component-core';

const BUTTON_TEMPLATE: ComponentTemplate = {
    tpl: {
        tag: 'div',
        children: [
            { tag: 'span', name: 'button:icon', content: 'icon' },
            { tag: 'span', name: 'button:text', content: 'text' },
        ]
    },
    body: {
        onClick(e) { /* ... */ },
    },
};

class ButtonComponent extends TemplateComponent.withTemplate(BUTTON_TEMPLATE) { }
```

**新格式改进**：

| 改进 | 旧版 | 新版 |
|------|------|------|
| 索引键与语义分离 | `content: 'button:icon'` | `name: 'button:icon', content: 'icon'` |
| 三类事件分离 | `event`/`emit` | `events`/`forwards`/`bridges` |
| CSS 类名 | `class`（JS 保留字） | `className` |
| 模板携带方法 | 不支持 | `body: { onClick() {} }` |
| 组件占位 | `json` 字段 | `type` 字段（与 tag 互斥） |

**三类事件**：

| 字段 | 语义 | 示例 | 说明 |
|------|------|------|------|
| `events` | 内部事件 | `['click']` | handler 名自动推导：click → onClick |
| `forwards` | 转发事件 | `['click=save']` | 通过 eventScope 转发给持有方 |
| `bridges` | 桥接事件 | `['click=click:save']` | 通过 EventBridge 跨组件通信 |

**事件修饰符**：

```typescript
events: ['click?once'],           // 只触发一次
events: ['input?debounce=300'],   // 300ms 防抖
events: ['scroll?throttle=100'],  // 100ms 节流
events: ['click?once&debounce=300'], // 组合修饰符
```

**forwards/bridges 重命名**：

```typescript
forwards: ['click'],           // 同名转发：component.on('click', fn)
forwards: ['click=save'],      // 重命名转发：component.on('save', fn)
bridges: ['click'],            // 同名桥接：bridgeEmit(eventKey, 'click', data)
bridges: ['click=save'],       // 重命名桥接：bridgeEmit(eventKey, 'save', data)
bridges: ['click=click:save'], // 带命名空间桥接：bridgeEmit(eventKey, 'click:save', data)
```

**body 定义**：

```typescript
const TEMPLATE: ComponentTemplate = {
    tpl: { tag: 'div', children: [...] },
    body: {
        // 方法 → 复制到原型
        onClick(e) { this.save(); },
        beforeClick(e) { this.validate(); },

        // 非函数属性 → 存到 static defaults
        defaultValue: '',
        maxItems: 100,
    },
};
```

**JSON 模板中声明子组件占位节点**：

```typescript
const CONTAINER_TEMPLATE: JsonTemplateNode[] = [
    { content: 'slot:body', json: MyGridComponent, jsonMode: 'replace' },
    { content: 'slot:panel', json: MyPanelComponent, jsonMode: 'child' },
];
```

- `json` 为组件类引用时，withTemplate 自动提取到 `_jsonComponentMap`
- `jsonMode: 'replace'` — 子组件 el 替换占位节点，记录 parentNode/nodeIndex
- `jsonMode: 'child'` — 子组件 el 挂载到占位节点内部

**子组件差异化配置**：

```typescript
class MyContainer extends TemplateComponent.withTemplate(CONTAINER_TEMPLATE) {
    static children = [
        { target: 'body', props: { columns: [...] } },
        { target: 'panel', props: { title: '详情' } },
    ];
}
```

## 12. 子组件插槽替换

需要动态替换子组件时，组合 ChildSlotAbility：

```typescript
import { ChildSlotAbility } from '@qimenjs/component-core';

class DynamicContainer extends TemplateComponent.withTemplate(TEMPLATE) {
    static readonly abilities = [ChildSlotAbility];

    switchToDetail() {
        this._replaceChildComponent('body', DetailComponent, { id: 123 });
    }

    switchToList() {
        this._replaceChildComponent('body', ListComponent);
    }
}
```

- `_replaceChildComponent` 自动销毁旧组件、在原位挂载新组件
- replace 模式利用 parentNode/nodeIndex 精确定位 DOM 位置
- child 模式清空占位节点内容后挂载新组件
