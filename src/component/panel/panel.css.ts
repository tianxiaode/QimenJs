/**
 * Panel 面板组件样式 — Metro 风格
 *
 * 扁平、方角、粗边框、无渐变。
 * 支持折叠态（header action 按钮点击切换 body 显隐）。
 */

export const panelCSS = `
/* Panel 根元素 */
.q-panel {
    display: flex;
    flex-direction: column;
    border: 2px solid var(--q-colors-border, #dcdfe6);
    border-radius: 0;
    background: var(--q-colors-bg, #fff);
    box-sizing: border-box;
}

/* 标题栏 — 由 HeaderComponent 提供，此处仅做场景覆盖 */
.q-panel__header .q-header {
    padding: 8px 12px;
    border-bottom: 2px solid var(--q-colors-border, #dcdfe6);
    background: var(--q-colors-bg-secondary, #f5f5f5);
}

/* 内容区 */
.q-panel__body {
    flex: 1;
    padding: 12px;
    overflow: auto;
}

/* 折叠态 — body 隐藏 */
.q-panel--collapsed .q-panel__body {
    display: none;
}

/* 折叠态 — header 无下边框 */
.q-panel--collapsed .q-panel__header .q-header {
    border-bottom-color: transparent;
}
`;
