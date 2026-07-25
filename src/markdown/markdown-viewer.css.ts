/**
 * MarkdownViewer 预览样式 — Metro 风格
 *
 * 独立的 Markdown 渲染预览样式，供 q-md-viewer 类名使用。
 * 同时被 MarkdownEditor 的预览区复用（通过 q-md-editor__preview q-md-viewer 双类名）。
 *
 * 排版规范：
 * - 标题层级间距
 * - 代码块样式
 * - 列表样式
 * - 引用块样式
 * - 链接/图片样式
 * - 表格样式
 */

export const markdownViewerCSS = `
/* ═══════════════════════════════════════════════════
 * Markdown Viewer — 通用排版
 * ═══════════════════════════════════════════════════ */

.q-md-viewer {
    --q-md-viewer-heading-color: var(--q-colors-text, #1a1a1a);
    --q-md-viewer-code-bg: var(--q-colors-bg-code, #f5f5f5);
    --q-md-viewer-code-color: var(--q-colors-text-code, #c7254e);
    --q-md-viewer-blockquote-border: var(--q-colors-primary, #0078d4);
    --q-md-viewer-blockquote-bg: var(--q-colors-bg-subtle, #f9f9f9);
    --q-md-viewer-link-color: var(--q-colors-primary, #0078d4);
    --q-md-viewer-hr-color: var(--q-colors-border, #dcdfe6);
    word-wrap: break-word;
    overflow-wrap: break-word;
}

.q-md-viewer > *:first-child {
    margin-top: 0;
}

.q-md-viewer > *:last-child {
    margin-bottom: 0;
}

/* ═══════════════════════════════════════════════════
 * 标题
 * ═══════════════════════════════════════════════════ */

.q-md-viewer h1,
.q-md-viewer h2,
.q-md-viewer h3,
.q-md-viewer h4,
.q-md-viewer h5,
.q-md-viewer h6 {
    margin: 1.2em 0 0.6em;
    font-weight: 600;
    color: var(--q-md-viewer-heading-color);
    line-height: 1.3;
}

.q-md-viewer h1 { font-size: 2em; border-bottom: 2px solid var(--q-md-viewer-hr-color); padding-bottom: 0.3em; }
.q-md-viewer h2 { font-size: 1.5em; border-bottom: 1px solid var(--q-md-viewer-hr-color); padding-bottom: 0.3em; }
.q-md-viewer h3 { font-size: 1.25em; }
.q-md-viewer h4 { font-size: 1em; }
.q-md-viewer h5 { font-size: 0.875em; }
.q-md-viewer h6 { font-size: 0.85em; color: var(--q-colors-text-secondary, #666); }

/* ═══════════════════════════════════════════════════
 * 段落 / 文本
 * ═══════════════════════════════════════════════════ */

.q-md-viewer p {
    margin: 0.8em 0;
    line-height: 1.7;
}

.q-md-viewer strong {
    font-weight: 600;
}

.q-md-viewer em {
    font-style: italic;
}

.q-md-viewer del {
    text-decoration: line-through;
    color: var(--q-colors-text-secondary, #666);
}

/* ═══════════════════════════════════════════════════
 * 链接
 * ═══════════════════════════════════════════════════ */

.q-md-viewer a {
    color: var(--q-md-viewer-link-color);
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: border-color 0.15s;
}

.q-md-viewer a:hover {
    border-bottom-color: var(--q-md-viewer-link-color);
}

/* ═══════════════════════════════════════════════════
 * 行内代码
 * ═══════════════════════════════════════════════════ */

.q-md-viewer code {
    padding: 0.15em 0.4em;
    font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
    font-size: 0.9em;
    background: var(--q-md-viewer-code-bg);
    color: var(--q-md-viewer-code-color);
    border-radius: 0;
}

/* ═══════════════════════════════════════════════════
 * 代码块
 * ═══════════════════════════════════════════════════ */

.q-md-viewer pre {
    margin: 1em 0;
    padding: 1em;
    background: var(--q-md-viewer-code-bg);
    border: 1px solid var(--q-md-viewer-hr-color);
    border-radius: 0;
    overflow-x: auto;
}

.q-md-viewer pre code {
    padding: 0;
    background: none;
    color: inherit;
    font-size: 0.9em;
    line-height: 1.5;
}

/* ═══════════════════════════════════════════════════
 * 引用块
 * ═══════════════════════════════════════════════════ */

.q-md-viewer blockquote {
    margin: 1em 0;
    padding: 0.5em 1em;
    border-left: 4px solid var(--q-md-viewer-blockquote-border);
    background: var(--q-md-viewer-blockquote-bg);
    color: var(--q-colors-text-secondary, #666);
}

.q-md-viewer blockquote p {
    margin: 0.4em 0;
}

/* ═══════════════════════════════════════════════════
 * 列表
 * ═══════════════════════════════════════════════════ */

.q-md-viewer ul,
.q-md-viewer ol {
    margin: 0.8em 0;
    padding-left: 2em;
}

.q-md-viewer li {
    margin: 0.3em 0;
    line-height: 1.6;
}

/* ═══════════════════════════════════════════════════
 * 分隔线
 * ═══════════════════════════════════════════════════ */

.q-md-viewer hr {
    margin: 1.5em 0;
    border: none;
    border-top: 2px solid var(--q-md-viewer-hr-color);
}

/* ═══════════════════════════════════════════════════
 * 图片
 * ═══════════════════════════════════════════════════ */

.q-md-viewer img {
    max-width: 100%;
    height: auto;
    border-radius: 0;
}
`;
