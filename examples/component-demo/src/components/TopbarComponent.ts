import { TemplateComponent } from '@qimenjs/component-core';
import { ButtonComponent, MenuComponent } from '@qimenjs/component';
import { ThemeRegistrar } from '@qimenjs/theme';
import LOGO_SVG from '../logo.svg?raw';

const THEME_LIST = [
    { key: 'light',    label: '浅色' },
    { key: 'dark',     label: '暗色' },
    { key: 'celadon',  label: '青瓷' },
    { key: 'cinnabar', label: '朱砂' },
    { key: 'indigo',   label: '靛蓝' },
    { key: 'yellow',   label: '明黄' },
    { key: 'rosewood', label: '紫檀' },
    { key: 'ink',      label: '水墨' },
    { key: 'dai',      label: '黛色' },
];

class TopbarComponent extends TemplateComponent.withTemplate({
    tpl: {
        tag: 'div',
        className: 'app-topbar',
        layout: 'hbox',
        align: 'center',
        children: [
            {
                tag: 'div', name: 'topbar:brand', className: 'topbar-brand',
                layout: 'hbox', align: 'center', gap: 10,
                children: [
                    { tag: 'span', className: 'topbar-brand-logo', text: LOGO_SVG },
                    { tag: 'span', name: 'topbar:brandText', content: 'brandText', className: 'topbar-brand-text' },
                ],
            },
            {
                tag: 'div', className: 'topbar-main',
                layout: 'hbox', align: 'center', gap: 4,
                children: [
                    {
                        name: 'topbar:toggleBtn', type: ButtonComponent, className: 'q-button--ghost',
                        props: { childProps: { icon: { props: { className: 'fa-solid fa-bars' } } } },
                        events: { click: { handler: 'onToggleNavClick', bridge: 'sidebar:toggle' } },
                    },
                    {
                        name: 'topbar:darkBtn', type: ButtonComponent, className: 'q-button--ghost',
                        props: { childProps: { icon: { props: { className: 'fa-solid fa-moon' } } } },
                        events: { click: { handler: 'onDarkToggleClick' } },
                    },
                    { tag: 'div', className: 'topbar-spacer' },
                    {
                        name: 'topbar:themeBtn', type: ButtonComponent, className: 'q-button--ghost',
                        props: { childProps: { icon: { props: { className: 'fa-solid fa-palette' } } }, text: { props: { innerHTML: '浅色' } } },
                        events: { click: { handler: 'onThemeBtnClick' } },
                    },
                ],
            },
        ],
    },
    body: {
        type: 'TopbarComponent',

        brandText: 'QimenJS',

        _navCollapsed: false,

        _currentTheme: 'light',

        _isDark: false,

        _themeMenu: null as MenuComponent | null,

        onToggleNavClick(): void {
            this._navCollapsed = !this._navCollapsed;
            this._syncBrandArea(this._navCollapsed ? 'collapsed' : 'expanded');
        },

        onDarkToggleClick(): void {
            this._isDark = !this._isDark;
            this._currentTheme = this._isDark ? 'dark' : 'light';
            ThemeRegistrar.getInstance().apply(this._currentTheme);
            const darkBtn = this.nodeMap?.['topbar']?.['darkBtn']?.component;
            if (darkBtn) darkBtn.icon = this._isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        },

        onThemeBtnClick(e: any): void {
            this._toggleThemeMenu(e);
        },

        _syncBrandArea(mode: string): void {
            const collapsed = mode === 'collapsed';
            const brandText = this.nodeMap?.['topbar']?.['brandText']?.el;
            if (brandText) brandText.style.display = collapsed ? 'none' : '';
            const topbarBrand = this.nodeMap?.['topbar']?.['brand']?.el;
            if (topbarBrand) topbarBrand.classList.toggle('topbar-brand--collapsed', collapsed);
        },

        _toggleThemeMenu(e: any): void {
            if (this._themeMenu && this._themeMenu.isOpen) {
                this._themeMenu.close();
                return;
            }
            const anchor = e.el || (e as any)?.currentTarget;
            const items = THEME_LIST.map(t => ({
                text: t.label,
                icon: t.key === this._currentTheme ? '<span style="color:var(--q-colors-primary,#0078d4)">●</span>' : '',
                onSelect: () => {
                    this._applyTheme(t.key, t.label);
                    if (this._themeMenu) this._themeMenu.close();
                },
            }));
            this._themeMenu = new MenuComponent({ anchor, placement: 'bottom', offset: 4, items });
            this._themeMenu.open();
        },

        _applyTheme(themeKey: string, themeLabel: string): void {
            this._currentTheme = themeKey;
            this._isDark = themeKey === 'dark';
            const themeBtn = this.nodeMap?.['topbar']?.['themeBtn']?.component;
            if (themeBtn) themeBtn.text = themeLabel;
            const darkBtn = this.nodeMap?.['topbar']?.['darkBtn']?.component;
            if (darkBtn) darkBtn.icon = this._isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
            ThemeRegistrar.getInstance().apply(themeKey);
        },
    },
}) {}

export { TopbarComponent };