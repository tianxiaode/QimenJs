/**
 * 工具栏组件样式
 *
 * 定义工具栏折叠相关的 CSS 规则。
 * 折叠通过 CSS 类 q-collapsed 驱动，不涉及 DOM 重建。
 */

export const toolbarCSS = `
/* 工具栏折叠：隐藏子项的文本标签 */
.q-toolbar.q-collapsed .q-button__text,
.q-toolbar.q-collapsed .q-text {
    display: none;
}

/* 竖向工具栏折叠时收窄宽度 */
.q-toolbar.q-flex-col.q-collapsed {
    width: fit-content;
}
`;
