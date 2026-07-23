/**
 * Alert 页面内提示条组件样式 — Metro 风格
 *
 * 静态嵌入页面的提示信息，支持 info/success/warning/error 四种类型。
 * 方角、粗边框、高对比色块。
 */

export const alertCSS = `
/* Alert 根元素 */
.q-alert {
    display: flex;
    align-items: flex-start;
    padding: 12px 16px;
    border: 2px solid var(--q-colors-border, #dcdfe6);
    border-left-width: 4px;
    border-radius: 0;
    font-size: 14px;
    line-height: 1.5;
    box-sizing: border-box;
    background: var(--q-colors-bg, #fff);
    color: var(--q-colors-text, #1a1a1a);
}

/* 类型：信息 */
.q-alert--info {
    border-left-color: var(--q-colors-primary, #0078d4);
    background: var(--q-colors-info-bg, #deecf9);
}

.q-alert--info .q-alert__icon {
    color: var(--q-colors-primary, #0078d4);
}

/* 类型：成功 */
.q-alert--success {
    border-left-color: var(--q-colors-success, #107c10);
    background: var(--q-colors-success-bg, #dff6dd);
}

.q-alert--success .q-alert__icon {
    color: var(--q-colors-success, #107c10);
}

/* 类型：警告 */
.q-alert--warning {
    border-left-color: var(--q-colors-warning, #ca5010);
    background: var(--q-colors-warning-bg, #fff4ce);
}

.q-alert--warning .q-alert__icon {
    color: var(--q-colors-warning, #ca5010);
}

/* 类型：错误 */
.q-alert--error {
    border-left-color: var(--q-colors-error, #d13438);
    background: var(--q-colors-error-bg, #fde7e9);
}

.q-alert--error .q-alert__icon {
    color: var(--q-colors-error, #d13438);
}

/* 类型图标 */
.q-alert__icon {
    flex-shrink: 0;
    margin-right: 12px;
    font-size: 16px;
    font-weight: 700;
    line-height: 1.5;
}

/* 内容区 */
.q-alert__body {
    flex: 1;
    min-width: 0;
}

/* 标题 */
.q-alert__title {
    font-weight: 700;
    font-size: 14px;
    margin-bottom: 4px;
}

/* 文本内容 */
.q-alert__text {
    font-size: 14px;
}

/* 关闭按钮 */
.q-alert__close {
    flex-shrink: 0;
    margin-left: 12px;
    cursor: pointer;
    font-size: 16px;
    line-height: 1;
    color: var(--q-colors-text-secondary, #666);
    transition: color 0.15s;
    background: none;
    border: none;
    padding: 0;
    user-select: none;
}

.q-alert__close:hover {
    color: var(--q-colors-error, #d13438);
}
`;
