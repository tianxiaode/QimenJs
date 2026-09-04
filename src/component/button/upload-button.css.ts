/**
 * UploadButton 上传按钮组件样式 — Metro 风格
 *
 * 文件选择与上传，方角、粗边框、高对比。
 */

export const uploadButtonCSS = `
.q-upload-btn__body {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.q-upload-btn__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 36px;
    padding: 0 16px;
    font-size: var(--q-font-size-md, 14px);
    font-weight: var(--q-font-weight-semibold, 600);
    color: var(--q-color-text-on-primary, #fff);
    background: var(--q-color-primary, #0078d4);
    border: 2px solid var(--q-color-primary, #0078d4);
    border-radius: var(--q-radius-md, 4px);
    cursor: pointer;
    user-select: none;
    white-space: nowrap;
}

.q-upload-btn__btn:hover {
    background: var(--q-color-primary-hover, #106ebe);
    border-color: var(--q-color-primary-hover, #106ebe);
}

.q-upload-btn__btn:active {
    background: var(--q-color-primary-active, #005a9e);
    border-color: var(--q-color-primary-active, #005a9e);
}

.q-upload-btn--disabled .q-upload-btn__btn {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
}

.q-upload-btn__list {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.q-upload-btn__item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    font-size: 13px;
    background: var(--q-colors-bg, #fff);
    border: 1px solid var(--q-colors-border, #dcdfe6);
    border-radius: 0;
}

.q-upload-btn__name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--q-colors-text, #1a1a1a);
}

.q-upload-btn__size {
    color: var(--q-colors-text-secondary, #666);
    white-space: nowrap;
}

.q-upload-btn__status {
    color: var(--q-colors-text-secondary, #666);
    white-space: nowrap;
    min-width: 60px;
    text-align: right;
}

.q-upload-btn__item--uploaded .q-upload-btn__status {
    color: var(--q-colors-success, #107c10);
}

.q-upload-btn__item--error .q-upload-btn__status {
    color: var(--q-colors-error, #d13438);
}

.q-upload-btn__remove {
    cursor: pointer;
    color: var(--q-colors-text-secondary, #666);
    font-size: 16px;
    line-height: 1;
    padding: 0 4px;
}

.q-upload-btn__remove:hover {
    color: var(--q-colors-error, #d13438);
}

.q-upload-btn__progress {
    width: 80px;
    height: 4px;
    background: var(--q-colors-border, #dcdfe6);
    overflow: hidden;
}

.q-upload-btn__progress-bar {
    height: 100%;
    background: var(--q-colors-primary, #0078d4);
    transition: width 0.2s ease;
}
`;
