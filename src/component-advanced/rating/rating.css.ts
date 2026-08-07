/**
 * Rating 评分组件样式 — Metro 风格
 *
 * 星级评分，方角、高对比、紧凑排版。
 * 使用 CSS 伪元素绘制星形，无需图标字体依赖。
 */

export const ratingCSS = `
.q-rating {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    user-select: none;
}

.q-rating__star {
    position: relative;
    display: inline-block;
    width: 24px;
    height: 24px;
    font-size: 24px;
    line-height: 1;
    color: var(--q-colors-border, #dcdfe6);
}

.q-rating__star::before {
    content: '★';
    display: block;
    color: inherit;
}

.q-rating__star--full::before {
    color: var(--q-colors-warning, #ca5010);
}

.q-rating__star--empty::before {
    color: var(--q-colors-border, #dcdfe6);
}

.q-rating__star--half {
    position: relative;
}

.q-rating__star--half::before {
    color: var(--q-colors-border, #dcdfe6);
}

.q-rating__star-left,
.q-rating__star-right {
    position: absolute;
    top: 0;
    width: 50%;
    height: 100%;
    overflow: hidden;
}

.q-rating__star-left {
    left: 0;
}

.q-rating__star-right {
    right: 0;
}

.q-rating__star--half .q-rating__star-left::before {
    content: '★';
    color: var(--q-colors-warning, #ca5010);
}

.q-rating__star--half .q-rating__star-right::before {
    content: '★';
    color: var(--q-colors-border, #dcdfe6);
}

.q-rating--readonly {
    cursor: default;
    pointer-events: none;
}

.q-rating--disabled {
    cursor: not-allowed;
    opacity: 0.5;
    pointer-events: none;
}
`;
