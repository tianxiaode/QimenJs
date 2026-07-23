/**
 * PasswordInput 密码组件样式 — Metro 风格
 *
 * 可见性切换按钮（actions 内 Icon 组件）+ 密码强度指示器（infoGroup 内）。
 * 依赖 input.css.ts 的基础样式。
 */

export const passwordCSS = `
/* ═══════════════════════════════════════════════════
 * 可见性切换按钮（actions 内 Icon 组件）
 * ═══════════════════════════════════════════════════ */

.q-password-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--q-colors-text-placeholder, #bfbfbf);
    cursor: pointer;
    border-radius: 0;
    transition: color 0.15s;
}

.q-password-toggle:hover {
    color: var(--q-colors-text-secondary, #666);
}

.q-input--password.q-input--focused .q-password-toggle {
    color: var(--q-colors-primary, #0078d4);
}

/* ═══════════════════════════════════════════════════
 * 密码强度指示器（infoGroup 内 PasswordStrength 组件）
 * ═══════════════════════════════════════════════════ */

.q-password-strength {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.q-password-strength__bar {
    position: relative;
    width: 100%;
    height: 4px;
    background: var(--q-colors-border, #dcdfe6);
    border-radius: 0;
    overflow: hidden;
}

.q-password-strength__fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 0%;
    background: var(--q-colors-error, #d13438);
    transition: width 0.2s, background-color 0.2s;
}

.q-password-strength__fill--0 {
    width: 0%;
    background: var(--q-colors-border, #dcdfe6);
}

.q-password-strength__fill--1 {
    width: 25%;
    background: #d13438;
}

.q-password-strength__fill--2 {
    width: 50%;
    background: #ff8c00;
}

.q-password-strength__fill--3 {
    width: 75%;
    background: #f7b500;
}

.q-password-strength__fill--4 {
    width: 100%;
    background: #107c10;
}

.q-password-strength__label {
    font-size: 12px;
    line-height: 1.5;
    color: var(--q-colors-text-secondary, #666);
}

.q-password-strength__label--1 { color: #d13438; }
.q-password-strength__label--2 { color: #ff8c00; }
.q-password-strength__label--3 { color: #f7b500; }
.q-password-strength__label--4 { color: #107c10; }

/* ═══════════════════════════════════════════════════
 * 尺寸变体适配
 * ═══════════════════════════════════════════════════ */

.q-input--sm .q-password-strength__bar {
    height: 3px;
}

.q-input--sm .q-password-strength__label {
    font-size: 11px;
}

.q-input--lg .q-password-strength__bar {
    height: 5px;
}

.q-input--lg .q-password-strength__label {
    font-size: 14px;
}
`;
