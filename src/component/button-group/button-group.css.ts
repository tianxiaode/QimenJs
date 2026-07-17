/**
 * ButtonGroup 按钮组样式 — Metro 风格
 *
 * 按钮组内子项紧密排列，选中态由 ToggleComponent 的 pressed 样式提供。
 */

export const buttonGroupCSS = `
/* 按钮组根元素 */
.q-button-group {
    display: inline-flex;
    align-items: center;
}

.q-button-group--vertical {
    flex-direction: column;
}

/* 子项间距归零 — 紧密排列 */
.q-button-group .q-itemgroup__items {
    gap: 0 !important;
}

/* 子项紧贴 — 去掉中间项的左右边框避免双线 */
.q-button-group .q-toggle {
    border-radius: 0;
}

/* 第一个子项保留左圆角（横向）或上圆角（竖向） */
.q-button-group:not(.q-button-group--vertical) .q-toggle:first-child {
    border-top-left-radius: 2px;
    border-bottom-left-radius: 2px;
}

.q-button-group--vertical .q-toggle:first-child {
    border-top-left-radius: 2px;
    border-top-right-radius: 2px;
}

/* 最后一个子项保留右圆角（横向）或下圆角（竖向） */
.q-button-group:not(.q-button-group--vertical) .q-toggle:last-child {
    border-top-right-radius: 2px;
    border-bottom-right-radius: 2px;
}

.q-button-group--vertical .q-toggle:last-child {
    border-bottom-left-radius: 2px;
    border-bottom-right-radius: 2px;
}

/* 中间项去掉重叠边框 */
.q-button-group:not(.q-button-group--vertical) .q-toggle + .q-toggle {
    margin-left: -2px;
}

.q-button-group--vertical .q-toggle + .q-toggle {
    margin-top: -2px;
}

/* 选中项层级提升，避免被边框遮挡 */
.q-button-group .q-toggle--pressed {
    z-index: 1;
}
`;
