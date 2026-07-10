# HTML 模板最佳实践

> `@qimenjs/html-template` 包的模板编写规范。

## 核心原则

### 1. 不包含父元素

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

### 2. 统一使用 data-content，不使用 data-ref

所有需要被组件代码引用的元素，一律通过 `data-content` 标记。框架不使用 `data-ref`。

```html
<!-- 正确 -->
<input data-content="input:field" class="q-input__field" />

<!-- 错误 -->
<input data-ref="input" class="q-input__field" />
```

### 3. prefix:name 语义化分层

`data-content` 的值采用 `prefix:name` 格式：

- **prefix** = 功能区域/组件区域（如 `input`, `header`, `body`, `footer`）
- **name** = 具体内容项（如 `label`, `close`, `confirm`, `cancel`）

前缀是**区域语义**，不是内容类型。`input:label` 表示"输入框区域的标签"，而不是 `text:label`（无法区分是哪个组件的标签）。

```html
<!-- 正确：按区域语义命名 -->
<span data-content="input:label"></span>
<span data-content="input:prefix"></span>
<input data-content="input:field" />
<span data-content="input:suffix"></span>
<span data-content="input:error"></span>

<!-- 错误：按内容类型命名 -->
<span data-content="text:label"></span>
<span data-content="text:prefix"></span>
<input data-ref="input" />
<span data-content="text:suffix"></span>
<span data-content="text:error"></span>
```

## 命名规范

### 区域前缀（prefix）

| 前缀 | 含义 | 典型场景 |
|------|------|---------|
| `button` | 按钮区 | 图标、文本 |
| `input` | 输入框区 | 标签、字段、前后缀、错误/提示 |
| `select` | 选择框区 | 标签、字段 |
| `header` | 标题区 | 文本、图标、关闭按钮 |
| `body` | 内容区 | 默认内容 |
| `footer` | 底部区 | 确认/取消按钮 |
| `table` | 表格区 | 表头、表体 |
| `dialog` | 弹窗区 | 标题、关闭、内容、底部 |
| `toast` | 提示区 | 图标、消息、标题、关闭 |
| `msgbox` | 消息框区 | 标题、内容、输入、按钮 |
| `children` | 子组件挂载区 | 默认挂载点 |
| `tips` | 提示浮层 | 默认内容 |
| `dropdown` | 下拉浮层 | 默认内容 |
| `popover` | 弹出浮层 | 默认内容 |

### 内容名称（name）

| 名称 | 含义 |
|------|------|
| `default` | 默认（单项内容） |
| `label` | 标签 |
| `prefix` | 前缀（如货币符号） |
| `suffix` | 后缀（如单位） |
| `error` | 错误提示 |
| `hint` | 提示文本 |
| `text` | 文本 |
| `icon` | 图标 |
| `message` | 消息 |
| `content` | 内容 |
| `close` | 关闭按钮 |
| `confirm` | 确认按钮 |
| `cancel` | 取消按钮 |
| `field` | 输入/选择字段 |
| `headerRow` | 表头行 |
| `bodyScroll` | 表体滚动区 |

### 4. 子组件挂载点

模板中可通过 `children:default` 声明子组件的挂载容器。如果模板中没有定义此插槽，子组件将直接挂载到组件自身的根元素上。

```html
<!-- 有明确挂载点：子组件挂载到 body 容器内 -->
<div class="q-dialog__body" data-content="dialog:body">
    <div data-content="children:default"></div>
</div>

<!-- 无挂载点：子组件直接挂载到组件根 div -->
<span data-content="button:icon"></span>
<span data-content="button:text"></span>
```

使用常量引用：

```typescript
import { Slot } from '@qimenjs/html-template';

// 模板中
`<div data-content="${Slot.CHILDREN_DEFAULT}"></div>`

// 组件中查找挂载点
const mountEl = this.el.querySelector(`[data-content="${Slot.CHILDREN_DEFAULT}"]`) ?? this.el;
```

## 使用常量

所有 `data-content` 值应通过 `@qimenjs/html-template` 的 `Slot` 常量引用，避免拼写错误：

```typescript
import { Slot } from '@qimenjs/html-template';

// 模板中
const template = `
    <span data-content="${Slot.INPUT_LABEL}"></span>
    <input data-content="${Slot.INPUT_FIELD}" class="q-input__field" />
`;

// 组件中
const inputEl = this.el.querySelector(`[data-content="${Slot.INPUT_FIELD}"]`);
```

也可单独使用 `Area` 和 `Name` 组合：

```typescript
import { Area, Name } from '@qimenjs/html-template';

const customSlot = `${Area.HEADER}:${Name.CLOSE}`; // "header:close"
```

## 运行时查询

`ComponentBase.buildContentMap()` 会一次性查询所有 `[data-content]` 元素，按冒号分层缓存到 `contentMap`：

```typescript
// contentMap 结构
{
  input: { label: HTMLElement, field: HTMLElement, ... },
  header: { text: HTMLElement, close: HTMLElement },
  footer: { confirm: HTMLElement, cancel: HTMLElement },
}
```

`ContentAbility` 在 `__initProps` 中使用 `contentMap` 为组件生成内容管理属性。

## 模板注册

```typescript
import { HtmlTemplateRegistrar, registerComponentTemplates } from '@qimenjs/html-template';

// 引入包即自动注册预设模板
import '@qimenjs/html-template';

// 手动注册自定义模板
const registrar = HtmlTemplateRegistrar.getInstance();
registrar.register('MyWidget', '<span data-content="widget:label"></span>');

// 批量注册（可追加额外模板）
registerComponentTemplates({ MyWidget: '<span data-content="widget:label"></span>' });
```

## 完整示例

### 定义模板

```typescript
import { Slot } from '@qimenjs/html-template';
import { HtmlTemplateRegistrar } from '@qimenjs/html-template';

const MY_CARD_TEMPLATE = `
    <div class="my-card__header">
        <span data-content="${Slot.HEADER_ICON}" class="my-card__icon"></span>
        <span data-content="${Slot.HEADER_TEXT}" class="my-card__title"></span>
        <button data-content="${Slot.HEADER_CLOSE}" class="my-card__close">&times;</button>
    </div>
    <div class="my-card__body">
        <span data-content="${Slot.BODY_DEFAULT}"></span>
    </div>
    <div class="my-card__footer">
        <button data-content="${Slot.FOOTER_CONFIRM}">确定</button>
        <button data-content="${Slot.FOOTER_CANCEL}">取消</button>
    </div>
`;

HtmlTemplateRegistrar.getInstance().register('MyCard', MY_CARD_TEMPLATE);
```

### 组件中使用

```typescript
import { ComponentBase } from '@qimenjs/component-core';
import { ContentAbility } from '@qimenjs/component-abilities';
import { Slot } from '@qimenjs/html-template';

class MyCardComponent extends ComponentBase {
    static readonly contentSlots = {
        header: ['icon', 'text', 'close'],
        body: ['default'],
        footer: ['confirm', 'cancel'],
    };

    constructor(props?: Record<string, any>) {
        super(props);
        this.el.classList.add('my-card');

        // 通过 data-content 查询元素
        const closeBtn = this.el.querySelector(`[data-content="${Slot.HEADER_CLOSE}"]`);
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }
    }
}
```
