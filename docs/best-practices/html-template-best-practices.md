# 模板驱动机制

> 模板声明结构，框架自动推导属性和事件。组件只写业务逻辑，不写 DOM 操作。

## 一句话总结

模板通过 `data-content`、`data-event`、`data-emit` 三个属性声明元素身份和事件，`buildNodeMap()` 扫描后自动生成 getter/setter 属性和事件绑定，组件无需手动 querySelector + addEventListener。

---

## 核心流程

```
模板 HTML                    buildNodeMap()                    组件
─────────────────────────────────────────────────────────────────────
data-content="input:field"  →  nodeMap['input']['field']     →  this.field (getter/setter)
data-content="input:label"  →  nodeMap['input']['label']     →  this.label
data-event="input"          →  eventMap.internal[...]        →  this.onField(event, el)
data-emit="click"           →  eventMap.external[...]        →  this.emit('input:click', event)
data-json="UserGrid"        →  node.jsonRef                  →  Renderer 递归渲染子组件
data-template="RowTpl"      →  node.templateRef              →  注入嵌套模板片段
data-hidden="true"          →  meta.hidden → el.hidden       →  初始隐藏状态
```

### 渲染时序

| 阶段 | 操作 | 说明 |
|------|------|------|
| 阶段 2 | `initElement()` → `buildNodeMap()` | 扫描模板，构建 nodeMap + eventMap，生成属性 |
| 阶段 3a | `callInitProps(props)` | 各能力初始化 |
| 阶段 3a-2 | `initContentFromProps(props)` | 从 props 填充内容属性值 → setter 自动写 DOM |
| 阶段 3b | `callInitMethods()` | 能力 `__init__` 方法（ElementEventAbility 在此绑定事件） |
| 阶段 8b | `renderJsonSlots()` | 扫描 nodeMap 中 jsonRef 节点，递归渲染子组件 |

### 原型预热

`buildNodeMap()` 内部实现了原型预热优化：

- **首次实例化**：querySelectorAll 扫描 → 生成节点位置索引表 + 模板元数据 → getter/setter 定义到原型 → 索引表和元数据存到原型
- **后续实例化**：用 `el.children[idx]` 直接定位节点（跳过 querySelectorAll），从模板元数据读取事件信息（跳过 getAttribute），getter/setter 已在原型上（跳过 defineProperty）

对组件代码完全透明，无需任何改动。

---

## data-content — 元素身份

**必须**。每个需要被组件引用的元素都必须声明 `data-content`。

### 格式

```
data-content="group:name"
```

- **group** = 功能区域（如 `input`, `dialog`, `table`）
- **name** = 具体内容项（如 `field`, `label`, `close`）

group 是**区域语义**，不是内容类型。`input:label` 表示"输入框区域的标签"，不是 `text:label`。

### nodeMap 结构

`buildNodeMap()` 扫描后生成 `nodeMap`，按 group/name 分层：

```typescript
nodeMap = {
    input: {
        label:  { el, raw: 'input:label',  group: 'input', name: 'label' },
        field:  { el, raw: 'input:field',  group: 'input', name: 'field' },
        error:  { el, raw: 'input:error',  group: 'input', name: 'error' },
    },
}
```

### 自动生成的内容属性

`buildNodeMap()` 为每个节点自动生成 getter/setter，命名由 `static isMultiArea` 决定：

| `isMultiArea` | 属性名规则 | 示例 |
|---|---|---|
| `false`（默认） | name | `this.field`, `this.label`, `this.close` |
| `true` | group + Name 驼峰 | `this.dialogHeader`, `this.dialogClose` |

每个节点同时生成 `xxxHidden` 属性控制显隐：

```typescript
this.field = 'hello';        // setter → input.value = 'hello'
this.fieldHidden = true;     // setter → input.hidden = true
```

### mode 自动推导

setter 的读写方式由元素标签自动推导：

| 标签 | mode | getter | setter |
|------|------|--------|--------|
| `<input>`, `<select>`, `<textarea>` | value | `el.value` | `el.value = v` |
| `<img>` | src | `el.src` | `el.src = v` |
| 其他 | html | `el.innerHTML` | `el.innerHTML = v` |

### isMultiArea 声明

```typescript
// 单区域组件（默认）— 属性名用 name
class InputComponent extends ComponentBase {
    // isMultiArea 默认 false
    // data-content="input:field" → this.field
}

// 多区域组件 — 属性名用 group + Name
class DialogComponent extends ComponentBase {
    static isMultiArea = true;
    // data-content="dialog:header" → this.dialogHeader
    // data-content="dialog:close"  → this.dialogClose
}
```

---

## data-event — 内部事件

**可选**。声明元素需要绑定的内部事件，方法名从 `data-content` 自动推导。

### 格式

```
data-event="event1[?modifier][, event2]"
```

- 事件类型用逗号分隔
- 修饰符用 `?` 前缀，`&` 连接多个

### 修饰符

| 修饰符 | 含义 | 示例 |
|--------|------|------|
| `?once` | 只触发一次 | `data-event="click?once"` |
| `?delegate` | 事件委托 | `data-event="click?delegate"` |
| 组合 | 多修饰符 | `data-event="click?once&delegate"` |

### 方法名推导

与内容属性命名规则一致：

| `isMultiArea` | 方法名规则 | 示例 |
|---|---|---|
| `false`（默认） | onName | `onField`, `onClose`, `onBodyScroll` |
| `true` | onGroupName | `onDialogClose`, `onInputField` |

### 示例

```html
<!-- 单区域组件 -->
<input data-content="input:field" data-event="input" />
<!-- → 方法名 onField -->

<button data-content="dialog:close" data-event="click" />
<!-- → 方法名 onClose（dialog 是单区域组件） -->

<!-- 多区域组件 -->
<button data-content="dialog:close" data-event="click" />
<!-- → 方法名 onDialogClose（dialog 是多区域组件） -->

<!-- 多事件 -->
<button data-content="actions:submit" data-event="click, keydown" />
<!-- → 方法名 onSubmit，click 和 keydown 都调同一个方法 -->

<!-- 事件委托 -->
<div data-content="list:container" data-event="click?delegate" data-target=".list-item">
    <div class="list-item">Item 1</div>
    <div class="list-item">Item 2</div>
</div>
<!-- → 方法名 onContainer，ev.target.closest('.list-item') 匹配后调用 -->
```

### 组件中定义方法

```typescript
class InputComponent extends ComponentBase {
    // 方法名从 data-content="input:field" 推导：onField
    onField(_event: Event, el: HTMLInputElement): void {
        this.value = el.value;
    }
}
```

**不抛错**：如果方法不存在，JS 执行时自然报错，框架不主动检查。

---

## data-emit — 外部事件

**可选**。声明元素需要发射给外部监听者的事件。

### 格式

```
data-emit="event1[?modifier][, event2]"
```

### 工作方式

`ElementEventAbility` 自动 addEventListener，触发时 `this.emit('group:event', event)`。

与 EventBridge/handlers 结合：有定义就绑定，没有就不处理。

### 示例

```html
<!-- 外部事件：点击标题时 emit('header:click', event) -->
<span data-content="header:title" data-emit="click" />

<!-- 同时有内部事件和外部事件 -->
<button data-content="dialog:close" data-event="click" data-emit="mouseenter" />
<!-- → 内部：onClose(event, el) -->
<!-- → 外部：emit('dialog:mouseenter', event) -->
```

---

## data-target — 事件委托目标

**可选**。配合 `data-event="click?delegate"` 使用，声明事件委托的目标选择器。

```html
<div data-content="list:container" data-event="click?delegate" data-target=".list-item">
    <div class="list-item">Item 1</div>
    <div class="list-item">Item 2</div>
</div>
```

触发时 `ev.target.closest('.list-item')` 匹配，匹配成功则调用方法，参数为 `(event, matchedTarget)`。

---

## data-json — JSON 子组件引用

**可选**。在模板中声明一个占位节点，Renderer 从 TemplateRegistrar 取 JSON LayoutNode 定义，递归渲染子组件。

### 格式

```
data-json="DefinitionId"
data-json-mode="child|replace"   <!-- 可选，默认 replace -->
```

### 工作方式

1. `buildNodeMap()` 扫描到 `data-json`，将 `jsonRef` 和 `jsonMode` 存入 `NodeMetadata`
2. Renderer 阶段 8b `renderJsonSlots()` 扫描 nodeMap 中有 `jsonRef` 的节点
3. 从 `TemplateRegistrar.getJson(jsonRef)` 取 LayoutNode 定义
4. 递归调用 `this.render(layout)` 渲染子组件
5. 根据模式挂载

### 挂载模式

| `data-json-mode` | 行为 | 适用场景 |
|-----------------|------|---------|
| `replace`（默认） | 子组件 el 替换占位节点 | 子组件有独立根元素，不需要额外包裹层 |
| `child` | 子组件 el 挂载到占位节点内 | 需要保留占位节点作为容器（如 flex 布局） |

### 示例

```html
<!-- replace 模式：UserGrid 组件替换这个 div -->
<div data-content="page:grid" data-json="UserGrid"></div>

<!-- child 模式：UserGrid 组件挂载到这个 div 内 -->
<div data-content="page:grid" data-json="UserGrid" data-json-mode="child"></div>
```

### 注册 JSON 定义

```typescript
const templateRegistrar = RegistryHub.get<TemplateRegistrar>('template');

// 注册 HTML 模板
templateRegistrar.register('Input', '<span data-content="input:label"></span>...');

// 注册 JSON 组件定义
templateRegistrar.registerJson('UserGrid', {
    type: 'Table',
    props: { columns: [...] },
    children: [...]
});
```

---

## data-template — 嵌套模板注入

**可选**。在模板中声明一个容器节点，从 TemplateRegistrar 取 HTML 模板片段注入到该节点内，实现模板拼接模板。

### 格式

```
data-template="TemplateId"
```

### 工作方式

1. `buildNodeMap()` 在 querySelectorAll 之前调用 `injectTemplates()`
2. 扫描所有带 `data-template` 的元素
3. 从 TemplateRegistrar 取 HTML 模板，注入 DocumentFragment 到该元素内
4. 注入后的子模板中的 `data-content` 节点也会被后续 querySelectorAll 扫描到

### 与 data-json 的区别

| 特性 | `data-template` | `data-json` |
|------|----------------|-------------|
| 来源 | HTML 模板字符串 | JSON LayoutNode 定义 |
| 注入方式 | DocumentFragment 直接注入 | 走 Renderer 渲染流程 |
| 事件绑定 | 注入后由 buildNodeMap 统一处理 | 子组件独立处理 |
| 适用场景 | 纯结构拼接（无独立逻辑） | 需要独立生命周期的子组件 |

### 示例

```html
<!-- 主模板 -->
<div data-content="form:container" data-template="FormFields"></div>

<!-- FormFields 模板（单独注册） -->
<input data-content="form:username" class="q-field" />
<input data-content="form:password" class="q-field" type="password" />
```

---

## data-hidden — 初始隐藏状态

**可选**。声明元素在初始渲染时是否隐藏，运行时通过 `el.hidden` 控制。

### 格式

```
data-hidden="true"
```

### 工作方式

1. `precompileTemplate()` 解析 `data-hidden="true"`，将 `hidden: true` 写入 `NodeTemplateMeta`
2. `_buildNodeMapFromCompiled()` 构建 nodeMap 时，如果 `meta.hidden === true`，设置 `el.hidden = true`
3. 运行时通过 `xxxHidden` 属性（由 `buildContentProperties` 自动生成）或直接 `el.hidden` 控制显隐

### 与 `xxxHidden` 属性的关系

`buildContentProperties()` 为每个 `data-content` 节点自动生成 `xxxHidden` getter/setter，底层就是 `el.hidden`。`data-hidden` 只是设置初始状态，运行时用 `xxxHidden` 切换：

```typescript
// 模板声明初始隐藏
// <div data-content="toolbar:prevBtn" data-hidden="true">

// 运行时切换
this.prevBtnHidden = false;  // 显示
this.prevBtnHidden = true;   // 隐藏
```

### 与 `style="display:none"` 的区别

| 方式 | 语义 | 调试 | 与 xxxHidden 一致 |
|------|------|------|-------------------|
| `data-hidden="true"` | 声明式，语义清晰 | HTML 中可见 `data-hidden` | 一致，都是 `el.hidden` |
| `style="display:none"` | 命令式，混在通用样式中 | 不直观 | 不一致，`xxxHidden` 用 `el.hidden` |

**推荐**：用 `data-hidden` 而不是 `style="display:none"` 设置初始隐藏状态。

### JSON 模板中

```typescript
const TOOLBAR_TEMPLATE: JsonTemplateNode[] = [
    { tag: 'button', content: 'toolbar:prevBtn', hidden: true },
    { tag: 'div', content: 'toolbar:contentArea', style: 'display:flex;' },
    { tag: 'button', content: 'toolbar:nextBtn', hidden: true },
];
```

JSON 模板的 `hidden: true` 会被转换为 `data-hidden="true"`。

---

## 行组件模式 — Table 等列表场景

### 核心思路

构建 Table 等列表组件时，**应该构建行组件（RowComponent），而不是在 Table 组件内操作行 DOM**。

每一行是一个独立的组件实例，拥有自己的 nodeMap、eventMap 和 getter/setter。刷新数据时，只需遍历行组件设置属性，不需要重构 DOM。

### 为什么不用 innerHTML 重构

```typescript
// ❌ 错误做法：innerHTML 重构行 → 丢失事件绑定 + 性能差
renderRows(data: any[]) {
    this.bodyEl.innerHTML = data.map(row => `<tr>...</tr>`).join('');
}

// ✅ 正确做法：行组件 + 属性更新 → 保留事件绑定 + 高效
renderRows(data: any[]) {
    for (let i = 0; i < data.length; i++) {
        this.rows[i].name = data[i].name;      // setter → td.innerHTML
        this.rows[i].status = data[i].status;  // setter → td.innerHTML
    }
}
```

### 行组件模板

```html
<!-- TableRow 模板（单区域组件） -->
<td data-content="row:name" class="q-table__cell"></td>
<td data-content="row:status" class="q-table__cell"></td>
<td data-content="row:action" class="q-table__cell">
    <button data-content="row:edit" data-event="click" class="q-table__edit">编辑</button>
    <button data-content="row:delete" data-event="click" class="q-table__delete">删除</button>
</td>
```

### 行组件定义

```typescript
class TableRowComponent extends ComponentBase {
    static readonly abilities = [ElementEventAbility];

    // isMultiArea 默认 false → 属性名用 name

    // data-content="row:edit" + data-event="click" → onEdit
    onEdit(_event: Event, _el: HTMLElement): void {
        this.emit('row:edit', this.data);
    }

    // data-content="row:delete" + data-event="click" → onDelete
    onDelete(_event: Event, _el: HTMLElement): void {
        this.emit('row:delete', this.data);
    }
}
```

### Table 组件管理行

```typescript
class TableComponent extends ComponentBase {
    static readonly abilities = [ElementEventAbility];
    static isMultiArea = true;

    private rows: TableRowComponent[] = [];

    setData(dataList: any[]): void {
        // 行数匹配时：只更新属性，不重构 DOM
        if (this.rows.length === dataList.length) {
            for (let i = 0; i < dataList.length; i++) {
                this.rows[i].name = dataList[i].name;
                this.rows[i].status = dataList[i].status;
            }
            return;
        }

        // 行数不匹配时：增删行组件
        // ... 创建/销毁行组件 ...
    }
}
```

### 性能优势

| 操作 | innerHTML 重构 | 行组件 + 属性更新 |
|------|---------------|-----------------|
| 更新 100 行数据 | 100 次 innerHTML = HTML 解析 + DOM 重建 | 100 次 setter = 直接写 textContent/value |
| 事件绑定 | 每次重建后需重新绑定 | 行组件实例保留，事件不丢失 |
| 原型预热 | 不适用 | 首行慢，后续 99 行走快速路径 |
| DOM diff | 无（全量替换） | 无（直接更新目标节点） |

---

## 完整示例

### 模板定义

```html
<!-- Input 模板（单区域组件） -->
<span data-content="input:label" class="q-input__text q-input__text--label"></span>
<span data-content="input:prefix" class="q-input__text q-input__text--prefix"></span>
<input data-content="input:field" data-event="input" class="q-input__field" />
<span data-content="input:suffix" class="q-input__text q-input__text--suffix"></span>
<span data-content="input:error" class="q-input__text q-input__text--error"></span>
<span data-content="input:hint" class="q-input__text q-input__text--hint"></span>
```

### 组件定义

```typescript
import { ComponentBase } from '@qimenjs/component-core';
import { ElementEventAbility } from '@qimenjs/component-abilities';

class InputComponent extends ComponentBase {
    static readonly abilities = [ElementEventAbility, /* ... */];

    // isMultiArea 默认 false → 属性名用 name

    constructor(props?: Record<string, any>) {
        super(props);
        this.el.classList.add('q-input');
    }

    // 方法名从 data-content="input:field" 推导：onField
    onField(_event: Event, el: HTMLInputElement): void {
        this.value = el.value;  // this.field 的 setter
    }
}
```

### 使用效果

```typescript
const input = new InputComponent({ label: '用户名', field: '请输入' });

// 自动生成的属性
input.label;           // getter → span.innerHTML
input.field;           // getter → input.value
input.field = 'hello'; // setter → input.value = 'hello'
input.errorHidden = true;  // setter → span.hidden = true

// 事件自动绑定
// 用户输入时 → onField(event, el) → this.value = el.value
```

---

## 多区域组件示例

### 模板

```html
<!-- Dialog 模板（多区域组件） -->
<div class="q-dialog__header" data-content="dialog:header">
    <span data-content="dialog:text" class="q-dialog__title"></span>
    <button data-content="dialog:close" data-event="click" class="q-dialog__close">&times;</button>
</div>
<div class="q-dialog__body" data-content="dialog:body"></div>
<div class="q-dialog__footer" data-content="dialog:footer"></div>
```

### 组件

```typescript
class DialogComponent extends ComponentBase {
    static readonly abilities = [ElementEventAbility, /* ... */];
    static isMultiArea = true;  // 声明多区域

    // 方法名从 data-content="dialog:close" 推导：onDialogClose
    onDialogClose(): void {
        this.close();
    }
}
```

### 使用效果

```typescript
const dialog = new DialogComponent({ text: '提示' });

// 属性名带 group 前缀
dialog.dialogText;            // getter → span.innerHTML
dialog.dialogBody;            // getter → div.innerHTML
dialog.dialogBody = '内容';   // setter → div.innerHTML = '内容'
dialog.dialogCloseHidden = true;  // 隐藏关闭按钮

// 点击关闭按钮 → onDialogClose() → this.close()
```

---

## 属性速查表

### 模板属性

| 属性 | 必须 | 格式 | 说明 |
|------|------|------|------|
| `data-content` | 是 | `"group:name"` | 元素身份，nodeMap 入口 |
| `data-event` | 否 | `"event[?mod][, event]"` | 内部事件，方法名自动推导 |
| `data-emit` | 否 | `"event[?mod][, event]"` | 外部事件，emit 给监听者 |
| `data-target` | 否 | `".selector"` | 事件委托目标选择器 |
| `data-json` | 否 | `"DefinitionId"` | JSON 子组件引用，Renderer 递归渲染 |
| `data-json-mode` | 否 | `"child\|replace"` | JSON 渲染挂载模式（默认 replace） |
| `data-template` | 否 | `"TemplateId"` | 嵌套模板注入，模板拼接模板 |
| `data-hidden` | 否 | `"true"` | 初始隐藏状态，运行时设置 el.hidden |

### 自动生成属性

| 来源 | 单区域 (`isMultiArea=false`) | 多区域 (`isMultiArea=true`) |
|------|------|------|
| `data-content="input:field"` | `field` / `fieldHidden` | `inputField` / `inputFieldHidden` |
| `data-content="dialog:close"` | `close` / `closeHidden` | `dialogClose` / `dialogCloseHidden` |
| `data-event="click"` | `onClose` | `onDialogClose` |
| `data-event="input"` | `onField` | `onInputField` |

### mode 推导

| 元素标签 | mode | 读写方式 |
|---------|------|---------|
| `<input>`, `<select>`, `<textarea>` | value | `.value` |
| `<img>` | src | `.src` |
| 其他 | html | `.innerHTML` |

---

## 常见问题

### Q: 为什么不自动推导 isMultiArea？

显式声明更安全。模板可能动态变化，自动推导可能出错。写一行 `static isMultiArea = true` 不费事，但避免了歧义。

### Q: data-event 和 data-emit 可以同时存在吗？

可以。一个元素可以同时有内部事件和外部事件：

```html
<button data-content="dialog:close" data-event="click" data-emit="mouseenter" />
```

### Q: 多个事件绑定到同一个方法？

`data-event="click, dblclick"` → 两个事件都调用同一个推导方法名。

### Q: 为什么不把方法名写在 data-event 里？

方法名从 `data-content` 推导，好处：
1. 模板只声明"发生了什么事件"，不关心"怎么处理"
2. 方法名与属性名命名一致，容易记忆
3. 减少模板中的冗余信息

### Q: data-json 和 data-template 怎么选？

- `data-template`：纯结构拼接，注入的节点由当前组件统一管理（事件、属性都在当前组件的 nodeMap 中）
- `data-json`：需要独立生命周期的子组件，有自己的 nodeMap、eventMap、abilities

### Q: 不包含父元素？

模板只定义子节点片段，外层根元素由 `ComponentBase.initElement()` 创建。

```html
<!-- 正确：只有子节点 -->
<span data-content="button:icon"></span>
<span data-content="button:text"></span>

<!-- 错误：包含外层 div -->
<div>
  <span data-content="button:icon"></span>
  <span data-content="button:text"></span>
</div>
```

### Q: Table 组件应该怎么构建？

构建行组件（RowComponent），每行是独立实例。刷新数据时遍历行组件设置属性，不需要重构 DOM。详见上方"行组件模式"章节。
