/**
 * 图标页 — 模板与渲染
 */

export const ICONS_TEMPLATE = `
<div class="icons-page">
    <h2 class="page-title">图标库 — 全部图标</h2>
    <div class="icon-grid"></div>
</div>
`;

const ICON_NAMES = [
    'save', 'refresh', 'edit', 'delete', 'add', 'copy', 'paste', 'cut',
    'undo', 'redo', 'close', 'check', 'print', 'lock', 'unlock', 'export',
    'back', 'forward', 'up', 'down', 'left', 'right', 'upload', 'download',
    'search', 'filter', 'settings', 'menu', 'more', 'home', 'dashboard', 'notification',
    'success', 'warning', 'error', 'info', 'question', 'star', 'heart', 'flag',
    'tag', 'bell', 'file', 'folder', 'calendar', 'clock', 'mail', 'chat',
    'chart-bar', 'table', 'shopping', 'cart', 'wallet', 'coin', 'order',
    'dragon', 'phoenix', 'lantern', 'teapot', 'bamboo', 'plum', 'seal', 'scroll',
    'abacus', 'brush', 'ink', 'fan', 'temple', 'greatwall', 'china', 'yin-yang',
];

export function renderIconGrid(): void {
    const grid = document.querySelector('.icon-grid');
    if (!grid) return;
    grid.innerHTML = ICON_NAMES.map(name =>
        `<div class="icon-item" title="q-icon-${name}">
            <i class="q-icon-${name}"></i>
            <span class="icon-name">${name}</span>
        </div>`
    ).join('');
}
