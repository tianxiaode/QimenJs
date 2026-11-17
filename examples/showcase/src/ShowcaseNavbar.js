import { NavbarComponent } from '@qimenjs/component';
const THEME_PRESETS = [
    { key: '', name: '@theme.default' },
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
const NAV_HREFS = {
    'nav-home': '#/',
    'nav-components': '#/components',
    'nav-apps': '#/apps',
    'nav-docs': '#/docs',
};
function getCurrentLang() {
    return window.__qimen_i18n__?.locale || 'zh-CN';
}
function getCurrentPreset() {
    return document.documentElement.getAttribute('data-theme-preset') || '';
}
class ShowcaseNavbar extends NavbarComponent {
    constructor() {
        super(...arguments);
        this.listens = [
            { source: 'lang', events: { select: '_onLangChange' } },
            { source: 'theme', events: { select: '_onThemeChange' } },
            { source: 'dark', events: { toggle: '_onDarkThemeToggle' } },
            { source: 'navmenu', events: { select: '_onNavMenuSelect' } },
        ];
    }
    get defaultOptions() {
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
                    href: '#action/toggle-login',
                    text: '@nav.login',
                    dock: 'right',
                    action: 'toggle-login',
                },
                {
                    type: 'toggle',
                    href: '#action/toggle-dark',
                    offIcon: 'q-icon-sun',
                    onIcon: 'q-icon-dark',
                    eventKey: 'dark',
                    ghost: true,
                    dock: 'right',
                    action: 'toggle-dark',
                    mobileMenu: {
                        text: '@nav.dark',
                        group: 'dark',
                        groupMode: 'checkbox',
                        checked: () => document.documentElement.getAttribute('data-theme') === 'dark',
                    },
                },
                {
                    type: 'dropdown',
                    iconCls: 'q-icon-globe',
                    hint: '@nav.lang',
                    dock: 'right',
                    ghost: true,
                    mobileMenu: {
                        text: '@nav.lang',
                        icon: 'q-icon-globe',
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
                    iconCls: 'q-icon-palette',
                    hint: '@nav.theme',
                    dock: 'right',
                    ghost: true,
                    mobileMenu: {
                        text: '@nav.theme',
                        icon: 'q-icon-palette',
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
    _onLangChange(data) {
        const locale = data.action === 'set-lang-zh' ? 'zh-CN' : 'en-US';
        const i18n = window.__qimen_i18n__;
        if (i18n) {
            i18n.locale = locale;
        }
        this._updateMenuChecked('lang', data.action);
    }
    _onThemeChange(data) {
        const preset = data.action.replace('set-theme-', '');
        if (preset) {
            document.documentElement.setAttribute('data-theme-preset', preset);
        }
        else {
            document.documentElement.removeAttribute('data-theme-preset');
        }
        this._updateMenuChecked('theme', data.action);
    }
    _onDarkThemeToggle(data) {
        data.pressed
            ? document.documentElement.setAttribute('data-theme', 'dark')
            : document.documentElement.setAttribute('data-theme', 'light');
    }
    _onNavMenuSelect(data) {
        const action = data.action;
        if (!action)
            return;
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
    _updateMenuChecked(eventKey, action) {
        for (const comp of this._itemInstances) {
            if (comp?.constructor?.type !== 'dropdown')
                continue;
            const popover = comp.popover;
            if (!popover)
                continue;
            const popoverEventKey = popover.eventKey;
            if (popoverEventKey !== eventKey)
                continue;
            if (typeof popover.show === 'function') {
                for (const item of popover.items) {
                    item.checked = item.action === action;
                }
            }
            else {
                comp.popover = {
                    ...popover,
                    items: popover.items.map((it) => ({
                        ...it,
                        checked: it.action === action,
                    })),
                };
            }
        }
    }
}
export { ShowcaseNavbar };
