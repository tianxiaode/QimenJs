/**
 * TabBar 标签栏样式 — Metro 风格
 *
 * active 标签底部 2px 粗线指示，覆盖 Toggle 默认样式。
 */

export const tabBarCSS = `
/* TabBar 根元素 */
.q-tab-bar {
    display: inline-flex;
    align-items: stretch;
    border-bottom: 2px solid var(--q-colors-border, #dcdfe6);
}

.q-tab-bar--vertical {
    border-bottom: none;
    border-right: 2px solid var(--q-colors-border, #dcdfe6);
}

/* 标签按钮 — 覆盖 Toggle 默认样式 */
.q-tab-bar .q-toggle {
    border: none;
    border-bottom: 2px solid transparent;
    border-radius: 0;
    margin-bottom: -2px;
    background: transparent;
    padding: 8px 16px;
    font-weight: 400;
}

.q-tab-bar .q-toggle:hover {
    background: var(--q-colors-ghost-hover, rgba(128, 128, 128, 0.1));
}

.q-tab-bar .q-toggle--pressed {
    border-bottom-color: var(--q-colors-primary, #0078d4);
    color: var(--q-colors-primary, #0078d4);
    background: transparent;
    font-weight: 600;
}

/* 竖向标签栏 */
.q-tab-bar--vertical .q-toggle {
    border-bottom: none;
    border-right: 2px solid transparent;
    margin-bottom: 0;
    margin-right: -2px;
}

.q-tab-bar--vertical .q-toggle--pressed {
    border-right-color: var(--q-colors-primary, #0078d4);
}
`;
