/**
 * Divider 分割线组件样式 — Metro 风格
 *
 * 水平/垂直分割线，支持文字标签和虚线样式。
 * 方角、简洁。
 */

export const dividerCSS = `
/* Divider 根元素 — 水平 */
.q-divider {
    display: block;
    width: 100%;
    height: 2px;
    margin: 16px 0;
    background: var(--q-colors-border, #dcdfe6);
    border: none;
    border-radius: 0;
    position: relative;
    overflow: visible;
    box-sizing: border-box;
}

/* 垂直分割线 */
.q-divider--vertical {
    display: inline-block;
    width: 2px;
    height: 100%;
    margin: 0 16px;
    background: var(--q-colors-border, #dcdfe6);
}

/* 虚线样式 */
.q-divider--dashed {
    background: repeating-linear-gradient(
        to right,
        var(--q-colors-border, #dcdfe6) 0,
        var(--q-colors-border, #dcdfe6) 8px,
        transparent 8px,
        transparent 16px
    );
    height: 2px;
}

.q-divider--vertical.q-divider--dashed {
    background: repeating-linear-gradient(
        to bottom,
        var(--q-colors-border, #dcdfe6) 0,
        var(--q-colors-border, #dcdfe6) 8px,
        transparent 8px,
        transparent 16px
    );
    width: 2px;
}

/* 文字标签 */
.q-divider__text {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    padding: 0 12px;
    background: var(--q-colors-bg, #fff);
    color: var(--q-colors-text, #1a1a1a);
    font-size: 14px;
    white-space: nowrap;
}

/* 垂直分割线文字标签 */
.q-divider--vertical .q-divider__text {
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%) rotate(90deg);
    padding: 4px 8px;
}
`;
