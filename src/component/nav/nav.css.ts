/**
 * Nav 组件样式
 *
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

/* NavItem 导航项 */
.q-nav-item {
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
    transition: all var(--q-transition-fast, 0.15s);
    border-left: 3px solid transparent;
}

.q-nav-item__content {
    display: flex;
    align-items: center;
    gap: var(--q-spacing-sm, 8px);
    width: 100%;
    padding: var(--q-spacing-sm, 8px) var(--q-spacing-lg, 16px);
    color: var(--q-colors-text-secondary, #909399);
    text-decoration: none;
    transition: all var(--q-transition-fast, 0.15s);
}

.q-nav-item__icon {
    display: flex;
    align-items: center;
    font-size: var(--q-font-size-lg, 18px);
}

.q-nav-item__text {
    font-size: var(--q-font-size-md, 14px);
    white-space: nowrap;
}

/* hover */
.q-nav-item:hover .q-nav-item__content {
    color: var(--q-colors-primary, #409eff);
    background: var(--q-colors-bg-secondary, #f5f7fa);
}

/* active */
.q-nav-item--active {
    border-left-color: var(--q-colors-primary, #409eff);
}

.q-nav-item--active .q-nav-item__content {
    color: var(--q-colors-primary, #409eff);
    background: var(--q-colors-bg-secondary, #f5f7fa);
    font-weight: var(--q-font-weight-medium, 500);
}

/* disabled */
.q-nav-item--disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
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
