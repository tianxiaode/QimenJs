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
.q-toast {
    position: fixed;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    font-size: 14px;
    color: #334155;
    min-width: 200px;
    max-width: 300px;
    pointer-events: auto;
    z-index: 9999;
}

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
    color: #3b82f6;
}

.q-toast__icon--success::before {
    content: var(--q-toast-icon-success, '✓');
    color: #22c55e;
}

.q-toast__icon--warning::before {
    content: var(--q-toast-icon-warning, '⚠');
    color: #f59e0b;
}

.q-toast__icon--error::before {
    content: var(--q-toast-icon-error, '✕');
    color: #ef4444;
}

.q-toast__body {
    flex: 1;
}

.q-toast--titled {
    flex-direction: column;
    align-items: flex-start;
    min-width: 280px;
}

.q-notification {
    position: fixed;
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 12px 16px;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    font-size: 14px;
    color: #334155;
    pointer-events: auto;
    z-index: 9999;
    min-width: 300px;
}

.q-notification__body {
    flex: 1;
}

.q-notification__message {
    font-weight: 600;
    margin-bottom: 4px;
}

.q-notification__text {
    font-size: 13px;
    color: #64748b;
}

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
    color: #3b82f6;
}

.q-notification__icon--success::before {
    content: var(--q-toast-icon-success, '✓');
    color: #22c55e;
}

.q-notification__icon--warning::before {
    content: var(--q-toast-icon-warning, '⚠');
    color: #f59e0b;
}

.q-notification__icon--error::before {
    content: var(--q-toast-icon-error, '✕');
    color: #ef4444;
}
`;
