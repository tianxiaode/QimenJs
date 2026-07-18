export const toolbarCSS = `
.q-toolbar {
    display: flex;
    align-items: center;
}

.q-toolbar__items {
    display: flex;
    align-items: center;
}

.q-toolbar.q-itemgroup--vertical,
.q-toolbar .q-itemgroup--vertical {
    flex-direction: column;
}

.q-toolbar.q-collapsed .q-button__text,
.q-toolbar.q-collapsed .q-text {
    display: none;
}

.q-toolbar.q-flex-col.q-collapsed {
    width: fit-content;
}
`;
