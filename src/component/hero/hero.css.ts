/**
 * Hero 横幅区域组件样式 — Metro 风格
 *
 * 大图/横幅展示区，支持标题、副标题、描述和操作按钮。
 * 适用于首页 Hero、活动横幅、空状态提示等场景。
 * 方角、高对比色块。
 */

export const heroCSS = `
/* Hero 根元素 */
.q-hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 32px;
    text-align: center;
    background: var(--q-colors-hero-bg, var(--q-colors-bg, #fff));
    color: var(--q-colors-text, #1a1a1a);
    box-sizing: border-box;
}

/* 主标题 */
.q-hero__title {
    font-size: 32px;
    font-weight: 700;
    line-height: 1.2;
    margin: 0 0 12px 0;
    color: var(--q-colors-text, #1a1a1a);
}

/* 副标题 */
.q-hero__subtitle {
    font-size: 20px;
    font-weight: 600;
    line-height: 1.3;
    margin: 0 0 8px 0;
    color: var(--q-colors-text-secondary, #666);
}

/* 描述文字 */
.q-hero__desc {
    font-size: 16px;
    line-height: 1.6;
    margin: 0 0 24px 0;
    max-width: 600px;
    color: var(--q-colors-text-tertiary, #999);
}

/* 操作按钮区域 */
.q-hero__actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
}

/* 操作按钮 */
.q-hero__action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 12px 32px;
    font-size: 16px;
    font-weight: 600;
    line-height: 1;
    cursor: pointer;
    border: 2px solid var(--q-colors-primary, #0078d4);
    border-radius: 0;
    background: var(--q-colors-primary, #0078d4);
    color: var(--q-colors-on-primary, #fff);
    transition: background 0.15s, border-color 0.15s;
    box-sizing: border-box;
}

.q-hero__action-btn:hover {
    background: var(--q-colors-primary-hover, #106ebe);
    border-color: var(--q-colors-primary-hover, #106ebe);
}

.q-hero__action-btn:active {
    background: var(--q-colors-primary-active, #005a9e);
    border-color: var(--q-colors-primary-active, #005a9e);
}
`;
