# withTemplate 最佳实践

> 日期：2026-07-23
> 状态：当前有效

## withTemplate 是什么

`withTemplate` 是组件系统的核心工厂方法，接收 HTML 模板字符串、JSON 模板数组或 ComponentTemplate 对象，在**类定义时**预编译，生成内部类（InnerComponent），闭包基类（ComponentFactory）保存内部类引用。实例化时根据 `when` 条件选择内部类，返回内部类实例。

**为什么用 withTemplate**：

1. **性能** — 类定义时预编译（提取节点、生成属性、预编译事件），实例化时纯克隆（cloneNode + 填引用），零字符串处理开销
2. **类型安全** — 模板声明了什么节点，强类就有什么属性，编译期可检查
3. **跨平台** — 事件绑定使用 event-dom 规范命名（`tap`/`click`/`input`/`change`），自动适配 pointer/touch/mouse
4. **统一架构** — 所有组件都是 withTemplate 强类，不需要区分模板组件和 JSON 组件
5. **多模板支持** — 同一闭包类可关联多个模板，按 `when` 条件选择，零代理

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
| CSS 类名 | `class`（JS 保留字） | `cls` |
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

## 12. 多模板条件选择（TplVariant）

同一闭包类可关联多个模板，实例化时根据 `when` 条件自动选择：

```typescript
import type { ComponentTemplate, TplVariant } from '@qimenjs/component-core';

const InputTemplate: ComponentTemplate = {
    tpl: [
        { tpl: { tag: 'div', cls: 'q-input--top', children: [...] }, when: (cfg) => cfg.labelPosition === 'top' },
        { tpl: { tag: 'div', cls: 'q-input--left', children: [...] }, when: (cfg) => cfg.labelPosition === 'left' },
        { tpl: { tag: 'div', cls: 'q-input--default', children: [...] } },  // 兜底
    ],
    body: {
        type: 'input',
        onInput(e) { /* ... */ },
    },
};

// 使用：按配置自动选择模板
const input1 = new InputComponent({ labelPosition: 'top' });    // → 匹配 q-input--top
const input2 = new InputComponent({ labelPosition: 'left' });   // → 匹配 q-input--left
const input3 = new InputComponent({});                           // → 兜底 q-input--default
```

**要点**：
- `tpl` 为 `TplVariant[]` 时，每个变体有 `tpl` + 可选 `when` 条件
- `when(props)` 返回 `true` 的首个变体胜出
- `when` 省略 → 兜底匹配，放在数组末尾
- 全部不匹配 → 抛出 `ComponentError(COMPONENT_TPL_KEY_NOT_FOUND)`
- 运行时切换模板：销毁旧实例 + 创建新实例 + 替换 el 位置

## 13. 子组件插槽替换

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

## 14. 通用属性体系（两层架构）

组件属性操作采用两层架构，不再为每个节点自动生成 `xxxCls`/`xxxHidden` 等描述符。

### 13.1 Layer 1 — root 属性 + 方法

root 属性直接通过 getter/setter 操作根元素：

```typescript
const btn = new ButtonComponent();
btn.cls = 'primary';                     // → el.className = 'primary'
btn.hidden = true;                        // → el.hidden = true
btn.width = 200;                          // → el.style.width = '200px'
btn.border = { width: 1, color: 'red' }; // → el.style.border = '1px solid red'
```

cls 相关方法（root 默认，可传 nodeName 切换到子节点）：

```typescript
btn.addCls('active');            // → el.classList.add('active')
btn.removeCls('active');         // → el.classList.remove('active')
btn.toggleCls('active');         // → el.classList.toggle('active')
btn.toggleCls('active', true);   // → el.classList.toggle('active', true)
```

### 13.2 Layer 2 — 子节点方法（nodeName 在末尾，可选）

方法重载：nodeName 在末尾，不传默认操作 root：

```typescript
const navItem = new NavItemComponent();
navItem.addCls('active', 'expand');      // → expand.classList.add('active')
navItem.removeCls('active', 'expand');   // → expand.classList.remove('active')
navItem.toggleCls('active', 'expand');   // → expand.classList.toggle('active')
```

属性方法：`setNodeXxx(value, nodeName?)`

```typescript
navItem.setNodeCls('q-nav-item--active', 'expand');
navItem.setNodeHidden(true, 'expand');
navItem.setNodeWidth(200, 'expand');
navItem.setNodeBorder({ width: 1 }, 'expand');
navItem.setNodeAriaExpanded(true, 'expand');
```

通用兜底：`setNodeProp(prop, value, nodeName?)`

```typescript
navItem.setNodeProp('tabIndex', 0, 'expand');
```

### 13.3 内容属性（保留自动生成）

内容属性仍由 `addContentPropDesc` 自动生成 getter/setter：

```typescript
btn.text = 'Click me';    // → el.textContent = 'Click me'（纯文本，安全）
btn.html = '<b>Bold</b>'; // → el.innerHTML = '<b>Bold</b>'（HTML 内容）
btn.value = 'hello';      // → el.value = 'hello'（input 标签）
btn.src = '/img.png';     // → el.src = '/img.png'（img 标签）
```

> **text vs html**：`text` 使用 `textContent`（纯文本，自动转义 HTML），`html` 使用 `innerHTML`（可插入 HTML 标签）。contentMode 为 `html` 的节点映射到 `html` 属性，`text` 映射到 `text` 属性。

### 13.4 组件引用（保留 $name 访问器）

组件子节点仍自动生成 `$name` 访问器：

```typescript
const panel = new PanelComponent();
panel.$expand;    // → 返回 expand 子组件实例
panel.$body;      // → 返回 body 子组件实例
```

不再自动生成 `expandCls`/`expandHidden` 等属性转发，改用：
- `panel.setNodeCls('xxx', 'expand')` — 通过 CommonPropsAbility
- `panel.$expand.cls = 'xxx'` — 直接访问子组件

### 13.5 复杂属性简写

```typescript
// MarginPadding — 支持 horizontal/vertical 简写
btn.margin = 8;                              // → '8px'
btn.margin = '1rem';                         // → '1rem'
btn.margin = { top: 4, right: 8 };           // → '4px 8px 0 8px'
btn.margin = { horizontal: 8, vertical: 4 }; // → '4px 8px'

// Border — 支持单边覆盖
btn.border = 1;                              // → '1px solid'
btn.border = { width: 2, color: 'red' };     // → '2px solid red'
btn.border = { top: { width: 1 }, bottom: { width: 2 } }; // 单边覆盖
```

### 13.6 root 属性完整列表

CommonPropsAbility 提供的 root getter/setter（与 DEFAULT_NODE_PROP_MAP 对齐）：

| 属性 | DOM 操作 | 说明 |
|------|---------|------|
| `cls` | el.className | CSS 类名 |
| `style` | el.style | 内联样式 |
| `hidden` | el.hidden | 隐藏状态 |
| `disabled` | el.disabled | 禁用状态 |
| `order` | el.style.order | flex 顺序 |
| `role` | el.role / setAttribute | ARIA role |
| `ariaLabel` | el.ariaLabel / setAttribute | ARIA label |
| `ariaChecked` | el.ariaChecked / setAttribute | ARIA checked |
| `ariaDisabled` | el.ariaDisabled / setAttribute | ARIA disabled |
| `ariaExpanded` | el.ariaExpanded / setAttribute | ARIA expanded |
| `ariaSelected` | el.ariaSelected / setAttribute | ARIA selected |
| `ariaHidden` | el.ariaHidden / setAttribute | ARIA hidden |
| `width` | el.style.width | 宽度（数字自动 px） |
| `height` | el.style.height | 高度（数字自动 px） |
| `x` | el.style.left | 水平位置（数字自动 px） |
| `y` | el.style.top | 垂直位置（数字自动 px） |
| `margin` | el.style.margin | 外边距 |
| `padding` | el.style.padding | 内边距 |
| `fontSize` | el.style.fontSize | 字号（数字自动 px） |
| `color` | el.style.color | 文字颜色 |
| `bg` | el.style.background | 背景 |
| `cursor` | el.style.cursor | 光标样式 |
| `border` | el.style.border | 边框 |

### 13.7 命名冲突检测

编译时自动检测 DOM 子节点名和组件 body/props 中的属性重名，输出控制台警告：

```
[QimenJS] 命名冲突：DOM 子节点名 "label" 与组件自身属性重名。建议修改子节点名以避免冲突。
```

## 15. nodeMap 一级结构（v2）

v2 模式下 nodeMap 为一级结构，直接用 name 访问：

```typescript
// v1（旧）：二级结构
this.nodeMap['dialog']['header'].el    // ❌ 已废弃

// v2（新）：一级结构
this.nodeMap['header'].el              // ✅ 推荐
```

**name 来源**：TplNode 的 `name` 或 `content` 属性，支持冒号语法（如 `dialog:header`），冒号后的部分作为 name。

### 14.1 根节点也在 nodeMap 中

根节点（`root`）在编译时自动写入 nodeMap，path 为 `[]`，el 指向 `this.el`：

```typescript
this.nodeMap['root']       // { name: 'root', el: this.el, cls: ..., events: ... }
this.nodeMap['root'].el    // === this.el
```

**统一收益**：
- 根节点 events 声明后自动走 `bindDomEventBindings`，无需手动 `bind`/`addEventListener`
- `_updateNode('root', ...)` / `_setNodeProp('root', ...)` / `_markNodeDirty('root', ...)` 与子节点完全统一
- `_resolveNodeEl` 不再需要 `if (nodeName === 'root')` 特判
- 根节点属性（cls/style/flex/grid/role/attrs/events）编译时统一进入 nodeMetas

## 16. body.bridges 声明式桥接

在 ComponentTemplate 的 body 中声明桥接事件配置，替代 static eventBridge：

```typescript
const TEMPLATE: ComponentTemplate = {
    tpl: { tag: 'div', children: [...] },
    body: {
        type: 'myComponent',
        bridges: {
            pagination: 'myPager',
            crud: { source: 'myGrid', actions: ['create', 'delete'] },
        },
        onPageChange(e) { /* ... */ },
        onCreate(e) { /* ... */ },
    },
};
```

body 中的特殊 key 处理：

| key | 处理方式 |
|-----|---------|
| `type` | 设为静态属性（组件类型标识） |
| `bridges` | 映射为 eventBridge 静态属性 |
| `forwards` | 存为 _forwards 静态属性（属性/方法透传配置） |
| `listens` | 存为静态属性（统一事件订阅配置，初始化时自动绑定） |
| 函数 | 复制到原型（组件方法） |
| 其他 | 存到 static defaults（默认属性值） |

## 17. body.forwards 属性/方法透传

`forwards` 定义在 body 上，是属性和方法透传的统一入口，替代 TplNode 上的 `forward` 属性。

### 16.0 组件子节点属性操作

组件子节点不再自动生成 `iconCls`/`iconHidden` 等属性转发描述符，改用两层架构方法：

```typescript
// ❌ 旧方式（已移除）：自动生成 xxxCls/xxxHidden 属性
this.iconCls = 'active';
this.iconHidden = true;

// ✅ 新方式：setNodeXxx 方法
this.setNodeCls('active', 'icon');
this.setNodeHidden(true, 'icon');

// ✅ 或直接访问子组件
this.$icon.cls = 'active';
this.$icon.hidden = true;
```

`$name` 组件引用仍自动生成，`forwards` 仅在需要**深层路径透传**或**自定义属性透传**时使用。

### 16.1 基本写法

```typescript
const DIALOG_TEMPLATE: ComponentTemplate = {
    tpl: {
        tag: 'div',
            cls: 'q-dialog',
            children: [
            { name: 'header', type: HeaderComponent, cls: 'q-dialog__header' },
            { name: 'icon', type: IconComponent, cls: 'q-dialog__icon' },
        ]
    },
    body: {
        type: 'dialog',
        forwards: {
            title: 'header.title',   // 属性级透传
            icon: 'icon',            // 组件级透传
        },
    },
};
```

### 16.2 两种透传模式

**属性级透传**（`title: 'header.title'`）：

- `dialog.title` getter/setter → `headerComponent.title`
- 适用于将子组件的某个属性暴露到父组件

**组件级透传**（`icon: 'icon'`）：

- `dialog.icon` → 返回 iconComponent 实例
- `dialog.iconCls` → `iconComponent.cls`（通过 setNodeCls 或 $icon 访问）
- `dialog.iconStyle` → `iconComponent.el.style`
- `dialog.iconSize` → `iconComponent.size`
- `dialog.open()` → `iconComponent.open()`（方法代理）

### 16.3 深层透传

路径沿 nodeMap 逐级解析，中间组件无需声明任何 forwards：

```typescript
forwards: {
    icon: 'header.icon',   // → nodeMap.header.component.nodeMap.icon.component
}
```

body 是组合定义层，引用自己的组件树结构不算破坏封装。中间组件（如 Header）零感知，透传由组合层统一管控。

### 16.4 与 TplNode.forward 的关系

| | TplNode.forward | body.forwards |
|---|---|---|
| 定义位置 | 节点层 | 组合层（body） |
| 深层路径 | 不支持 | 支持（`header.icon`） |
| 方法代理 | 不支持 | 支持 |
| 统一性 | 分散在各节点 | 集中在 body |

`forwards` on body 是 `forward` on TplNode 的统一替代，推荐使用 `forwards`。

## 18. ItemGroup 派生组件

ItemGroupComponent 是子项管理的基座，领域组件通过 `replace` 派生，固化 itemType、defaultItem 和选择行为：

```typescript
// TabBar — 标签栏（单选，池化复用）
export let TabBarComponent = ItemGroupComponent.replace({
    type: 'TabBar',
    cls: 'q-tab-bar',
    itemsCls: 'q-tab-bar__items',
    config: {
        direction: 'horizontal',
        gap: '0',
        itemType: 'Toggle',
        itemDestroy: false,
        defaultItem: { events: { toggle: { bridges: ['toggle'] } } },
    },
    body: {
        onAfterInit(props) {
            this.on('toggle', (data) => this._onItemToggle(data));
        },
        selectAt(index, silent = false) { ... },
    },
});

// Menu — 菜单（垂直，分隔符不适合池化）
export let MenuComponent = ItemGroupComponent.replace({
    type: 'Menu',
    cls: 'q-menu',
    itemsCls: 'q-menu__content',
    config: {
        direction: 'vertical',
        itemType: 'MenuItem',
        defaultItem: { events: { click: { bridges: ['click'] }, select: { bridges: ['select'] } } },
    },
    body: { ... },
});

// Toolbar — 工具栏（异质子项，Map 形式 defaultItem）
export let ToolbarComponent = ItemGroupComponent.replace({
    type: 'Toolbar',
    cls: 'q-toolbar',
    itemsCls: 'q-toolbar__items',
    config: {
        direction: 'horizontal',
        gap: '4px',
        defaultItem: {
            button: { events: { click: { bridges: ['click'] } } },
            input:  { events: { input: { bridges: ['input'] } } },
        },
    },
    body: {},
});
```

派生组件复用池化、事件转发、溢出处理，零手动 DOM。详见 [ItemGroup 最佳实践](./itemgroup-best-practices.md)。

## 19. 组件定义模式

### 18.1 body 定义（推荐）

所有逻辑归入 body，不使用 class extends 扩展层。body 方法中使用 `const self = this as any` 访问能力注入的方法和属性：

```typescript
export let MyComponent = TemplateComponent.withTemplate({
    tpl: { ... },
    body: {
        type: 'MyComponent',
        _state: null,
        _initMyComponent(props) {
            const self = this as any;
            self.emit('ready');
        },
        get state() {
            const self = this as any;
            return self._state;
        },
        doSomething() {
            const self = this as any;
            self.setNodeCls('active', 'root');
        },
        onBeforeDispose() {
            const self = this as any;
            self._cleanup();
        },
        onDisposed() {
            // dispose 完成后的回调
        },
    },
});
```

> **`const self = this as any` 模式**：withAbilities 将能力方法注入到类原型上，TypeScript 无法通过 body 对象字面量的类型推断感知这些方法。使用 `self` 局部变量避免箭头函数中 `this` 丢失，`as any` 绕过类型检查。

### 18.2 replace 派生（ItemGroup 领域扩展）

从 ItemGroupComponent 通过 `replace` 派生，固化领域逻辑：

```typescript
export let MyGroupComponent = ItemGroupComponent.replace({
    type: 'MyGroup',
    cls: 'q-my-group',
    config: {
        itemType: 'MyItem',
        defaultItem: { events: { click: { bridges: ['click'] } } },
    },
    body: {
        selectAt(index) { ... },
    },
});
```

### 18.3 语义别名

无独立实现的组件，直接引用已有组件：

```typescript
export const DropdownComponent = ButtonComponent;
```

## 20. 模板片段（TplFragment）

### 19.1 什么是模板片段

`TplFragment` 是可复用的节点定义集合，编译前内联展开为普通 `children`，不创建组件边界，无透传问题。

### 19.2 与组件（type）的区别

| | `type: HeaderComponent` | `fragment: HeaderFragment` |
|---|---|---|
| 组件边界 | 有，需要 `forwards` 透传 | 无，节点直接属于父组件 |
| 访问方式 | `this.header.icon`（跨组件） | `this.headerIcon`（直接访问） |
| CSS 作用域 | 需要 `:deep()` 穿透 | 自然继承父组件作用域 |
| 行为封装 | 组件可携带方法 | 纯结构，行为由父组件 + Ability 提供 |

### 19.3 定义和使用

```typescript
import type { TplFragment } from '@qimenjs/component-core';

const HeaderFragment: TplFragment = {
    name: 'header',
    children: [
        { tag: 'i', name: 'icon', cls: 'q-header__icon', hidden: true },
        { tag: 'div', name: 'title', cls: 'q-header__title' },
        { tag: 'i', name: 'action', cls: 'q-header__action', hidden: true },
    ],
};

// 使用：fragment 的 children 展开到 div 内
// name 自动变为 header:icon / header:title / header:action
export let CardComponent = TemplateComponent.withTemplate({
    tpl: {
        tag: 'div',
        cls: 'q-card',
        children: [
            { tag: 'div', cls: 'q-card__header', fragment: HeaderFragment },
            { tag: 'div', name: 'body', cls: 'q-card__body' },
        ],
    },
    body: {
        type: 'Card',
        _initCard(props) {
            if (props?.title) this.headerTitle = props.title;
            if (props?.icon) { this.headerIcon = props.icon; this.headerIconHidden = false; }
        },
    },
});
```

### 19.4 编译流程

```
compilePendingTemplate
  → expandFragments(tpl)      // 预处理：fragment → children + 自动命名空间
  → compileTemplate(expanded)  // 正常编译，完全不知道 fragment 的存在
```

展开后与手写 `children` 无异，`nodeMetas`、`indexPath`、`child-node-props` 全部走正常路径。

### 19.5 与 nodeOverrides 配合

展开后的节点名带命名空间，`nodeOverrides` 用全名覆盖。`events` 为全覆盖语义（不合并）：

```typescript
export let DialogCardComponent = CardComponent.replace({
    nodeOverrides: {
        'header:action': {
            hidden: false,
            events: { click: { bridges: ['close'] } },
        },
    },
});
```

## 20. 图标使用原则

### 20.1 用 HTML 节点，不用 IconComponent

按钮、菜单项、头部等组件中的装饰性图标，使用 HTML `<i>` 节点，不使用 `IconComponent`：

```typescript
// ✅ 推荐：HTML 节点
{ tag: 'i', name: 'icon', cls: 'q-button__icon' }

// ❌ 避免：IconComponent（需要透传）
{ name: 'icon', type: IconComponent, cls: 'q-button__icon' }
```

### 20.2 原因

| | HTML `<i>` | IconComponent |
|---|---|---|
| 透传 | 零成本，`this.icon = 'save'` | 需要 `forwards` + 8 个自动生成属性 |
| CSS | 父组件直接控制 | 需要 `:deep()` 或 `cls` 属性透传 |
| DOM | 扁平，`<i>` 直接在父容器内 | 多一层 `div.q-icon-wrap` |
| 位置 | CSS 直接控制 | 需要 JS 逻辑 |

### 20.3 IconComponent 保留场景

`IconComponent` 保留给需要独立行为封装的特殊用途。大多数场景用 HTML 节点 + CSS 即可。
