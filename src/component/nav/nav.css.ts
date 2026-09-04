/**
 * Nav 组件样式 — Metro 风格
 *
 * 扁平、方角、粗边框、无渐变、高对比色块。
 * NavItemGroupComponent 和 NavItemComponent 的样式定义。
 * 使用 CSS 变量（--q-*）引用主题 Design Tokens。
 */

export const navCSS = `
/* Nav 根元素（从 itemgroup 派生，替换 class） */
.q-nav {
    display: flex;
    box-sizing: border-box;
}

.q-nav.q-itemgroup--vertical {
    flex-direction: column;
    align-items: stretch;
}

.q-nav > .q-itemgroup__items {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    width: 100%;
}

/* Nav collapsed 模式 — 窄栏 */
.q-nav--collapsed {
    width: var(--q-nav-collapsed-width, 56px);
}

.q-nav--collapsed > .q-itemgroup__items {
    align-items: center;
}

/* ─── 浮层样式 ─── */

.q-nav-overlay {
    background: var(--q-colors-bg, #fff);
    border: 2px solid var(--q-colors-border, #e0e0e0);
    border-radius: 0;
    box-shadow: none;
    min-width: 160px;
    max-width: 280px;
    padding: 4px 0;
}

.q-nav-overlay__list {
    display: flex;
    flex-direction: column;
}

.q-nav-overlay__item {
    display: flex;
    align-items: center;
    gap: var(--q-spacing-sm, 8px);
    padding: 8px 16px;
    color: var(--q-colors-text, #1a1a1a);
    cursor: pointer;
    white-space: nowrap;
    font-weight: 500;
    transition: background 0.15s, color 0.15s;
}

.q-nav-overlay__item:hover {
    color: var(--q-colors-primary, #0078d4);
    background: rgba(0, 120, 212, 0.06);
}

.q-nav-overlay__item-icon {
    display: flex;
    align-items: center;
    font-size: var(--q-font-size-md, 14px);
}

.q-nav-overlay__item-text {
    font-size: var(--q-font-size-md, 14px);
}

/* ─── Tooltip 样式 ─── */

.q-nav-tooltip {
    position: fixed;
    padding: 6px 12px;
    background: var(--q-colors-text, #1a1a1a);
    color: var(--q-colors-bg, #fff);
    font-size: var(--q-font-size-sm, 12px);
    font-weight: 600;
    border-radius: 0;
    white-space: nowrap;
    pointer-events: none;
    z-index: 9999;
}

/* RouteContainer 路由容器 */
.q-route-container {
    width: 100%;
    height: 100%;
    overflow: auto;
    box-sizing: border-box;
}

.q-route-container > div {
    width: 100%;
    height: 100%;
}
`;
