/**
 * Icon 图标组件样式
 *
 * 基础图标封装：尺寸、对齐、交互态。
 * 配合 Font Awesome 等图标字体库使用。
 */

export const iconCSS = `
/* Icon 根元素 */
.q-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1em;
    height: 1em;
    font-size: inherit;
    line-height: 1;
    vertical-align: middle;
    speak: never;
    font-style: normal;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

/* 可点击图标 */
.q-icon--clickable {
    cursor: pointer;
    transition: color 0.15s, opacity 0.15s;
}

.q-icon--clickable:hover {
    color: var(--q-colors-primary, #0078d4);
}

.q-icon--clickable:active {
    opacity: 0.7;
}

/* 尺寸变体 */
.q-icon--small {
    font-size: 12px;
}

.q-icon--medium {
    font-size: 16px;
}

.q-icon--large {
    font-size: 20px;
}
`;
