/**
 * ItemGroup 项组组件样式 — Metro 风格
 *
 * 方角、粗边框分隔线、高对比色块。
 */

export const itemgroupCSS = `
/* ItemGroup 根元素 */
.q-itemgroup {
    display: flex;
    box-sizing: border-box;
}

/* 横向排列 */
.q-itemgroup--horizontal {
    flex-direction: row;
    align-items: center;
}

/* 纵向排列 */
.q-itemgroup--vertical {
    flex-direction: column;
    align-items: stretch;
}

/* 子项挂载区 */
.q-itemgroup__items {
    display: flex;
    box-sizing: border-box;
    width: 100%;
}

.q-itemgroup--horizontal > .q-itemgroup__items {
    flex-direction: row;
    align-items: center;
    flex-wrap: var(--q-itemgroup-wrap, nowrap);
}

.q-itemgroup--vertical > .q-itemgroup__items {
    flex-direction: column;
    align-items: stretch;
}

/* 换行 */
.q-itemgroup--wrap > .q-itemgroup__items {
    flex-wrap: wrap;
}

/* 居中 */
.q-itemgroup--center > .q-itemgroup__items {
    justify-content: center;
}

/* 两端对齐 */
.q-itemgroup--between > .q-itemgroup__items {
    justify-content: space-between;
}

/* 紧凑模式（减小间距） */
.q-itemgroup--compact > .q-itemgroup__items {
    gap: var(--q-itemgroup-compact-gap, 2px);
}

/* 分隔线模式（纵向时子项之间加分隔线） */
.q-itemgroup--divider.q-itemgroup--vertical > .q-itemgroup__items > :not([hidden]) + :not([hidden]) {
    border-top: 2px solid var(--q-colors-border, #e0e0e0);
    margin-top: var(--q-itemgroup-divider-gap, 0px);
    padding-top: var(--q-itemgroup-divider-gap, 0px);
}

/* 分隔线模式（横向时子项之间加分隔线） */
.q-itemgroup--divider.q-itemgroup--horizontal > .q-itemgroup__items > :not([hidden]) + :not([hidden]) {
    border-left: 2px solid var(--q-colors-border, #e0e0e0);
    margin-left: var(--q-itemgroup-divider-gap, 0px);
    padding-left: var(--q-itemgroup-divider-gap, 0px);
}

/* 多列 Grid 布局 */
.q-itemgroup__items--cols {
    display: grid;
    grid-template-columns: repeat(var(--q-itemgroup-cols, 1), 1fr);
    align-items: start;
}

/* ========================================
   Overflow 溢出样式
   overflow 节点作为 itemContainer 的兄弟节点，
   天然位置正确，不进入浮层层级
   ======================================== */

/* 溢出模式根容器 */
.q-itemgroup--overflow {
    gap: var(--q-itemgroup-overflow-gap, 0px);
}

.q-itemgroup--overflow > .q-itemgroup__items {
    flex: 1 1 auto;
    min-width: 0;
    min-height: 0;
}

/* ---- 横向溢出 ---- */
.q-itemgroup--overflow.q-itemgroup--horizontal > .q-itemgroup__items {
    overflow-x: auto;
    overflow-y: hidden;
    scroll-behavior: smooth;
    scrollbar-width: none;
}
.q-itemgroup--overflow.q-itemgroup--horizontal > .q-itemgroup__items::-webkit-scrollbar {
    display: none;
}

/* ---- 纵向溢出 ---- */
.q-itemgroup--overflow.q-itemgroup--vertical > .q-itemgroup__items {
    overflow-y: auto;
    overflow-x: hidden;
    scroll-behavior: smooth;
    scrollbar-width: none;
}
.q-itemgroup--overflow.q-itemgroup--vertical > .q-itemgroup__items::-webkit-scrollbar {
    display: none;
}

/* ---- scroll 模式下隐藏溢出项的裁剪 ---- */
.q-itemgroup--overflow.q-itemgroup--overflow-menu.q-itemgroup--horizontal > .q-itemgroup__items {
    overflow-x: hidden;
}
.q-itemgroup--overflow.q-itemgroup--overflow-menu.q-itemgroup--vertical > .q-itemgroup__items {
    overflow-y: hidden;
}

/* ========================================
   溢出按钮通用样式
   ======================================== */
.q-itemgroup__overflow-prev,
.q-itemgroup__overflow-next,
.q-itemgroup__overflow-more {
    display: none;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    cursor: pointer;
    user-select: none;
    box-sizing: border-box;
    background: var(--q-colors-bg, #ffffff);
    border: var(--q-itemgroup-overflow-border, 1px solid var(--q-colors-border, #e0e0e0));
    color: var(--q-colors-text, #333333);
    transition: background-color 0.15s ease, border-color 0.15s ease, opacity 0.15s ease;
    -webkit-tap-highlight-color: transparent;
}

.q-itemgroup__overflow-prev:hover,
.q-itemgroup__overflow-next:hover,
.q-itemgroup__overflow-more:hover {
    background: var(--q-colors-bg-hover, #f5f5f5);
}

.q-itemgroup__overflow-prev:active,
.q-itemgroup__overflow-next:active,
.q-itemgroup__overflow-more:active {
    background: var(--q-colors-bg-active, #e8e8e8);
}

/* 默认大小 */
.q-itemgroup--horizontal .q-itemgroup__overflow-prev,
.q-itemgroup--horizontal .q-itemgroup__overflow-next,
.q-itemgroup--horizontal .q-itemgroup__overflow-more {
    width: var(--q-itemgroup-overflow-size, 32px);
    height: var(--q-itemgroup-size, 32px);
}

.q-itemgroup--vertical .q-itemgroup__overflow-prev,
.q-itemgroup--vertical .q-itemgroup__overflow-next,
.q-itemgroup--vertical .q-itemgroup__overflow-more {
    width: var(--q-itemgroup-size, 32px);
    height: var(--q-itemgroup-overflow-size, 32px);
}

/* 按钮在 horizontal 下显示 */
.q-itemgroup--overflow.q-itemgroup--can-prev > .q-itemgroup__overflow-prev,
.q-itemgroup--overflow.q-itemgroup--can-next > .q-itemgroup__overflow-next,
.q-itemgroup--overflow.q-itemgroup--has-overflow > .q-itemgroup__overflow-more {
    display: flex;
}

/* 当无可滚动时隐藏 */
.q-itemgroup--overflow:not(.q-itemgroup--can-prev) > .q-itemgroup__overflow-prev,
.q-itemgroup--overflow:not(.q-itemgroup--can-next) > .q-itemgroup__overflow-next {
    display: none;
}

.q-itemgroup--overflow:not(.q-itemgroup--has-overflow) > .q-itemgroup__overflow-more {
    display: none;
}

/* ========================================
   图标：纯 CSS 绘制
   - 横向：左右箭头
   - 纵向：上下箭头
   - more: 三点图标
   ======================================== */

/* ---- prev 箭头 ---- */
.q-itemgroup__overflow-prev::before {
    content: '';
    display: block;
    width: 0;
    height: 0;
    border-style: solid;
}

.q-itemgroup--horizontal .q-itemgroup__overflow-prev::before {
    border-width: 5px 7px 5px 0;
    border-color: transparent var(--q-colors-text, #333333) transparent transparent;
    margin-left: 2px;
}

.q-itemgroup--vertical .q-itemgroup__overflow-prev::before {
    border-width: 0 5px 7px 5px;
    border-color: transparent transparent var(--q-colors-text, #333333) transparent;
    margin-top: 2px;
}

/* ---- next 箭头 ---- */
.q-itemgroup__overflow-next::before {
    content: '';
    display: block;
    width: 0;
    height: 0;
    border-style: solid;
}

.q-itemgroup--horizontal .q-itemgroup__overflow-next::before {
    border-width: 5px 0 5px 7px;
    border-color: transparent transparent transparent var(--q-colors-text, #333333);
    margin-right: 2px;
}

.q-itemgroup--vertical .q-itemgroup__overflow-next::before {
    border-width: 7px 5px 0 5px;
    border-color: var(--q-colors-text, #333333) transparent transparent transparent;
    margin-bottom: 2px;
}

/* ---- more 按钮图标 ---- */
.q-itemgroup__overflow-more::before {
    content: '';
    display: flex;
    gap: 3px;
    width: 9px;
    height: 9px;
    background:
        radial-gradient(circle, var(--q-colors-text, #333333) 1.5px, transparent 1.5px) 0 0 / 3px 9px,
        radial-gradient(circle, var(--q-colors-text, #333333) 1.5px, transparent 1.5px) 0 0 / 3px 9px,
        radial-gradient(circle, var(--q-colors-text, #333333) 1.5px, transparent 1.5px) 0 0 / 3px 9px;
    background-repeat: no-repeat;
    background-position: center;
}

.q-itemgroup__overflow-more {
    position: relative;
}

.q-itemgroup--horizontal .q-itemgroup__overflow-more::before {
    background-image:
        radial-gradient(circle, currentColor 1.5px, transparent 1.5px),
        radial-gradient(circle, currentColor 1.5px, transparent 1.5px),
        radial-gradient(circle, currentColor 1.5px, transparent 1.5px);
    background-size: 3px 3px, 3px 3px, 3px 3px;
    background-position: 3px center, 9px center, 15px center;
    background-repeat: no-repeat;
    width: 18px;
    height: 3px;
}

.q-itemgroup--vertical .q-itemgroup__overflow-more::before {
    background-image:
        radial-gradient(circle, currentColor 1.5px, transparent 1.5px),
        radial-gradient(circle, currentColor 1.5px, transparent 1.5px),
        radial-gradient(circle, currentColor 1.5px, transparent 1.5px);
    background-size: 3px 3px, 3px 3px, 3px 3px;
    background-position: center 3px, center 9px, center 15px;
    background-repeat: no-repeat;
    width: 3px;
    height: 18px;
}

/* ========================================
   状态样式
   ======================================== */

/* 禁用态 */
.q-itemgroup__overflow-prev[hidden],
.q-itemgroup__overflow-next[hidden],
.q-itemgroup__overflow-more[hidden] {
    display: none !important;
}

/* menu 模式激活态 */
.q-itemgroup__overflow-more--active {
    background: var(--q-colors-bg-active, #e8e8e8);
    border-color: var(--q-colors-primary, #1976d2);
}

/* 溢出整体态 */
.q-itemgroup--overflowing > .q-itemgroup__items {
    border-color: var(--q-colors-border, #e0e0e0);
}

/* 纵向模式下的边距调整 */
.q-itemgroup--vertical.q-itemgroup--overflow {
    flex-direction: column;
}
`;
