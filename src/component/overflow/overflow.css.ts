/**
 * Overflow 溢出组件样式 — Metro 风格
 *
 * 包含 OverflowMenu（溢出菜单）和 OverflowScroll（溢出滚动）两个组件。
 * 方角、简洁、高对比。
 */

export const overflowCSS = `
/* ═══════════════════════════════════════════════════
 * OverflowMenu 溢出菜单
 * ═══════════════════════════════════════════════════ */

/* 溢出菜单根元素 */
.q-overflow-menu-overlay {
    display: block;
}

.q-overflow-menu-overlay--horizontal {
    display: block;
}

.q-overflow-menu-overlay--vertical {
    display: block;
}

/* 溢出容器溢出状态 */
.q-overflow-menu-container--overflowing {
    overflow: hidden;
}

/* 触发按钮 */
.q-overflow-menu__trigger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: 2px solid var(--q-colors-border, #dcdfe6);
    background: var(--q-colors-bg, #fff);
    color: var(--q-colors-text, #1a1a1a);
    cursor: pointer;
    box-sizing: border-box;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
    user-select: none;
}

.q-overflow-menu__trigger:hover {
    background: var(--q-colors-primary-hover, #106ebe);
    border-color: var(--q-colors-primary-hover, #106ebe);
    color: var(--q-colors-on-primary, #fff);
}

.q-overflow-menu__trigger--active {
    background: var(--q-colors-primary, #0078d4);
    border-color: var(--q-colors-primary, #0078d4);
    color: var(--q-colors-on-primary, #fff);
}

.q-overflow-menu__trigger i {
    display: block;
    width: 6px;
    height: 6px;
    background: currentColor;
    border-radius: 0;
}

.q-overflow-menu__trigger--horizontal i {
    box-shadow:
        0 -8px 0 currentColor,
        0 8px 0 currentColor;
    background: currentColor;
}

.q-overflow-menu__trigger--vertical i {
    box-shadow:
        -8px 0 0 currentColor,
        8px 0 0 currentColor;
    background: currentColor;
}

/* ═══════════════════════════════════════════════════
 * OverflowScroll 溢出滚动
 * ═══════════════════════════════════════════════════ */

/* 滚动浮层根元素 */
.q-overflow-scroll-overlay {
    display: block;
}

.q-overflow-scroll-overlay--horizontal {
    display: block;
}

.q-overflow-scroll-overlay--vertical {
    display: block;
}

/* 箭头按钮 */
.q-overflow-arrow {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: 2px solid var(--q-colors-border, #dcdfe6);
    background: var(--q-colors-bg, #fff);
    color: var(--q-colors-text, #1a1a1a);
    cursor: pointer;
    box-sizing: border-box;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
    user-select: none;
}

.q-overflow-arrow:hover {
    background: var(--q-colors-primary-hover, #106ebe);
    border-color: var(--q-colors-primary-hover, #106ebe);
    color: var(--q-colors-on-primary, #fff);
}

/* 水平方向 — 左箭头 */
.q-overflow-arrow--horizontal.q-overflow-arrow--prev {
    clip-path: polygon(50% 0%, 50% 100%, 0% 50%);
}

/* 水平方向 — 右箭头 */
.q-overflow-arrow--horizontal.q-overflow-arrow--next {
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%);
}

/* 垂直方向 — 上箭头 */
.q-overflow-arrow--vertical.q-overflow-arrow--prev {
    clip-path: polygon(0% 50%, 100% 50%, 50% 0%);
}

/* 垂直方向 — 下箭头 */
.q-overflow-arrow--vertical.q-overflow-arrow--next {
    clip-path: polygon(0% 50%, 100% 50%, 50% 100%);
}

/* 滚动状态类 — 宿主容器 */
.q-overflow-scroll--can-prev {
    /* 可向前滚动状态 */
}

.q-overflow-scroll--can-next {
    /* 可向后滚动状态 */
}

.q-overflow-scroll--overflowing {
    overflow: hidden;
}
`;
