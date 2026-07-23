/**
 * Form 表单组件样式 — Metro 风格
 *
 * 垂直布局为主，字段间统一间距。
 * 方角、粗边框、高对比色块。
 */

export const formCSS = `
.q-form {
    display: flex;
    flex-direction: column;
    gap: 0;
    box-sizing: border-box;
    color: var(--q-colors-text, #1a1a1a);
}

.q-form__fields {
    display: flex;
    flex-direction: column;
    gap: var(--q-form-field-gap, 16px);
}

.q-form--horizontal .q-form__fields {
    flex-direction: row;
    flex-wrap: wrap;
    gap: var(--q-form-field-gap, 16px);
}

.q-form--horizontal .q-form__fields > * {
    flex: 1 1 calc(50% - var(--q-form-field-gap, 16px) / 2);
    min-width: 200px;
}

.q-form__actions {
    display: flex;
    gap: 8px;
    padding-top: calc(var(--q-form-field-gap, 16px) / 2);
    justify-content: flex-end;
}

.q-form--submitting {
    opacity: 0.7;
    pointer-events: none;
}
`;
