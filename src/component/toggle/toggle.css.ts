/**
 * Toggle 切换按钮样式 — Metro 风格
 *
 * 基于 Button 的扁平风格，增加 pressed 态视觉反馈。
 */

export const toggleCSS = `
/* Toggle 根元素 */
.q-toggle {
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

.q-toggle:hover {
    border-color: var(--q-colors-text-secondary, #666);
}

/* Pressed 态 */
.q-toggle--pressed {
    background: var(--q-colors-primary, #0078d4);
    border-color: var(--q-colors-primary, #0078d4);
    color: var(--q-colors-on-primary, #fff);
}

.q-toggle--pressed:hover {
    background: var(--q-colors-primary-hover, #106ebe);
    border-color: var(--q-colors-primary-hover, #106ebe);
}

/* 禁用态 */
.q-toggle--disabled {
    cursor: not-allowed;
    opacity: 0.4;
}

/* 尺寸 */
.q-toggle--sm {
    height: 28px;
    padding: 0 12px;
    font-size: 12px;
}

.q-toggle--md {
    height: 36px;
    padding: 0 16px;
    font-size: 14px;
}

.q-toggle--lg {
    height: 44px;
    padding: 0 20px;
    font-size: 16px;
}

/* 图标 */
.q-toggle__icon {
    flex-shrink: 0;
    margin-right: 6px;
}

/* 文本 */
.q-toggle__text {
    display: inline-flex;
    align-items: center;
}
`;