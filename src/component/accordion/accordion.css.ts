/**
 * Accordion 手风琴组件样式 — Metro 风格
 *
 * 垂直排列的 Panel 组，单选互斥展开。
 * Panel 间距为 0，通过边框合并实现紧凑布局。
 */

export const accordionCSS = `
/* Accordion 根元素 */
.q-accordion {
    display: flex;
    flex-direction: column;
}

.q-accordion--horizontal {
    flex-direction: row;
}

/* 子项挂载区 */
.q-accordion__items {
    display: flex;
    flex-direction: column;
    width: 100%;
}

.q-accordion--horizontal > .q-accordion__items {
    flex-direction: row;
}

/* Panel 间距合并 */
.q-accordion .q-panel {
    border-radius: 0;
}

.q-accordion .q-panel + .q-panel {
    border-top: 0;
}

.q-accordion--horizontal .q-panel + .q-panel {
    border-top: 2px solid var(--q-colors-border, #dcdfe6);
    border-left: 0;
}

/* header 可点击 */
.q-accordion .q-panel__header {
    cursor: pointer;
}
`;
