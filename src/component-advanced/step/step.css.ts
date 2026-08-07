/**
 * Step 步骤条组件样式 — Metro 风格
 *
 * 方角、粗线条、高对比状态色。
 */

export const stepCSS = `
/* Step 根元素 */
.q-step {
    display: block;
    font-size: 14px;
    line-height: 1.5;
    box-sizing: border-box;
}

/* 步骤项容器 */
.q-step__items {
    display: flex;
    align-items: flex-start;
}

/* 竖向布局 */
.q-step--vertical .q-step__items {
    flex-direction: column;
}

/* 步骤项 */
.q-step__item {
    display: flex;
    flex: 1;
    position: relative;
}

.q-step--vertical .q-step__item {
    padding-bottom: 16px;
}

.q-step--vertical .q-step__item:last-child {
    padding-bottom: 0;
}

/* 最后一个步骤项隐藏连接线 */
.q-step__item:last-child .q-step__tail {
    display: none;
}

/* 步骤头部（圆圈 + 连接线） */
.q-step__head {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    flex-shrink: 0;
}

.q-step--horizontal .q-step__head {
    width: 100%;
}

/* 圆圈 */
.q-step__circle {
    width: 28px;
    height: 28px;
    border: 2px solid var(--q-colors-border, #dcdfe6);
    border-radius: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 600;
    background: var(--q-colors-bg, #fff);
    z-index: 1;
    flex-shrink: 0;
    box-sizing: border-box;
}

.q-step__number {
    line-height: 1;
}

/* 连接线 */
.q-step__tail {
    flex: 1;
    height: 2px;
    background: var(--q-colors-border, #dcdfe6);
    margin: 0 4px;
    align-self: center;
}

.q-step--vertical .q-step__tail {
    width: 2px;
    height: 100%;
    min-height: 16px;
    margin: 4px 0;
    align-self: auto;
}

.q-step__tail--finish {
    background: var(--q-colors-primary, #0078d4);
}

/* 步骤内容 */
.q-step__body {
    padding: 0 8px;
}

.q-step--vertical .q-step__body {
    padding: 0 0 0 12px;
}

.q-step__title {
    font-weight: 600;
    color: var(--q-colors-text, #1a1a1a);
    white-space: nowrap;
}

.q-step__description {
    font-size: 12px;
    color: var(--q-colors-text-secondary, #666);
    margin-top: 2px;
}

/* === 状态 === */

/* 等待 */
.q-step__item--wait .q-step__circle {
    border-color: var(--q-colors-border, #dcdfe6);
    color: var(--q-colors-text-secondary, #666);
}
.q-step__item--wait .q-step__title {
    color: var(--q-colors-text-secondary, #666);
}

/* 进行中 */
.q-step__item--process .q-step__circle {
    border-color: var(--q-colors-primary, #0078d4);
    background: var(--q-colors-primary, #0078d4);
    color: #fff;
}
.q-step__item--process .q-step__title {
    color: var(--q-colors-primary, #0078d4);
    font-weight: 700;
}

/* 完成 */
.q-step__item--finish .q-step__circle {
    border-color: var(--q-colors-primary, #0078d4);
    color: var(--q-colors-primary, #0078d4);
}
.q-step__item--finish .q-step__title {
    color: var(--q-colors-text, #1a1a1a);
}

/* 错误 */
.q-step__item--error .q-step__circle {
    border-color: var(--q-colors-error, #d13438);
    color: var(--q-colors-error, #d13438);
}
.q-step__item--error .q-step__title {
    color: var(--q-colors-error, #d13438);
}
`;
