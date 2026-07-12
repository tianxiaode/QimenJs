/**
 * Badge 角标组件样式
 *
 * 绝对定位在 anchor 元素的角落，
 * 支持 dot/number/text 三种类型和四个方位。
 */

export const badgeCSS = `
/* Badge 根元素 */
.q-badge {
    position: absolute;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    z-index: 1;
    font-size: 12px;
    line-height: 1;
    white-space: nowrap;
}

/* 类型：圆点 */
.q-badge--dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--q-color-danger, #f56c6c);
}

/* 类型：数字/文本 */
.q-badge--number,
.q-badge--text {
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 9px;
    background: var(--q-color-danger, #f56c6c);
    color: #fff;
}

/* 位置：右上 */
.q-badge--top-right {
    top: 0;
    right: 0;
    transform: translate(50%, -50%);
}

/* 位置：左上 */
.q-badge--top-left {
    top: 0;
    left: 0;
    transform: translate(-50%, -50%);
}

/* 位置：右下 */
.q-badge--bottom-right {
    bottom: 0;
    right: 0;
    transform: translate(50%, 50%);
}

/* 位置：左下 */
.q-badge--bottom-left {
    bottom: 0;
    left: 0;
    transform: translate(-50%, 50%);
}

/* 内容文本 */
.q-badge__content {
    display: inline-flex;
    align-items: center;
    justify-content: center;
}
`;
