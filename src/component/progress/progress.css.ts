/**
 * Progress 进度条组件样式 — Metro 风格
 *
 * 水平进度条，支持百分比、类型色、条纹动画。
 * 方角、粗边框、高对比色块。
 */

export const progressCSS = `
/* Progress 根元素 */
.q-progress {
    display: inline-flex;
    align-items: center;
    width: 100%;
    font-size: 14px;
    line-height: 1.5;
}

/* 进度轨道 */
.q-progress__track {
    flex: 1;
    height: 8px;
    background: var(--q-colors-border, #dcdfe6);
    border: 1px solid var(--q-colors-border, #dcdfe6);
    border-radius: 0;
    overflow: hidden;
    position: relative;
}

/* 进度填充条 */
.q-progress__bar {
    height: 100%;
    background: var(--q-colors-primary, #0078d4);
    border-radius: 0;
    transition: width 0.3s ease;
}

/* 类型：默认 */
.q-progress--default .q-progress__bar {
    background: var(--q-colors-primary, #0078d4);
}

/* 类型：成功 */
.q-progress--success .q-progress__bar {
    background: var(--q-colors-success, #107c10);
}

/* 类型：警告 */
.q-progress--warning .q-progress__bar {
    background: var(--q-colors-warning, #ca5010);
}

/* 类型：错误 */
.q-progress--error .q-progress__bar {
    background: var(--q-colors-error, #d13438);
}

/* 条纹动画 */
.q-progress--striped .q-progress__bar {
    background-image: linear-gradient(
        45deg,
        rgba(255, 255, 255, 0.15) 25%,
        transparent 25%,
        transparent 50%,
        rgba(255, 255, 255, 0.15) 50%,
        rgba(255, 255, 255, 0.15) 75%,
        transparent 75%,
        transparent
    );
    background-size: 16px 16px;
    animation: q-progress-stripes 1s linear infinite;
}

.q-progress--striped.q-progress--default .q-progress__bar {
    background-color: var(--q-colors-primary, #0078d4);
}

.q-progress--striped.q-progress--success .q-progress__bar {
    background-color: var(--q-colors-success, #107c10);
}

.q-progress--striped.q-progress--warning .q-progress__bar {
    background-color: var(--q-colors-warning, #ca5010);
}

.q-progress--striped.q-progress--error .q-progress__bar {
    background-color: var(--q-colors-error, #d13438);
}

/* 文字百分比 */
.q-progress__text {
    margin-left: 12px;
    font-size: 14px;
    font-weight: 600;
    color: var(--q-colors-text, #1a1a1a);
    min-width: 40px;
    text-align: right;
}

/* 条纹动画关键帧 */
@keyframes q-progress-stripes {
    0% {
        background-position: 16px 0;
    }
    100% {
        background-position: 0 0;
    }
}
`;
