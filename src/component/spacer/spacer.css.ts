/**
 * Spacer 弹性间距组件样式 — Metro 风格
 *
 * flex 布局中的弹性占位，自动填充剩余空间。
 * 可通过 size 指定固定宽度/高度。
 */

export const spacerCSS = `
/* Spacer 根元素 */
.q-spacer {
    display: block;
    box-sizing: border-box;
}

/* 弹性填充 */
.q-spacer--grow {
    flex: 1;
}
`;
