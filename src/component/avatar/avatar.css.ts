/**
 * Avatar 头像组件样式
 *
 * 圆形裁切，三种尺寸。
 * 文字头像自动生成背景色（基于文字首字符 hash）。
 */

export const avatarCSS = `
/* Avatar 根元素 */
.q-avatar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    overflow: hidden;
    background: var(--q-colors-bg-secondary, #e0e0e0);
    color: var(--q-colors-on-bg-secondary, #555);
    font-weight: 600;
    flex-shrink: 0;
    box-sizing: border-box;
}

/* 尺寸 */
.q-avatar--sm {
    width: 28px;
    height: 28px;
    font-size: 12px;
}

.q-avatar--md {
    width: 36px;
    height: 36px;
    font-size: 14px;
}

.q-avatar--lg {
    width: 48px;
    height: 48px;
    font-size: 18px;
}

/* 图片 */
.q-avatar__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
}

/* 文字 */
.q-avatar__text {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    line-height: 1;
    user-select: none;
}

/* 文字头像背景色 — 基于首字符 hash */
.q-avatar--sm .q-avatar__text,
.q-avatar--md .q-avatar__text,
.q-avatar--lg .q-avatar__text {
    color: #fff;
}

/* 图标 */
.q-avatar__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
}

.q-avatar__icon .q-icon {
    font-size: inherit;
}
`;