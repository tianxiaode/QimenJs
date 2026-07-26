/**
 * Timeline 时间线组件样式 — Metro 风格
 *
 * 方角节点、粗竖线、紧凑布局。
 */

export const timelineCSS = `
/* Timeline 根元素 */
.q-timeline {
    display: block;
    font-size: 14px;
    line-height: 1.5;
    box-sizing: border-box;
}

/* 列表 */
.q-timeline__list {
    list-style: none;
    margin: 0;
    padding: 0;
}

/* 时间线项 */
.q-timeline__item {
    display: flex;
    position: relative;
    padding-bottom: 16px;
}

.q-timeline__item:last-child {
    padding-bottom: 0;
}

.q-timeline__item:last-child .q-timeline__tail {
    display: none;
}

/* 竖线 */
.q-timeline__tail {
    position: absolute;
    left: 5px;
    top: 16px;
    bottom: 0;
    width: 2px;
    background: var(--q-colors-border, #dcdfe6);
}

.q-timeline__tail--pending {
    background: repeating-linear-gradient(
        to bottom,
        var(--q-colors-border, #dcdfe6) 0px,
        var(--q-colors-border, #dcdfe6) 4px,
        transparent 4px,
        transparent 8px
    );
}

/* 节点圆点 */
.q-timeline__dot {
    width: 12px;
    height: 12px;
    border: 2px solid var(--q-colors-border, #dcdfe6);
    border-radius: 0;
    background: var(--q-colors-bg, #fff);
    flex-shrink: 0;
    z-index: 1;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
}

.q-timeline__dot--custom {
    width: auto;
    height: auto;
    border: none;
    background: none;
    font-size: 16px;
    line-height: 1;
}

/* 内容 */
.q-timeline__content {
    flex: 1;
    padding-left: 12px;
    min-width: 0;
}

.q-timeline__title {
    font-weight: 600;
    color: var(--q-colors-text, #1a1a1a);
}

.q-timeline__description {
    font-size: 13px;
    color: var(--q-colors-text-secondary, #666);
    margin-top: 2px;
}

.q-timeline__timestamp {
    font-size: 12px;
    color: var(--q-colors-text-secondary, #666);
    margin-top: 4px;
}

/* === 颜色状态 === */

.q-timeline__item--primary .q-timeline__dot {
    border-color: var(--q-colors-primary, #0078d4);
}
.q-timeline__item--primary .q-timeline__tail {
    background: var(--q-colors-primary, #0078d4);
}

.q-timeline__item--success .q-timeline__dot {
    border-color: var(--q-colors-success, #107c10);
    background: var(--q-colors-success, #107c10);
}
.q-timeline__item--success .q-timeline__tail {
    background: var(--q-colors-success, #107c10);
}

.q-timeline__item--warning .q-timeline__dot {
    border-color: var(--q-colors-warning, #ca5010);
}
.q-timeline__item--warning .q-timeline__tail {
    background: var(--q-colors-warning, #ca5010);
}

.q-timeline__item--error .q-timeline__dot {
    border-color: var(--q-colors-error, #d13438);
}
.q-timeline__item--error .q-timeline__tail {
    background: var(--q-colors-error, #d13438);
}
`;
