/**
 * Statistic 统计数值组件样式 — Metro 风格
 *
 * 大数字展示，常用于仪表盘概览。
 */

export const statisticCSS = `
/* Statistic 根元素 */
.q-statistic {
    display: inline-flex;
    align-items: flex-start;
    gap: 12px;
    box-sizing: border-box;
}

/* 图标 */
.q-statistic__icon {
    font-size: 24px;
    line-height: 1;
    color: var(--q-colors-primary, #0078d4);
    flex-shrink: 0;
}

/* 内容区 */
.q-statistic__content {
    display: flex;
    flex-direction: column;
    min-width: 0;
}

/* 标题 */
.q-statistic__title {
    font-size: 13px;
    color: var(--q-colors-text-secondary, #666);
    line-height: 1.4;
}

/* 数值组 */
.q-statistic__value-group {
    display: inline-flex;
    align-items: baseline;
    margin-top: 4px;
}

/* 前缀 */
.q-statistic__prefix {
    font-size: 16px;
    color: var(--q-colors-text, #1a1a1a);
    margin-right: 4px;
}

/* 数值 */
.q-statistic__value {
    font-size: 28px;
    font-weight: 600;
    color: var(--q-colors-text, #1a1a1a);
    line-height: 1;
    font-variant-numeric: tabular-nums;
}

/* 后缀 */
.q-statistic__suffix {
    font-size: 14px;
    color: var(--q-colors-text-secondary, #666);
    margin-left: 4px;
}

/* 趋势 */
.q-statistic__trend {
    font-size: 13px;
    font-weight: 600;
    margin-top: 4px;
    line-height: 1.4;
}

.q-statistic__trend--up {
    color: var(--q-colors-success, #107c10);
}

.q-statistic__trend--down {
    color: var(--q-colors-error, #d13438);
}

/* ═══════════════════════════════════════════════════
 * 尺寸变体
 * ═══════════════════════════════════════════════════ */

.q-statistic--sm .q-statistic__value {
    font-size: 20px;
}

.q-statistic--sm .q-statistic__prefix {
    font-size: 14px;
}

.q-statistic--lg .q-statistic__value {
    font-size: 36px;
}

.q-statistic--lg .q-statistic__prefix {
    font-size: 20px;
}
`;
