# @qimenjs/markdown

**层级**: UI 层  
**状态**: ✅ 完成  
**测试**: 待补充  
**覆盖率**: -

## 概述

Markdown 引擎 + 编辑器组件包。提供零依赖的 Markdown → HTML 解析引擎，以及从 FormFieldComponent 派生的 Markdown 编辑器组件。

## 功能

### MarkdownEngine 解析引擎

- **零依赖** — 纯 TypeScript 实现，无运行时依赖
- **规则管道架构** — 块级解析 + 内联解析两阶段
- **可扩展** — `addBlockRule()` / `addInlineRule()` 自定义规则
- **独立使用** — 不依赖任何 UI 组件

支持的 Markdown 语法：

| 语法 | 示例 |
|------|------|
| 标题 | `# H1` ~ `###### H6` |
| 加粗 | `**bold**` |
| 斜体 | `*italic*` |
| 删除线 | `~~text~~` |
| 链接 | `[text](url)` |
| 图片 | `![alt](url)` |
| 行内代码 | `` `code` `` |
| 代码块 | ` ```lang ``` ` |
| 无序列表 | `- item` |
| 有序列表 | `1. item` |
| 引用 | `> text` |
| 分隔线 | `---` |
| HTML 块 | `<div>...</div>` |

### MarkdownEditorComponent 编辑器组件

- **FormFieldComponent 派生** — 复用 label/验证/info 三封装
- **三种模式** — `edit`（纯编辑）/ `preview`（纯预览）/ `split`（分栏）
- **实时预览** — 编辑时自动调用 MarkdownEngine 渲染
- **快捷键** — 内置 10 个格式快捷键 + Tab 缩进

### 快捷键

| 快捷键 | 功能 | Markdown 语法 |
|--------|------|---------------|
| `Ctrl+B` | 加粗 | `**text**` |
| `Ctrl+I` | 斜体 | `*text*` |
| `Ctrl+Shift+D` | 删除线 | `~~text~~` |
| `` Ctrl+` `` | 行内代码 | `` `code` `` |
| `Ctrl+K` | 链接 | `[text](url)` |
| `Ctrl+Shift+K` | 代码块 | ` ``` ` |
| `Ctrl+H` | 标题 | `## ` |
| `Ctrl+Q` | 引用 | `> ` |
| `Ctrl+U` | 无序列表 | `- ` |
| `Ctrl+O` | 有序列表 | `1. ` |
| `Tab` | 缩进 | 4 空格 |
| `Shift+Tab` | 反缩进 | 移除 4 空格 |

## 依赖

```typescript
dependencies: {
  '@qimenjs/component-core': 'UI',
  '@qimenjs/component': 'UI',  // FormFieldComponent
}
```

## 目录结构

```
src/markdown/
├── engine/
│   ├── MarkdownEngine.ts              # 核心引擎：块级+内联两阶段解析
│   ├── rules/
│   │   ├── index.ts                   # 规则注册 + 类型定义（BlockRule/InlineRule/BlockToken）
│   │   ├── heading.ts                 # # 标题规则
│   │   ├── code.ts                    # ``` 代码块规则
│   │   ├── blockquote.ts              # > 引用规则
│   │   ├── list.ts                    # - / 1. 列表规则
│   │   ├── hr.ts                      # --- 分隔线规则
│   │   ├── html-block.ts              # HTML 块规则
│   │   ├── emphasis.ts                # **加粗** / *斜体* / ~~删除~~ 内联规则
│   │   ├── inline-code.ts             # `行内代码` 内联规则
│   │   ├── link.ts                    # [链接](url) 内联规则
│   │   └── image.ts                   # ![图片](url) 内联规则
│   └── index.ts                       # 引擎导出
├── MarkdownEditorComponent.ts         # 从 FormFieldComponent.replace 派生的编辑器
├── MarkdownEditorFieldBodyComponent.ts # textarea + preview 双栏字段体
├── markdown-editor.css.ts             # 编辑器 Metro 样式
├── markdown-viewer.css.ts             # 预览区排版样式
└── index.ts                           # 统一导出
```

## 架构设计

### 解析引擎流程

```
MarkdownEngine.render(src)
  ├── _parseBlock(src)                    # 块级解析
  │   ├── codeBlockRule.match()           # 代码块（最高优先级，避免内部被解析）
  │   ├── headingRule.match()             # 标题
  │   ├── hrRule.match()                  # 分隔线
  │   ├── blockquoteRule.match()          # 引用（递归解析子内容）
  │   ├── listRule.match()               # 列表
  │   ├── htmlBlockRule.match()           # HTML 块
  │   └── 段落（兜底，非空行聚合）
  └── _renderTokens(tokens)               # 渲染
      └── _parseInline(text)              # 内联解析（每个块级元素内部）
          ├── inlineCodeRule.replace()    # 行内代码（最高优先级，避免内部被解析）
          ├── imageRule.replace()         # 图片（在链接之前，避免 ![ 被 [ 匹配）
          ├── linkRule.replace()          # 链接
          └── emphasisRule.replace()      # 加粗/斜体/删除线
```

### 编辑器组件结构

```
MarkdownEditorComponent (FormFieldComponent.replace)
├── labelGroup    标签封装：label + requiredMark + separator
├── fieldBody     MarkdownEditorFieldBodyComponent
│   ├── editor    textarea 编辑区
│   └── preview   div 预览区（q-md-viewer 排版）
└── infoGroup     InputInfoGroupComponent

模式切换（CSS 类驱动）：
├── q-md-editor--edit      仅编辑区
├── q-md-editor--preview   仅预览区
└── q-md-editor--split     编辑 + 预览双栏
```

### 快捷键处理流程

```
editor keydown
  → FieldBodyComponent emits ['keydown']
  → MarkdownEditorComponent.onMdFieldKeydown(data)
      ├── Tab → _handleTab() → 缩进/反缩进
      └── Ctrl/Cmd + key → _shortcuts.find() → handler(ctx)
          ├── ctx.wrap(before, after, placeholder)  包裹选中文本
          └── ctx.insertLine(prefix)                行首插入前缀
```

## 使用示例

### 独立使用 MarkdownEngine

```typescript
import { MarkdownEngine } from '@qimenjs/markdown';

const engine = new MarkdownEngine();
const html = engine.render('# Hello **World**');
// => '<h1>Hello <strong>World</strong></h1>'

// 自定义规则
engine.addBlockRule(myBlockRule);
engine.addInlineRule(myInlineRule);
```

### 使用 MarkdownEditorComponent

```typescript
import { MarkdownEditorComponent } from '@qimenjs/markdown';

// 纯编辑模式
const editor = new MarkdownEditorComponent({ value: '# Hello', mode: 'edit' });

// 分栏模式
const splitEditor = new MarkdownEditorComponent({
    value: '# Hello\n\n**bold** text',
    mode: 'split',
    label: '内容',
    required: true,
});

// 监听输入
editor.on('input', ({ value }) => {
    console.log('markdown:', value);
});

// 切换模式
editor.mode = 'preview';

// 获取渲染后 HTML
const html = editor.getFormDisplayValue();
```

## API

### MarkdownEngine

```typescript
class MarkdownEngine {
    constructor(options?: MarkdownEngineOptions);
    render(src: string): string;
    parse(src: string): BlockToken[];
    addBlockRule(rule: BlockRule): void;
    addInlineRule(rule: InlineRule): void;
}

interface MarkdownEngineOptions {
    html?: boolean;       // 是否允许原始 HTML（默认 false）
    breaks?: boolean;     // 换行符是否转为 <br>（默认 false）
    linkify?: boolean;    // 自动链接化 URL（默认 false）
}
```

### MarkdownEditorComponent

```typescript
interface MarkdownEditorProps extends FormFieldProps {
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    readonly?: boolean;
    mode?: 'edit' | 'preview' | 'split';
    rows?: number;
    autoSize?: boolean | { minRows?: number; maxRows?: number };
}

// 属性
editor.value: string;
editor.disabled: boolean;
editor.readonly: boolean;
editor.mode: MarkdownEditMode;

// 方法
editor.focus(): void;
editor.blur(): void;
editor.getFormValue(): string;
editor.getFormDisplayValue(): string;  // 返回渲染后 HTML
editor.formReset(defaultValue?: any): void;
editor.update(props?: Partial<MarkdownEditorProps>): void;
```

### MarkdownShortcutAction

```typescript
interface MarkdownShortcutAction {
    key: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    handler: (ctx: ShortcutContext) => void;
}

interface ShortcutContext {
    editor: HTMLTextAreaElement;
    wrap: (before: string, after: string, placeholder?: string) => void;
    insertLine: (prefix: string) => void;
}
```

## 设计决策

- **零依赖引擎**：项目无运行时依赖，Markdown 解析器完全自研，规则管道架构便于扩展
- **FormFieldComponent 派生**：复用表单三封装（label/fieldBody/info），与 Input/Textarea 等表单组件一致
- **CSS 类驱动模式切换**：edit/preview/split 三种模式通过 CSS 类控制显隐，无需重建 DOM
- **快捷键可扩展**：通过 `MarkdownShortcutAction` 接口，用户可自定义快捷键规则
- **选中包裹**：`wrapSelection()` 使用 `document.execCommand('insertText')` 保持 undo 栈完整

## 变更历史

### 2026-07-25
- 创建 @qimenjs/markdown 包
- 实现 MarkdownEngine 零依赖解析引擎（6 个块级规则 + 4 个内联规则）
- 实现 MarkdownEditorComponent（FormFieldComponent.replace 派生，edit/preview/split 三模式）
- 实现 MarkdownEditorFieldBodyComponent（textarea + preview 双栏字段体）
- 实现 10 个格式快捷键 + Tab 缩进/反缩进
- 实现 markdown-editor.css（Metro 风格）+ markdown-viewer.css（预览排版）
- 注册 MarkdownEditor 到 ComponentRegistrar
- 添加 tsconfig 路径别名 @qimenjs/markdown