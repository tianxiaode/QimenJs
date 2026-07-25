/**
 * Textarea 多行文本组件样式 — Metro 风格
 *
 * 从 FormFieldComponent 派生，布局样式由 formfield.css 提供。
 * 本文件只定义 Textarea 特有的样式：
 * - wrapper 内部布局
 * - textarea 字段样式
 * - 状态变体（focused / disabled / readonly / error）
 * - 尺寸变体
 * - autoSize 自适应高度
 */

export const textareaCSS = `
/* ═══════════════════════════════════════════════════
 * CSS 变量 — Textarea 特有
 * ═══════════════════════════════════════════════════ */

.q-textarea {
    --q-textarea-field-min-height: 80px;
    --q-textarea-field-padding: 8px 12px;
    --q-textarea-field-font-size: 14px;
    --q-textarea-field-line-height: 1.5;
}

/* ═══════════════════════════════════════════════════
 * wrapper — 文本域容器
 * ═══════════════════════════════════════════════════ */

.q-textarea__wrapper {
    position: relative;
    display: flex;
    align-items: flex-start;
}

/* ═══════════════════════════════════════════════════
 * 文本域
 * ═══════════════════════════════════════════════════ */

.q-textarea__field {
    display: block;
    width: 100%;
    min-height: var(--q-textarea-field-min-height);
    padding: var(--q-textarea-field-padding);
    border: 2px solid var(--q-colors-border, #dcdfe6);
    border-radius: 0;
    font-size: var(--q-textarea-field-font-size);
    line-height: var(--q-textarea-field-line-height);
    color: var(--q-colors-text, #1a1a1a);
    background: var(--q-colors-bg, #fff);
    box-sizing: border-box;
    outline: none;
    resize: vertical;
    transition: border-color 0.15s, box-shadow 0.15s;
}

.q-textarea__field::placeholder {
    color: var(--q-colors-text-placeholder, #bfbfbf);
}

.q-textarea__field:focus {
    border-color: var(--q-colors-primary, #0078d4);
    box-shadow: 0 0 0 2px var(--q-colors-primary-ring, rgba(0, 120, 212, 0.2));
}

/* ═══════════════════════════════════════════════════
 * 状态变体
 * ═══════════════════════════════════════════════════ */

.q-textarea--focused .q-textarea__field {
    border-color: var(--q-colors-primary, #0078d4);
    box-shadow: 0 0 0 2px var(--q-colors-primary-ring, rgba(0, 120, 212, 0.2));
}

.q-textarea--disabled .q-textarea__field {
    background: var(--q-colors-bg-disabled, #f5f5f5);
    border-color: var(--q-colors-border, #dcdfe6);
    color: var(--q-colors-text-disabled, #bfbfbf);
    cursor: not-allowed;
    resize: none;
}

.q-textarea--disabled .q-formfield__label {
    color: var(--q-colors-text-disabled, #bfbfbf);
    cursor: not-allowed;
}

.q-textarea--readonly .q-textarea__field {
    background: var(--q-colors-bg-readonly, #fafafa);
    border-color: var(--q-colors-border, #dcdfe6);
    color: var(--q-colors-text, #1a1a1a);
    cursor: default;
}

.q-textarea--error .q-textarea__field {
    border-color: var(--q-colors-error, #d13438);
}

.q-textarea--error.q-textarea--focused .q-textarea__field {
    box-shadow: 0 0 0 2px var(--q-colors-error-ring, rgba(209, 52, 56, 0.2));
}

/* ═══════════════════════════════════════════════════
 * 尺寸变体
 * ═══════════════════════════════════════════════════ */

.q-textarea--sm {
    --q-textarea-field-min-height: 60px;
    --q-textarea-field-padding: 4px 8px;
    --q-textarea-field-font-size: 12px;
}

.q-textarea--md {
    --q-textarea-field-min-height: 80px;
    --q-textarea-field-padding: 8px 12px;
    --q-textarea-field-font-size: 14px;
}

.q-textarea--lg {
    --q-textarea-field-min-height: 100px;
    --q-textarea-field-padding: 12px 16px;
    --q-textarea-field-font-size: 16px;
}
`;
