/**
 * Tips 提示浮层组件样式 — Metro 风格
 *
 * 方角、无阴影、高对比色块。
 * 绝对定位在 anchor 元素附近，
 * 支持 top/bottom/left/right 四个方向。
 */

export const tipsCSS = `
/* Tips 根元素 */
.q-tips {
    position: absolute;
    display: none;
    pointer-events: none;
    z-index: 1;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.4;
    white-space: nowrap;
    padding: 6px 12px;
    border-radius: 0;
    background: var(--q-colors-text, #1a1a1a);
    color: var(--q-colors-bg, #fff);
}

/* 内容文本 */
.q-tips__content {
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

/* 浮层定位箭头 */
.q-tips .q-arrow {
    --q-arrow-color: var(--q-colors-text, #1a1a1a);
}
`;
