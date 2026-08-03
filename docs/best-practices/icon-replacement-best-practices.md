# 图标替换最佳实践

> 日期：2026-08-03
> 状态：当前有效

## 核心原理

QimenJS 图标系统基于 **CSS 自定义属性 + `::before`/`::after` 伪元素** 双层架构：

- **CSS 变量层**：每个图标定义为 `--q-xxx-icon-name` 变量，默认值为 Unicode 字符
- **伪元素层**：通过 `::before`（toolbar）或 `::after`（dtpanel）渲染 `content: var(...)`
- **字体配置层**：`--q-xxx-icon-font` / `--q-xxx-icon-weight` 支持切换到 icon font 方案

这种设计使得图标替换 **零 JS 改动**，纯 CSS 即可完成。

## 2. 涉及的组件

| 组件 | 变量前缀 | 伪元素 | 图标数量 |
|---|---|---|---|
| `q-toolbar` / `q-entity-toolbar` | `--q-toolbar-icon-` | `::before` | 16 个 |
| `q-dtpanel`（日期时间面板） | `--q-dtpanel-icon-` | `::after` | 6 个 |

## 3. 默认值一览

### Toolbar 图标

```css
.q-toolbar {
    --q-toolbar-icon-first-page: '⏫';
    --q-toolbar-icon-prev-page: '◀';
    --q-toolbar-icon-next-page: '▶';
    --q-toolbar-icon-last-page: '⏬';
    --q-toolbar-icon-search: '🔍';
    --q-toolbar-icon-create: '+';
    --q-toolbar-icon-edit: '✎';
    --q-toolbar-icon-delete: '✕';
    --q-toolbar-icon-refresh: '↻';
    --q-toolbar-icon-save: '💾';
    --q-toolbar-icon-import: '↓';
    --q-toolbar-icon-export: '↑';
    --q-toolbar-icon-upload: '⇧';
    --q-toolbar-icon-download: '⇩';
    --q-toolbar-icon-history: '🕐';
    --q-toolbar-icon-help: '?';
}
```

### DateTimePanel 图标

```css
.q-dtpanel {
    --q-dtpanel-icon-prev: '◀';
    --q-dtpanel-icon-next: '▶';
    --q-dtpanel-icon-up: '▲';
    --q-dtpanel-icon-down: '▼';
    --q-dtpanel-icon-confirm: '✓';
    --q-dtpanel-icon-cancel: '✕';
}
```

## 4. 替换方式

### 4.1 字符替换（最简单）

直接覆盖 CSS 变量值：

```css
/* 全局替换 */
:root {
    --q-toolbar-icon-prev-page: '←';
    --q-toolbar-icon-next-page: '→';
}

/* 局部替换：仅影响某个容器内的 toolbar */
.my-grid .q-toolbar {
    --q-toolbar-icon-delete: '🗑';
}
```

### 4.2 FontAwesome 替换

FontAwesome 使用 webfont + Unicode 码点，需同时设置 `icon-font` 和 `icon-weight`：

```css
/* Toolbar 使用 FontAwesome 6 Solid */
.my-toolbar {
    --q-toolbar-icon-font: 'Font Awesome 6 Free';
    --q-toolbar-icon-weight: 900;

    --q-toolbar-icon-first-page: '\f102'; /* fa-angles-up */
    --q-toolbar-icon-prev-page: '\f060';  /* fa-arrow-left */
    --q-toolbar-icon-next-page: '\f061';  /* fa-arrow-right */
    --q-toolbar-icon-last-page: '\f103';  /* fa-angles-down */
    --q-toolbar-icon-create: '\f067';     /* fa-plus */
    --q-toolbar-icon-edit: '\f303';       /* fa-pencil */
    --q-toolbar-icon-delete: '\f00d';     /* fa-xmark */
    --q-toolbar-icon-refresh: '\f021';    /* fa-arrows-rotate */
    --q-toolbar-icon-save: '\f0c7';       /* fa-floppy-disk */
    --q-toolbar-icon-search: '\f002';     /* fa-magnifying-glass */
}

/* DateTimePanel 使用 FontAwesome 6 Solid */
.my-datepicker .q-dtpanel {
    --q-dtpanel-icon-font: 'Font Awesome 6 Free';
    --q-dtpanel-icon-weight: 900;

    --q-dtpanel-icon-prev: '\f060';    /* fa-arrow-left */
    --q-dtpanel-icon-next: '\f061';    /* fa-arrow-right */
    --q-dtpanel-icon-up: '\f062';      /* fa-arrow-up */
    --q-dtpanel-icon-down: '\f063';    /* fa-arrow-down */
    --q-dtpanel-icon-confirm: '\f00c'; /* fa-check */
    --q-dtpanel-icon-cancel: '\f00d';  /* fa-xmark */
}
```

**前置条件**：页面需加载 FontAwesome CSS：

```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
```

### 4.3 SVG / 背景图替换

当需要使用 SVG 图标时，直接覆盖伪元素的完整样式：

```css
/* 用 SVG 替换 toolbar 的上一页按钮 */
.my-toolbar .q-toolbar-btn-prev-page::before {
    content: '';
    display: block;
    width: 16px;
    height: 16px;
    background: url('icons/arrow-left.svg') no-repeat center;
    background-size: contain;
}

/* 用 SVG 替换 dtpanel 的确认按钮 */
.my-datepicker .q-dtpanel__nav-btn--confirm::after {
    content: '';
    display: block;
    width: 16px;
    height: 16px;
    background: url('icons/check.svg') no-repeat center;
    background-size: contain;
}
```

### 4.4 自定义 iconCls（Toolbar 专属）

Toolbar 的每个按钮支持通过 `iconCls` 属性传入自定义 CSS class，绕过内置图标系统：

```typescript
// 在 EntityToolbar 配置中自定义图标
const toolbar = new EntityToolbarComponent({
    items: [
        {
            name: 'prevPage',
            type: 'Button',
            icon: 'my-custom-prev-icon',  // 自定义 iconCls
            text: 'i18n:toolbar.prevPage',
        },
    ],
});
```

```css
.my-custom-prev-icon::before {
    content: '';
    display: block;
    width: 16px;
    height: 16px;
    background: url('my-arrow.svg') no-repeat center;
    background-size: contain;
}
```

## 5. 注意事项

- **CSS 变量是继承的**：在父元素上设置的图标变量会自动传递给子组件，无需在每个子组件上重复设置
- **伪元素不同**：Toolbar 用 `::before`，DateTimePanel 用 `::after`，覆盖时注意区分
- **FontAwesome 的 font-weight**：Solid 风格需 `font-weight: 900`，Regular 风格需 `font-weight: 400`
- **SVG 替换需清空 content**：设置 `content: ''` 并用 `background` 渲染，否则字符内容和背景图会同时显示
- **变量作用域**：优先在具体组件实例上覆盖（`.my-toolbar`），避免全局 `:root` 覆盖影响所有实例