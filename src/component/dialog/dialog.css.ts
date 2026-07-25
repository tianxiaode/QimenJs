/**
 * Dialog 对话框组件样式 — Metro 风格
 *
 * 纯内容浮层，由 OverlayDispatchCenter 调度。
 * 遮罩、z-index、挂载由调度中心管理，此处仅定义对话框容器样式。
 */

export const dialogCSS = `
/* Dialog 根元素（对话框容器，由调度中心定位到 center） */
.q-dialog {
    width: var(--q-dialog-width, 480px);
    max-width: calc(100vw - 32px);
    max-height: calc(100vh - 64px);
    display: flex;
    flex-direction: column;
    border: 2px solid var(--q-colors-border, #dcdfe6);
    border-radius: 0;
    background: var(--q-colors-bg, #fff);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
    pointer-events: auto;
}

/* 头部 — 场景覆盖 */
.q-dialog__header .q-header {
    padding: 12px 16px;
    border-bottom: 2px solid var(--q-colors-border, #dcdfe6);
}

.q-dialog__header .q-header__title {
    font-size: 16px;
}

.q-dialog__header .q-header__action {
    cursor: pointer;
}

/* 内容区 */
.q-dialog__body {
    flex: 1;
    padding: 16px;
    overflow: auto;
}
`;
