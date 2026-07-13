/**
 * Tips 提示浮层组件样式
 *
 * 绝对定位在 anchor 元素附近，
 * 支持 top/bottom/left/right 四个方向。
 *
 * 箭头样式由 ArrowAbility 的 arrowCSS 提供，
 * Tips 默认深色箭头无需额外覆盖。
 */

export const tipsCSS = `
/* Tips 根元素 */
.q-tips {
    position: absolute;
    display: none;
    pointer-events: none;
    z-index: 1;
    font-size: 12px;
    line-height: 1.4;
    white-space: nowrap;
    padding: 4px 8px;
    border-radius: 4px;
    background: var(--q-color-dark, #303133);
    color: #fff;
}

/* 内容文本 */
.q-tips__content {
    display: inline-flex;
    align-items: center;
    justify-content: center;
}
`;
