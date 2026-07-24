/**
 * Input 输入框组件样式 — Metro 风格
 *
 * 从 FormFieldComponent 派生，布局样式由 formfield.css 提供。
 * 本文件只定义 Input 特有的样式：
 * - wrapper 内部布局（flex + position relative）
 * - field 输入框样式
 * - prefix / actions / suffix / dropdownIcon 插槽
 * - 状态变体（focused / disabled / readonly / error）
 * - 尺寸变体
 */

export const inputCSS = `
/* ═══════════════════════════════════════════════════
 * CSS 变量 — Input 特有
 * ═══════════════════════════════════════════════════ */

.q-input {
    --q-input-field-height: 36px;
    --q-input-field-padding: 0 12px;
    --q-input-field-font-size: 14px;
}

/* ═══════════════════════════════════════════════════
 * wrapper — 输入框容器（fieldBody 子组件的 el）
 * ═══════════════════════════════════════════════════ */

.q-input__wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

/* ═══════════════════════════════════════════════════
 * 输入框
 * ═══════════════════════════════════════════════════ */

.q-input__field {
    display: block;
    width: 100%;
    height: var(--q-input-field-height);
    padding: var(--q-input-field-padding);
    border: 2px solid var(--q-colors-border, #dcdfe6);
    border-radius: 0;
    font-size: var(--q-input-field-font-size);
    line-height: 1.5;
    color: var(--q-colors-text, #1a1a1a);
    background: var(--q-colors-bg, #fff);
    box-sizing: border-box;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
}

.q-input__field::placeholder {
    color: var(--q-colors-text-placeholder, #bfbfbf);
}

.q-input__field:focus {
    border-color: var(--q-colors-primary, #0078d4);
    box-shadow: 0 0 0 2px var(--q-colors-primary-ring, rgba(0, 120, 212, 0.2));
}

/* ═══════════════════════════════════════════════════
 * 前缀
 * ═══════════════════════════════════════════════════ */

.q-input__prefix {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    padding: 0 8px;
    height: var(--q-input-field-height);
    font-size: var(--q-input-field-font-size);
    color: var(--q-colors-text-secondary, #666);
    white-space: nowrap;
    box-sizing: border-box;
}

.q-input__prefix[class*="--icon-"]::before {
    display: inline-block;
    width: 16px;
    height: 16px;
}

/* ═══════════════════════════════════════════════════
 * 操作按钮区域
 * ═══════════════════════════════════════════════════ */

.q-input__actions {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 8px;
    z-index: 1;
}

.q-input__actions .q-itemgroup__items {
    display: flex;
    align-items: center;
    gap: 4px;
}

.q-input__actions .q-itemgroup__items > * {
    background: transparent;
}

.q-input__clear-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--q-colors-text-placeholder, #bfbfbf);
    font-size: 16px;
    line-height: 1;
    cursor: pointer;
    border-radius: 0;
    transition: color 0.15s;
}

.q-input__clear-btn:hover {
    color: var(--q-colors-text-secondary, #666);
}

/* ═══════════════════════════════════════════════════
 * 插槽（suffix / dropdownIcon）
 * ═══════════════════════════════════════════════════ */

.q-input__slot {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    z-index: 1;
}

.q-input__slot--suffix {
    right: 40px;
}

.q-input__slot--dropdown {
    right: 72px;
}

/* ═══════════════════════════════════════════════════
 * 状态变体
 * ═══════════════════════════════════════════════════ */

.q-input--focused .q-input__field {
    border-color: var(--q-colors-primary, #0078d4);
    box-shadow: 0 0 0 2px var(--q-colors-primary-ring, rgba(0, 120, 212, 0.2));
}

.q-input--disabled .q-input__field {
    background: var(--q-colors-bg-disabled, #f5f5f5);
    border-color: var(--q-colors-border, #dcdfe6);
    color: var(--q-colors-text-disabled, #bfbfbf);
    cursor: not-allowed;
}

.q-input--disabled .q-formfield__label {
    color: var(--q-colors-text-disabled, #bfbfbf);
    cursor: not-allowed;
}

.q-input--disabled .q-input__clear-btn {
    cursor: not-allowed;
    opacity: 0.4;
}

.q-input--readonly .q-input__field {
    background: var(--q-colors-bg-readonly, #fafafa);
    border-color: var(--q-colors-border, #dcdfe6);
    color: var(--q-colors-text, #1a1a1a);
    cursor: default;
}

.q-input--error .q-input__field {
    border-color: var(--q-colors-error, #d13438);
}

.q-input--error.q-input--focused .q-input__field {
    box-shadow: 0 0 0 2px var(--q-colors-error-ring, rgba(209, 52, 56, 0.2));
}

/* ═══════════════════════════════════════════════════
 * 尺寸变体 — 只覆盖 Input 特有变量
 * ═══════════════════════════════════════════════════ */

.q-input--sm {
    --q-input-field-height: 28px;
    --q-input-field-padding: 0 8px;
    --q-input-field-font-size: 12px;
}

.q-input--md {
    --q-input-field-height: 36px;
    --q-input-field-padding: 0 12px;
    --q-input-field-font-size: 14px;
}

.q-input--lg {
    --q-input-field-height: 44px;
    --q-input-field-padding: 0 16px;
    --q-input-field-font-size: 16px;
}
`;
