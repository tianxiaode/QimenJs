export const tooltipCSS = `
.q-tooltip {
    position: absolute;
    display: none;
    pointer-events: none;
    z-index: 1;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.4;
    white-space: nowrap;
    padding: 6px 12px;
    border-radius: 0;
    background: var(--q-colors-text, #1a1a1a);
    color: var(--q-colors-bg, #fff);
}
.q-tooltip__content {
    display: inline-flex;
    align-items: center;
    justify-content: center;
}
.q-tooltip .q-arrow {
    --q-arrow-color: var(--q-colors-text, #1a1a1a);
}
`;