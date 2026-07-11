/**
 * 侧边导航 — 渲染与高亮
 */

export function renderSidebar(): void {
    const appEl = document.getElementById('app')!;
    // 让 #app 成为 flex 容器
    appEl.style.display = 'flex';
    appEl.style.minHeight = '100vh';

    const nav = document.createElement('nav');
    nav.className = 'sidebar-nav';
    nav.innerHTML = `
        <div class="nav-brand">QimenJS Demo</div>
        <a href="#/" class="nav-item active" data-path="/">
            <i class="q-icon-home"></i> 首页
        </a>
        <a href="#/icons" class="nav-item" data-path="/icons">
            <i class="q-icon-dragon"></i> 图标库
        </a>
        <a href="#/theme" class="nav-item" data-path="/theme">
            <i class="q-icon-yin-yang"></i> 主题
        </a>
    `;
    appEl.prepend(nav);
}

export function updateNavHighlight(path: string): void {
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.toggle('active', el.getAttribute('data-path') === path);
    });
}
