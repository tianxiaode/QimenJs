/**
 * OneTimePassword 验证码输入组件样式 — Metro 风格
 *
 * N 位验证码输入框，方角、粗边框、等宽紧凑。
 */

export const oneTimePasswordCSS = `
.q-otp__container {
    display: inline-flex;
    gap: 8px;
    align-items: center;
}

.q-otp__input {
    width: 40px;
    height: 48px;
    text-align: center;
    font-size: 20px;
    font-weight: 600;
    font-family: var(--q-fonts-mono, 'Consolas', 'Courier New', monospace);
    line-height: 1;
    color: var(--q-colors-text, #1a1a1a);
    background: var(--q-colors-bg, #fff);
    border: 2px solid var(--q-colors-border, #dcdfe6);
    border-radius: 0;
    outline: none;
    padding: 0;
    caret-color: var(--q-colors-primary, #0078d4);
}

.q-otp__input:focus {
    border-color: var(--q-colors-primary, #0078d4);
    box-shadow: inset 0 0 0 1px var(--q-colors-primary, #0078d4);
}

.q-otp__input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: var(--q-colors-bg-disabled, #f5f5f5);
}

.q-otp__input[readonly] {
    background: var(--q-colors-bg-disabled, #f5f5f5);
    cursor: default;
}

.q-otp--disabled .q-otp__input {
    opacity: 0.5;
    cursor: not-allowed;
}

.q-otp--readonly .q-otp__input {
    background: var(--q-colors-bg-disabled, #f5f5f5);
    cursor: default;
}

.q-otp--error .q-otp__input {
    border-color: var(--q-colors-error, #d13438);
}

.q-otp--error .q-otp__input:focus {
    box-shadow: inset 0 0 0 1px var(--q-colors-error, #d13438);
}
`;
