/**
 * HeaderCell 表头单元格共享样式 — Metro 风格
 */

export const headerCellCSS = `
/* HeaderCell 基础 */
.q-header-cell {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    flex-shrink: 0;
    border-right: 1px solid var(--q-colors-border, #e0e0e0);
    border-bottom: 1px solid var(--q-colors-border, #e0e0e0);
    background: var(--q-colors-bg-secondary, #f5f5f5);
    font-size: 13px;
    font-weight: 600;
    color: var(--q-colors-text, #1a1a1a);
    user-select: none;
    overflow: hidden;
}

/* ─── Leaf ─── */
.q-header-cell--leaf {
    flex-direction: row;
    align-items: center;
    height: var(--q-table-header-height, 36px);
}

.q-header-cell__content {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
    padding: 0 8px;
    overflow: hidden;
    cursor: pointer;
}

.q-header-cell__title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex-shrink: 0;
}

.q-header-cell__sort {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    margin-left: 4px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    color: var(--q-colors-text-secondary, #999);
}

.q-header-cell__sort--asc::before  { content: '▲'; color: var(--q-colors-primary, #0078d4); }
.q-header-cell__sort--desc::before { content: '▼'; color: var(--q-colors-primary, #0078d4); }
.q-header-cell__sort--none::before { content: '▲'; opacity: 0.3; }

.q-header-cell__resize {
    flex-shrink: 0;
    width: 6px;
    height: 100%;
    cursor: col-resize;
    border-left: 1px solid var(--q-colors-border, #e0e0e0);
    transition: background 0.15s;
}

.q-header-cell__resize:hover,
.q-header-cell__resize--active {
    background: var(--q-colors-primary, #0078d4);
}

/* ─── Group ─── */
.q-header-cell--group {
    height: auto;
    position: relative;
}

.q-header-cell__group-body {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
}

.q-header-cell--group > .q-header-cell__group-body > .q-header-cell__title {
    padding: 6px 8px;
    border-bottom: 1px solid var(--q-colors-border, #e0e0e0);
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.q-header-cell__children {
    display: flex;
    flex-direction: row;
}

.q-header-cell--group > .q-header-cell__resize {
    position: absolute;
    right: 0;
    top: 0;
    height: 100%;
}
`;
