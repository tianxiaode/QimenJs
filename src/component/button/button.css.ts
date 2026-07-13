/**
 * Button 按钮组件样式
 *
 * 支持 default/primary/success/warning/danger 五种类型，
 * small/medium/large 三种尺寸，以及禁用状态。
 */

export const buttonCSS = `
/* Button 根元素 */
.q-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 16px;
    border: 1px solid var(--q-border-color, #dcdfe6);
    border-radius: var(--q-border-radius, 4px);
    font-size: 14px;
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
    transition: all 0.2s;
    box-sizing: border-box;
    outline: none;
    user-select: none;
    background: #fff;
    color: var(--q-text-color, #606266);
}

/* 类型：默认 */
.q-button--default {
    background: #fff;
    border-color: var(--q-border-color, #dcdfe6);
    color: var(--q-text-color, #606266);
}

/* 类型：主要 */
.q-button--primary {
    background: var(--q-color-primary, #409eff);
    border-color: var(--q-color-primary, #409eff);
    color: #fff;
}

/* 类型：成功 */
.q-button--success {
    background: var(--q-color-success, #67c23a);
    border-color: var(--q-color-success, #67c23a);
    color: #fff;
}

/* 类型：警告 */
.q-button--warning {
    background: var(--q-color-warning, #e6a23c);
    border-color: var(--q-color-warning, #e6a23c);
    color: #fff;
}

/* 类型：危险 */
.q-button--danger {
    background: var(--q-color-danger, #f56c6c);
    border-color: var(--q-color-danger, #f56c6c);
    color: #fff;
}

/* 尺寸：小 */
.q-button--small {
    height: 28px;
    padding: 0 12px;
    font-size: 12px;
}

/* 尺寸：中 */
.q-button--medium {
    height: 36px;
    padding: 0 16px;
    font-size: 14px;
}

/* 尺寸：大 */
.q-button--large {
    height: 44px;
    padding: 0 20px;
    font-size: 16px;
}

/* 禁用状态 */
.q-button--disabled {
    cursor: not-allowed;
    opacity: 0.6;
}

/* 内容文本 */
.q-button__content {
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

/* 下拉展开箭头 */
.q-button .q-expand-arrow {
    margin-left: 6px;
}

/* 下拉按钮模式 */
.q-button--dropdown {
    padding-right: 8px;
}
`;
