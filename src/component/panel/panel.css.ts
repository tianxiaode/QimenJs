/**
 * Panel 面板组件样式 — Metro 风格
 *
 * 扁平、方角、粗边框、无渐变。
 * 支持折叠态（header 箭头点击切换 body 显隐）。
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

/* 标题栏 */
.q-panel__header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-bottom: 2px solid var(--q-colors-border, #dcdfe6);
    background: var(--q-colors-bg-secondary, #f5f5f5);
    user-select: none;
    min-height: 40px;
}

/* 标题文本 */
.q-panel__title {
    flex: 1;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.4;
    color: var(--q-colors-text, #1a1a1a);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* 工具区 */
.q-panel__tools {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
}

.q-panel__tools--left {
    margin-right: 4px;
}

.q-panel__tools--right {
    margin-left: auto;
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
.q-panel--collapsed .q-panel__header {
    border-bottom-color: transparent;
}
`;
