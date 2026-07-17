/**
 * ToggleIcon 图标切换样式 — Metro 风格
 *
 * 方角图标按钮，on/off 态通过图标本身区分，
 * 容器仅提供点击区域和 hover 反馈。
 */

export const toggleIconCSS = `
/* ToggleIcon 根元素 */
.q-toggle-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: 2px solid transparent;
    border-radius: 0;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
    box-sizing: border-box;
    outline: none;
    user-select: none;
    background: transparent;
}

.q-toggle-icon:hover {
    background: var(--q-colors-ghost-hover, rgba(128, 128, 128, 0.1));
}

.q-toggle-icon:active {
    background: var(--q-colors-ghost-active, rgba(128, 128, 128, 0.15));
}

/* On 态 — 可选：微弱底色提示 */
.q-toggle-icon--on {
    background: var(--q-colors-primary-hover, rgba(0, 120, 212, 0.08));
}

.q-toggle-icon--on:hover {
    background: var(--q-colors-primary-hover, rgba(0, 120, 212, 0.15));
}

/* 禁用态 */
.q-toggle-icon--disabled {
    cursor: not-allowed;
    opacity: 0.4;
}

/* 尺寸 */
.q-toggle-icon--sm {
    width: 28px;
    height: 28px;
}

.q-toggle-icon--md {
    width: 36px;
    height: 36px;
}

.q-toggle-icon--lg {
    width: 44px;
    height: 44px;
}

/* 图标 */
.q-toggle-icon__icon {
    display: flex;
    align-items: center;
    justify-content: center;
}
`;