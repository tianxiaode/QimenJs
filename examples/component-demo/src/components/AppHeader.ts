/**
 * AppHeader - 应用头部导航组件
 *
 * 包含：
 * - 项目 Logo 和名称
 * - 首页、组件、模板、文档 导航
 * - Dark 切换、主题选择、语言选择
 *
 * 监听路由变化更新导航高亮，
 * 监听 i18n 事件更新当前语言状态。
 */

import { Component } from '@qimenjs/component-core';
import { RouteEventBusAbility, SystemEventBusAbility } from '@qimenjs/system-abilities';
import { EventContextBuilder } from '@qimenjs/context';
import { ThemeRegistrar } from '@qimenjs/theme';
import { getI18nManager } from '@qimenjs/i18n';
import { SYSTEM_EVENTS } from '@qimenjs/events';
import { AppFooterComponent } from './AppFooter';



export class AppHeaderComponent extends Component {
    _navItems = [] as NavItem[];
    _activePath = '/';
    _isDark = false;
    _currentTheme = 'light';
    _currentLang = 'zh-CN';

    onAfterInit(): void {
        this._initNav();
        this._initActions();
        this._initDarkState();
        this._initRouteListener();
        this._initI18nListener();
    }

    _initNav(): void {
        const navEl = this.nodeMap.nav.el;
        navEl.innerHTML = '';

        for (const item of NAV_ITEMS) {
            const btn = document.createElement('button');
            btn.className = 'q-app-nav-item';
            btn.style.cssText = [
                'padding: 6px 14px',
                'border: none',
                'background: transparent',
                'border-radius: 4px',
                'cursor: pointer',
                'font-size: 14px',
                'color: var(--q-demo-text-secondary)',
                'display: flex',
                'align-items: center',
                'gap: 6px',
                'transition: all 0.15s',
            ].join(';');
            btn.dataset.path = item.path;

            if (item.icon) {
                const icon = document.createElement('i');
                icon.className = item.icon;
                icon.style.fontSize = '12px';
                btn.appendChild(icon);
            }

            const label = document.createElement('span');
            label.textContent = item.label;
            btn.appendChild(label);

            btn.addEventListener('click', () => {
                this._navigateTo(item.path);
            });

            navEl.appendChild(btn);
        }

        this._updateNavHighlight(this._activePath);
    }

    _initActions(): void {
        const actionsEl = this.nodeMap.actions.el;
        actionsEl.innerHTML = '';

        const darkBtn = this._createDarkToggle();
        actionsEl.appendChild(darkBtn);

        const themeSelect = this._createThemeSelect();
        actionsEl.appendChild(themeSelect);

        const langSelect = this._createLangSelect();
        actionsEl.appendChild(langSelect);
    }

    _createDarkToggle(): HTMLElement {
        const btn = document.createElement('button');
        btn.className = 'q-app-dark-toggle';
        btn.style.cssText = [
            'width: 32px',
            'height: 32px',
            'border: 1px solid var(--q-demo-border)',
            'border-radius: 4px',
            'background: transparent',
            'cursor: pointer',
            'display: flex',
            'align-items: center',
            'justify-content: center',
            'transition: all 0.15s',
        ].join(';');

        const icon = document.createElement('i');
        icon.className = 'fa-solid fa-moon';
        btn.appendChild(icon);

        btn.addEventListener('click', () => {
            this._toggleDark();
        });

        return btn;
    }

    _createThemeSelect(): HTMLElement {
        const select = document.createElement('select');
        select.className = 'q-app-header__select';

        for (const t of THEME_OPTIONS) {
            const opt = document.createElement('option');
            opt.value = t.value;
            opt.textContent = t.label;
            if (t.value === this._currentTheme) opt.selected = true;
            select.appendChild(opt);
        }

        select.addEventListener('change', () => {
            const theme = select.value;
            this._applyTheme(theme);
        });

        return select;
    }

    _createLangSelect(): HTMLElement {
        const select = document.createElement('select');
        select.className = 'q-app-header__select';

        for (const l of LANGUAGE_OPTIONS) {
            const opt = document.createElement('option');
            opt.value = l.value;
            opt.textContent = l.label;
            if (l.value === this._currentLang) opt.selected = true;
            select.appendChild(opt);
        }

        select.addEventListener('change', () => {
            const lang = select.value;
            this._switchLanguage(lang);
        });

        return select;
    }

    _initDarkState(): void {
        const saved = localStorage.getItem('qimenjs-theme');
        if (saved === 'dark') {
            this._isDark = true;
            this._currentTheme = 'dark';
            document.documentElement.classList.add('dark');
        }
    }

    _initRouteListener(): void {
        const off = this.routeOn('router', 'change', (data: any) => {
            const path = data?.path;
            if (path !== undefined) {
                this._activePath = path;
                this._updateNavHighlight(path);
            }
        });
        this.onCleanup(off);
    }

    _initI18nListener(): void {
        const off = this.systemOn(SYSTEM_EVENTS.I18N_LOCALE_CHANGE, (data: any) => {
            if (data?.current) {
                this._currentLang = data.current;
                this._updateLangSelect();
            }
        });
        this.onCleanup(off);
    }

    _updateNavHighlight(path: string): void {
        const navEl = this.nodeMap.nav.el;
        const buttons = navEl.querySelectorAll('button');
        buttons.forEach((btn: HTMLElement) => {
            const isActive = (btn as HTMLButtonElement).dataset.path === path;
            btn.style.backgroundColor = isActive
                ? 'var(--q-colors-primary, #1890ff)'
                : 'transparent';
            btn.style.color = isActive ? '#fff' : 'var(--q-demo-text-secondary)';
        });
    }

    _updateLangSelect(): void {
        const actionsEl = this.nodeMap.actions.el;
        const selects = actionsEl.querySelectorAll('select');
        const langSelect = selects[1] as HTMLSelectElement | undefined;
        if (langSelect) {
            langSelect.value = this._currentLang;
        }
    }

    _navigateTo(path: string): void {
        this.routeEmit(
            EventContextBuilder.create()
                .withEvent('switch')
                .withType('switch')
                .withSource('router')
                .withData({ path })
                .build()
        );
    }
    _toggleDark(): void {
        this._isDark = !this._isDark;
        document.documentElement.classList.toggle('dark', this._isDark);
        localStorage.setItem('qimenjs-theme', this._isDark ? 'dark' : 'light');

        const theme = this._isDark ? 'dark' : 'light';
        this._applyTheme(theme);
    }

    _applyTheme(theme: string): void {
        this._currentTheme = theme;
        const registrar = ThemeRegistrar.getInstance();
        if (registrar.has(theme)) {
            registrar.apply(theme);
        }

        const actionsEl = this.nodeMap.actions.el;
        const selects = actionsEl.querySelectorAll('select');
        const themeSelect = selects[0] as HTMLSelectElement | undefined;
        if (themeSelect) {
            themeSelect.value = theme;
        }

        const darkBtn = this.nodeMap.actions.el.querySelector('button') as HTMLButtonElement | null;
        if (darkBtn) {
            const icon = darkBtn.querySelector('i');
            if (icon) {
                icon.className = this._isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
            }
        }
    }

    _switchLanguage(lang: string): void {
        this._currentLang = lang;
        const i18n = getI18nManager();
        if (i18n) {
            i18n.locale = lang;
        }
        localStorage.setItem('qimenjs-locale', lang);
    }

    onLogoClick(): void {
        this._navigateTo('/');
    }
}

AppHeaderComponent.use([RouteEventBusAbility, SystemEventBusAbility]);

export type AppHeaderComponentInstance = InstanceType<typeof AppHeaderComponent>;
AppFooterComponent.register();
