/**
 * 主题页 — 模板与渲染
 */

import { ThemeRegistrar } from '@qimenjs/theme';

export const THEME_TEMPLATE = `
<div class="theme-page">
    <h2 class="page-title">主题系统</h2>
    <div class="theme-grid"></div>
</div>
`;

const THEMES = [
    { name: 'light', label: '亮色' },
    { name: 'dark', label: '暗色' },
    { name: 'celadon', label: '青瓷' },
    { name: 'cinnabar', label: '朱砂' },
    { name: 'indigo', label: '靛蓝' },
    { name: 'yellow', label: '鹅黄' },
    { name: 'rosewood', label: '紫檀' },
    { name: 'ink', label: '墨色' },
    { name: 'dai', label: '黛色' },
];

export function renderThemePage(): void {
    const grid = document.querySelector('.theme-grid');
    if (!grid) return;

    grid.innerHTML = THEMES.map(t =>
        `<button class="theme-card" onclick="window.__switchTheme('${t.name}')">
            <div class="theme-preview" data-theme="${t.name}"></div>
            <span class="theme-label">${t.label}</span>
        </button>`
    ).join('');
}

/** 暴露主题切换到 window（供 onclick 调用） */
export function exposeThemeSwitch(): void {
    (window as any).__switchTheme = (name: string) => {
        ThemeRegistrar.getInstance().apply(name);
        console.log('[Theme] switched to', name);
    };
}
