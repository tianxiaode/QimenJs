/**
 * Tabs 标签页样式 — Metro 风格
 *
 * 标签栏底部 2px 粗线指示 active，内容区无边框。
 */

export const tabsCSS = `
/* Tabs 根元素 */
.q-tabs {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
}

/* 标签栏 */
.q-tabs__bar {
    display: flex;
    align-items: stretch;
    border-bottom: 2px solid var(--q-colors-border, #dcdfe6);
    gap: 0;
}

/* 标签按钮 — 覆盖 Toggle 默认样式 */
.q-tabs__bar .q-toggle {
    border: none;
    border-bottom: 2px solid transparent;
    border-radius: 0;
    margin-bottom: -2px;
    background: transparent;
    padding: 8px 16px;
    font-weight: 400;
}

.q-tabs__bar .q-toggle:hover {
    background: var(--q-colors-ghost-hover, rgba(128, 128, 128, 0.1));
}

.q-tabs__bar .q-toggle--pressed {
    border-bottom-color: var(--q-colors-primary, #0078d4);
    color: var(--q-colors-primary, #0078d4);
    background: transparent;
    font-weight: 600;
}

/* 内容区 */
.q-tabs__content {
    flex: 1;
    padding: 12px 0;
}

.q-tabs__pane {
    display: block;
}
`;
