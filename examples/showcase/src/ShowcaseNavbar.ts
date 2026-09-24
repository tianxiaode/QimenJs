import { NavbarComponent } from '@qimenjs/component';
import { ListenItem } from '@qimenjs/component-core';

const THEME_PRESETS = [
    { key: 'cinnabar', name: '@theme.cinnabar' },
    { key: 'indigo', name: '@theme.indigo' },
    { key: 'pine', name: '@theme.pine' },
    { key: 'amber', name: '@theme.amber' },
    { key: 'rouge', name: '@theme.rouge' },
    { key: 'bamboo', name: '@theme.bamboo' },
    { key: 'sienna', name: '@theme.sienna' },
    { key: 'lotus', name: '@theme.lotus' },
    { key: 'navy', name: '@theme.navy' },
    { key: 'chartreuse', name: '@theme.chartreuse' },
    { key: 'qinghua', name: '@theme.qinghua' },
    { key: 'skyblue', name: '@theme.skyblue' },
];

const LANG_PRESETS = [
    { key: 'zh-CN', text: '中文', action: 'set-lang-zh' },
    { key: 'en-US', text: 'English', action: 'set-lang-en' },
];

const NAV_HREFS: Record<string, string> = {
    'nav-home': '#/',
    'nav-components': '#/components',
    'nav-apps': '#/apps',
    'nav-docs': '#/docs',
    'nav-benchmark': '#/benchmark',
};

function getCurrentLang(): string {
    return (window as any).__qimen_i18n__?.locale || 'zh-CN';
}

function getCurrentPreset(): string {
    return document.documentElement.getAttribute('data-theme-preset') || 'qinghua';
}

class ShowcaseNavbar extends NavbarComponent {
    get defaultOptions(): Record<string, any> {
        const lang = getCurrentLang();
        const preset = getCurrentPreset();
        const langItems = LANG_PRESETS.map(p => ({
            text: p.text,
            action: p.action,
            group: 'lang',
            groupMode: 'radio',
            checked: lang === p.key,
        }));
        const themeItems = THEME_PRESETS.map(p => ({
            text: p.name,
            action: `set-theme-${p.key}`,
            group: 'theme',
            groupMode: 'radio',
            checked: preset === p.key,
        }));
        return {
            logo: 'Q',
            fixed: true,
            companyName: 'QimenJS',
            defaultItemOption: { size: 'lg' },
            menu: {
                popover: {
                    type: 'multi-menu',
                    options: {
                        placement: 'bottom',
                        align: 'start',
                        eventKey: 'navmenu',
                        backText: '@nav.back',
                        backIcon: 'q-menu-back-icon',
                    },
                },
            },
            items: [
                { type: 'href', href: '#/', text: '@nav.home', dock: 'left', action: 'nav-home' },
                {
                    type: 'href',
                    href: '#/components',
                    text: '@nav.components',
                    dock: 'left',
                    action: 'nav-components',
                },
                {
                    type: 'href',
                    href: '#/apps',
                    text: '@nav.apps',
                    dock: 'left',
                    action: 'nav-apps',
                },
                {
                    type: 'href',
                    href: '#/docs',
                    text: '@nav.docs',
                    dock: 'left',
                    action: 'nav-docs',
                },
                {
                    type: 'href',
                    href: '#/benchmark',
                    text: 'Benchmark',
                    dock: 'left',
                    action: 'nav-benchmark',
                },
                {
                    type: 'href',
                    href: '#action/toggle-login',
                    text: '@nav.login',
                    dock: 'right',
                    action: 'toggle-login',
                },
                {
                    type: 'toggle',
                    href: '#action/toggle-dark',
                    offIcon: 'fa fa-sun',
                    onIcon: 'fa fa-moon',
                    eventKey: 'dark',
                    ghost: true,
                    dock: 'right',
                    action: 'toggle-dark',
                    mobileMenu: {
                        text: '@nav.dark',
                        group: 'dark',
                        groupMode: 'checkbox',
                        checked: () =>
                            document.documentElement.getAttribute('data-theme') === 'dark',
                    },
                },
                {
                    type: 'dropdown',
                    iconCls: 'fa fa-globe',
                    hint: '@nav.lang',
                    dock: 'right',
                    ghost: true,
                    mobileMenu: {
                        text: '@nav.lang',
                        icon: 'fa fa-globe',
                        items: langItems,
                    },
                    popover: {
                        type: 'menu',
                        options: {
                            placement: 'bottom',
                            eventKey: 'lang',
                            items: langItems,
                        },
                    },
                },
                {
                    type: 'dropdown',
                    iconCls: 'fa fa-paint-brush',
                    hint: '@nav.theme',
                    dock: 'right',
                    ghost: true,
                    mobileMenu: {
                        text: '@nav.theme',
                        icon: 'fa fa-paint-brush',
                        items: themeItems,
                    },
                    popover: {
                        type: 'menu',
                        options: {
                            placement: 'bottom',
                            eventKey: 'theme',
                            items: themeItems,
                        },
                    },
                },
            ],
        };
    }

    listens: ListenItem[] = [
        { source: 'lang', events: { select: '_onLangChange' } },
        { source: 'theme', events: { select: '_onThemeChange' } },
        { source: 'dark', events: { toggle: '_onDarkThemeToggle' } },
        { source: 'navmenu', events: { select: '_onNavMenuSelect' } },
    ];

    _onLangChange(data: any): void {
        const locale = data.action === 'set-lang-zh' ? 'zh-CN' : 'en-US';
        const i18n = (window as any).__qimen_i18n__;
        if (i18n) {
            i18n.locale = locale;
        }
        this._updateMenuChecked('lang', data.action);
    }

    _onThemeChange(data: any): void {
        const preset = data.action.replace('set-theme-', '');
        document.documentElement.setAttribute('data-theme-preset', preset);
        this._updateMenuChecked('theme', data.action);
    }

    _onDarkThemeToggle(data: any) {
        data.pressed
            ? document.documentElement.setAttribute('data-theme', 'dark')
            : document.documentElement.setAttribute('data-theme', 'light');
    }

    _onNavMenuSelect(data: any): void {
        const action = data.action;
        if (!action) return;
        if (NAV_HREFS[action]) {
            window.location.hash = NAV_HREFS[action];
            return;
        }
        if (action.startsWith('set-lang-')) {
            this._onLangChange(data);
            return;
        }
        if (action.startsWith('set-theme-')) {
            this._onThemeChange(data);
            return;
        }
        if (action === 'toggle-dark') {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
            return;
        }
    }

    private _updateMenuChecked(eventKey: string, action: string): void {
        for (const comp of this._itemInstances) {
            if (comp?.constructor?.type !== 'dropdown') continue;
            const popover = comp.popover;
            if (!popover) continue;

            const popoverEventKey = popover.eventKey;
            if (popoverEventKey !== eventKey) continue;

            if (typeof popover.show === 'function') {
                for (const item of popover.items) {
                    item.checked = item.action === action;
                }
            } else {
                comp.popover = {
                    ...popover,
                    items: popover.items.map((it: any) => ({
                        ...it,
                        checked: it.action === action,
                    })),
                };
            }
        }
    }
}

export { ShowcaseNavbar };
