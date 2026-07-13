/**
 * ItemGroup 项组组件样式
 *
 * 支持横向/纵向排列、间距、换行、居中等场景。
 * 通过 CSS 变量可覆盖默认值。
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
    border-top: 1px solid var(--q-border-color, #dcdfe6);
    margin-top: var(--q-itemgroup-divider-gap, 0px);
    padding-top: var(--q-itemgroup-divider-gap, 0px);
}

/* 分隔线模式（横向时子项之间加分隔线） */
.q-itemgroup--divider.q-itemgroup--horizontal > .q-itemgroup__items > :not([hidden]) + :not([hidden]) {
    border-left: 1px solid var(--q-border-color, #dcdfe6);
    margin-left: var(--q-itemgroup-divider-gap, 0px);
    padding-left: var(--q-itemgroup-divider-gap, 0px);
}
`;
