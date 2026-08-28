export const maskCSS = `
.q-overlay-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: auto;
    background: rgba(0, 0, 0, 0.5);
}
.q-overlay-mask--scoped {
    top: var(--mask-top, 0);
    left: var(--mask-left, 0);
    width: var(--mask-width, 0);
    height: var(--mask-height, 0);
    background: var(--mask-color, rgba(255, 255, 255, 0.7));
}
`;
