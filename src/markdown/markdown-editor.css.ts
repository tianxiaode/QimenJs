/**
 * MarkdownEditor 编辑器样式 — Metro 风格
 *
 * 从 FormFieldComponent 派生，布局样式由 formfield.css 提供。
 * 本文件只定义 MarkdownEditor 特有的样式：
 * - wrapper 双栏布局
 * - textarea 编辑区
 * - preview 预览区
 * - 模式切换（edit / preview / split）
 * - 状态变体
 * - 尺寸变体
 */

export const markdownEditorCSS = `
/* ═══════════════════════════════════════════════════
 * CSS 变量 — MarkdownEditor 特有
 * ═══════════════════════════════════════════════════ */

.q-md-editor {
    --q-md-editor-min-height: 200px;
    --q-md-editor-field-padding: 8px 12px;
    --q-md-editor-field-font-size: 14px;
    --q-md-editor-field-line-height: 1.6;
    --q-md-editor-border: 2px solid var(--q-colors-border, #dcdfe6);
    --q-md-editor-split-ratio: 1fr 1fr;
}

/* ═══════════════════════════════════════════════════
 * wrapper — 编辑器容器
 * ═══════════════════════════════════════════════════ */

.q-md-editor__wrapper {
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: var(--q-md-editor-min-height);
}

/* ═══════════════════════════════════════════════════
 * 编辑区
 * ═══════════════════════════════════════════════════ */

.q-md-editor__input {
    display: block;
    width: 100%;
    min-height: var(--q-md-editor-min-height);
    padding: var(--q-md-editor-field-padding);
    border: var(--q-md-editor-border);
    border-radius: 0;
    font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
    font-size: var(--q-md-editor-field-font-size);
    line-height: var(--q-md-editor-field-line-height);
    color: var(--q-colors-text, #1a1a1a);
    background: var(--q-colors-bg, #fff);
    box-sizing: border-box;
    outline: none;
    resize: vertical;
    transition: border-color 0.15s, box-shadow 0.15s;
}

.q-md-editor__input::placeholder {
    color: var(--q-colors-text-placeholder, #bfbfbf);
}

.q-md-editor__input:focus {
    border-color: var(--q-colors-primary, #0078d4);
    box-shadow: 0 0 0 2px var(--q-colors-primary-ring, rgba(0, 120, 212, 0.2));
}

/* ═══════════════════════════════════════════════════
 * 预览区
 * ═══════════════════════════════════════════════════ */

.q-md-editor__preview {
    display: none;
    width: 100%;
    min-height: var(--q-md-editor-min-height);
    padding: var(--q-md-editor-field-padding);
    border: var(--q-md-editor-border);
    border-radius: 0;
    font-size: var(--q-md-editor-field-font-size);
    line-height: var(--q-md-editor-field-line-height);
    color: var(--q-colors-text, #1a1a1a);
    background: var(--q-colors-bg, #fff);
    box-sizing: border-box;
    overflow-y: auto;
}

/* ═══════════════════════════════════════════════════
 * 模式切换
 * ═══════════════════════════════════════════════════ */

.q-md-editor--edit .q-md-editor__input {
    display: block;
}

.q-md-editor--edit .q-md-editor__preview {
    display: none;
}

.q-md-editor--preview .q-md-editor__input {
    display: none;
}

.q-md-editor--preview .q-md-editor__preview {
    display: block;
}

.q-md-editor--split .q-md-editor__wrapper {
    flex-direction: row;
    gap: 0;
}

.q-md-editor--split .q-md-editor__input {
    display: block;
    width: 50%;
    border-right: 1px solid var(--q-colors-border, #dcdfe6);
    resize: none;
}

.q-md-editor--split .q-md-editor__preview {
    display: block;
    width: 50%;
    border-left: none;
}

/* ═══════════════════════════════════════════════════
 * 状态变体
 * ═══════════════════════════════════════════════════ */

.q-md-editor--focused .q-md-editor__input {
    border-color: var(--q-colors-primary, #0078d4);
    box-shadow: 0 0 0 2px var(--q-colors-primary-ring, rgba(0, 120, 212, 0.2));
}

.q-md-editor--disabled .q-md-editor__input {
    background: var(--q-colors-bg-disabled, #f5f5f5);
    border-color: var(--q-colors-border, #dcdfe6);
    color: var(--q-colors-text-disabled, #bfbfbf);
    cursor: not-allowed;
    resize: none;
}

.q-md-editor--disabled .q-md-editor__preview {
    background: var(--q-colors-bg-disabled, #f5f5f5);
    color: var(--q-colors-text-disabled, #bfbfbf);
}

.q-md-editor--readonly .q-md-editor__input {
    background: var(--q-colors-bg-readonly, #fafafa);
    border-color: var(--q-colors-border, #dcdfe6);
    color: var(--q-colors-text, #1a1a1a);
    cursor: default;
}

.q-md-editor--error .q-md-editor__input {
    border-color: var(--q-colors-error, #d13438);
}

.q-md-editor--error.q-md-editor--focused .q-md-editor__input {
    box-shadow: 0 0 0 2px var(--q-colors-error-ring, rgba(209, 52, 56, 0.2));
}

/* ═══════════════════════════════════════════════════
 * 尺寸变体
 * ═══════════════════════════════════════════════════ */

.q-md-editor--sm {
    --q-md-editor-min-height: 150px;
    --q-md-editor-field-padding: 4px 8px;
    --q-md-editor-field-font-size: 12px;
}

.q-md-editor--md {
    --q-md-editor-min-height: 200px;
    --q-md-editor-field-padding: 8px 12px;
    --q-md-editor-field-font-size: 14px;
}

.q-md-editor--lg {
    --q-md-editor-min-height: 280px;
    --q-md-editor-field-padding: 12px 16px;
    --q-md-editor-field-font-size: 16px;
}
`;
