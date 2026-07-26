/**
 * FileInput 文件输入组件样式 — Metro 风格
 *
 * 文件选择与上传，方角、粗边框、高对比。
 */

export const fileInputCSS = `
.q-file-input__body {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.q-file-input__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 36px;
    padding: 0 16px;
    font-size: 14px;
    font-weight: 600;
    color: var(--q-colors-text-on-primary, #fff);
    background: var(--q-colors-primary, #0078d4);
    border: 2px solid var(--q-colors-primary, #0078d4);
    border-radius: 0;
    cursor: pointer;
    user-select: none;
    white-space: nowrap;
}

.q-file-input__btn:hover {
    background: var(--q-colors-primary-hover, #106ebe);
    border-color: var(--q-colors-primary-hover, #106ebe);
}

.q-file-input__btn:active {
    background: var(--q-colors-primary-active, #005a9e);
    border-color: var(--q-colors-primary-active, #005a9e);
}

.q-file-input--disabled .q-file-input__btn {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
}

.q-file-input__list {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.q-file-input__item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    font-size: 13px;
    background: var(--q-colors-bg, #fff);
    border: 1px solid var(--q-colors-border, #dcdfe6);
    border-radius: 0;
}

.q-file-input__name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--q-colors-text, #1a1a1a);
}

.q-file-input__size {
    color: var(--q-colors-text-secondary, #666);
    white-space: nowrap;
}

.q-file-input__status {
    color: var(--q-colors-text-secondary, #666);
    white-space: nowrap;
    min-width: 60px;
    text-align: right;
}

.q-file-input__item--uploaded .q-file-input__status {
    color: var(--q-colors-success, #107c10);
}

.q-file-input__item--error .q-file-input__status {
    color: var(--q-colors-error, #d13438);
}

.q-file-input__remove {
    cursor: pointer;
    color: var(--q-colors-text-secondary, #666);
    font-size: 16px;
    line-height: 1;
    padding: 0 4px;
}

.q-file-input__remove:hover {
    color: var(--q-colors-error, #d13438);
}

.q-file-input__progress {
    width: 80px;
    height: 4px;
    background: var(--q-colors-border, #dcdfe6);
    overflow: hidden;
}

.q-file-input__progress-bar {
    height: 100%;
    background: var(--q-colors-primary, #0078d4);
    transition: width 0.2s ease;
}
`;
