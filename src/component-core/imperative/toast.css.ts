/**
 * Toast 样式
 *
 * 图标通过 CSS ::before content 渲染，开发者覆盖 ::before 即可替换为任意图标方案。
 *
 * 图标替换方式（覆盖 ::before）：
 *   .q-toast__icon--info::before {
 *       content: '\f05a';
 *       font-family: 'Font Awesome 6 Free';
 *   }
 *
 * CSS 变量：
 * - --q-toast-icon-info：info 图标 content，默认 'ℹ'
 * - --q-toast-icon-success：success 图标 content，默认 '✓'
 * - --q-toast-icon-warning：warning 图标 content，默认 '⚠'
 * - --q-toast-icon-error：error 图标 content，默认 '✕'
 */

export const toastCSS = `
.q-toast__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-style: normal;
    -webkit-font-smoothing: antialiased;
}

.q-toast__icon::before {
    display: block;
}

.q-toast__icon--info::before {
    content: var(--q-toast-icon-info, 'ℹ');
}

.q-toast__icon--success::before {
    content: var(--q-toast-icon-success, '✓');
}

.q-toast__icon--warning::before {
    content: var(--q-toast-icon-warning, '⚠');
}

.q-toast__icon--error::before {
    content: var(--q-toast-icon-error, '✕');
}

/* notification 图标复用同一套变量 */
.q-notification__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-style: normal;
    -webkit-font-smoothing: antialiased;
}

.q-notification__icon::before {
    display: block;
}

.q-notification__icon--info::before {
    content: var(--q-toast-icon-info, 'ℹ');
}

.q-notification__icon--success::before {
    content: var(--q-toast-icon-success, '✓');
}

.q-notification__icon--warning::before {
    content: var(--q-toast-icon-warning, '⚠');
}

.q-notification__icon--error::before {
    content: var(--q-toast-icon-error, '✕');
}
`;
