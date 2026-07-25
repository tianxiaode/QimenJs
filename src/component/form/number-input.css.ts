/**
 * NumberInput 数字输入框样式 — Metro 风格
 *
 * 依赖 input.css.ts 的基础样式。
 * 本文件只定义 NumberInput 特有的样式：
 * - 步进按钮
 * - 数值字段对齐
 */

export const numberInputCSS = `
/* ═══════════════════════════════════════════════════
 * 步进按钮
 * ═══════════════════════════════════════════════════ */

.q-number-input__step {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 16px;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--q-colors-text-secondary, #666);
    font-size: 8px;
    line-height: 1;
    cursor: pointer;
    border-radius: 0;
    transition: background 0.15s, color 0.15s;
    user-select: none;
}

.q-number-input__step:hover {
    background: var(--q-colors-bg-hover, #f0f0f0);
    color: var(--q-colors-text, #1a1a1a);
}

.q-number-input__step:active {
    background: var(--q-colors-bg-active, #e0e0e0);
}

.q-input--disabled .q-number-input__step {
    cursor: not-allowed;
    opacity: 0.4;
}

/* ═══════════════════════════════════════════════════
 * number 字段对齐
 * ═══════════════════════════════════════════════════ */

.q-input--number .q-input__field {
    text-align: right;
}

.q-input--number .q-input__field::-webkit-inner-spin-button,
.q-input--number .q-input__field::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.q-input--number .q-input__field {
    -moz-appearance: textfield;
}
`;
