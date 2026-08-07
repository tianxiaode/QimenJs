/**
 * Button 按钮组件样式 — Metro 风格
 *
 * 扁平、方角、粗边框、无渐变、高对比色块。
 * 支持 default/primary/success/warning/danger 五种类型，
 * small/medium/large 三种尺寸，以及禁用状态。
 */

export const buttonCSS = `
/* Button 根元素 */
.q-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 16px;
    border: 2px solid var(--q-colors-border, #dcdfe6);
    border-radius: 0;
    font-size: 14px;
    font-weight: 600;
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
    box-sizing: border-box;
    outline: none;
    user-select: none;
    background: var(--q-colors-bg, #fff);
    color: var(--q-colors-text, #1a1a1a);
}

/* 类型：默认 */
.q-button--default {
    background: var(--q-colors-bg, #fff);
    border-color: var(--q-colors-border, #dcdfe6);
    color: var(--q-colors-text, #1a1a1a);
}

.q-button--default:hover {
    border-color: var(--q-colors-text-secondary, #666);
}

/* 类型：主要 */
.q-button--primary {
    background: var(--q-colors-primary, #0078d4);
    border-color: var(--q-colors-primary, #0078d4);
    color: var(--q-colors-on-primary, #fff);
}

.q-button--primary:hover {
    background: var(--q-colors-primary-hover, #106ebe);
    border-color: var(--q-colors-primary-hover, #106ebe);
}

.q-button--primary:active {
    background: var(--q-colors-primary-active, #005a9e);
    border-color: var(--q-colors-primary-active, #005a9e);
}

/* 类型：成功 */
.q-button--success {
    background: var(--q-colors-success, #107c10);
    border-color: var(--q-colors-success, #107c10);
    color: var(--q-colors-on-success, #fff);
}

.q-button--success:hover {
    background: #0e6b0e;
    border-color: #0e6b0e;
}

/* 类型：警告 */
.q-button--warning {
    background: var(--q-colors-warning, #ca5010);
    border-color: var(--q-colors-warning, #ca5010);
    color: var(--q-colors-on-warning, #fff);
}

.q-button--warning:hover {
    background: #b3450e;
    border-color: #b3450e;
}

/* 类型：危险 */
.q-button--danger {
    background: var(--q-colors-error, #d13438);
    border-color: var(--q-colors-error, #d13438);
    color: var(--q-colors-on-error, #fff);
}

.q-button--danger:hover {
    background: #b22c2f;
    border-color: #b22c2f;
}

/* 尺寸：小 */
.q-button--small {
    height: 28px;
    padding: 0 12px;
    font-size: 12px;
}

/* 尺寸：中 */
.q-button--medium {
    height: 36px;
    padding: 0 16px;
    font-size: 14px;
}

/* 尺寸：大 */
.q-button--large {
    height: 44px;
    padding: 0 20px;
    font-size: 16px;
}

/* 禁用状态 */
.q-button--disabled {
    cursor: not-allowed;
    opacity: 0.4;
}

/* 内容文本 */
.q-button__content {
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

/* 下拉展开箭头 */
.q-button .q-expand-arrow {
    margin-left: 6px;
}

/* 下拉按钮模式 */
.q-button--dropdown {
    padding-right: 8px;
}

/* Dropdown组件样式 */
.q-dropdown {
    padding-right: 8px;
}

/* 幽灵模式（无边框，与背景融合） */
.q-button--ghost {
    border-color: transparent;
    background: transparent;
}

.q-button--ghost:hover {
    background: var(--q-colors-ghost-hover, rgba(128, 128, 128, 0.1));
    border-color: transparent;
}

.q-button--ghost:active {
    background: var(--q-colors-ghost-active, rgba(128, 128, 128, 0.15));
}

/* 幽灵模式 — 主要色 */
.q-button--ghost.q-button--primary {
    color: var(--q-colors-primary, #0078d4);
    background: transparent;
    border-color: transparent;
}

.q-button--ghost.q-button--primary:hover {
    background: var(--q-colors-primary-hover, rgba(0, 120, 212, 0.1));
    border-color: transparent;
}
`;
