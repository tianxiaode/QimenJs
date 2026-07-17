/**
 * Card 卡片组件样式 — Metro 风格
 *
 * 方角、粗边框、无阴影、纯色背景。
 */

export const cardCSS = `
/* Card 根元素 */
.q-card {
    display: flex;
    flex-direction: column;
    border: 2px solid var(--q-colors-border, #dcdfe6);
    border-radius: 0;
    background: var(--q-colors-bg, #fff);
    box-sizing: border-box;
}

/* 头部 */
.q-card__header {
    border-bottom: 2px solid var(--q-colors-border, #dcdfe6);
}

.q-card__header .q-header {
    padding: 10px 16px;
    background: var(--q-colors-bg-secondary, #f5f5f5);
}

/* 内容区 */
.q-card__body {
    flex: 1;
    padding: 16px;
    overflow: auto;
}

/* 底部 */
.q-card__footer {
    padding: 8px 16px;
    border-top: 2px solid var(--q-colors-border, #dcdfe6);
    background: var(--q-colors-bg-secondary, #f5f5f5);
}
`;