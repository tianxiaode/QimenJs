import { NavbarComponent } from '@qimenjs/component';
import { ListenItem } from '@qimenjs/component-core';

const THEME_PRESETS = [
    { key: 'cinnabar', name: '朱砂红' },
    { key: 'indigo', name: '黛蓝' },
    { key: 'pine', name: '松花绿' },
    { key: 'amber', name: '琥珀黄' },
    { key: 'rouge', name: '胭脂粉' },
    { key: 'bamboo', name: '竹青' },
    { key: 'sienna', name: '缃色' },
    { key: 'lotus', name: '藕荷紫' },
    { key: 'navy', name: '藏青' },
    { key: 'chartreuse', name: '秋香绿' },
    { key: 'qinghua', name: '青花瓷' },
    { key: 'skyblue', name: '天青' },
];

function getCurrentLang(): string {
    return window.__qimen_i18n__?.locale || 'zh-CN';
}

function getCurrentPreset(): string {
    return document.documentElement.getAttribute('data-theme-preset') || 'qinghua';
}

class ShowcaseNavbar extends NavbarComponent {
    get defaultOptions(): Record<string, any> {
        const lang = getCurrentLang();
        const preset = getCurrentPreset();
        return {
            logo: 'Q',
            companyName: 'QimenJS',
            defaultItemOption: { size: 'lg' },
            menuToggleIconCls: 'fa fa-bars',
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
                    type: 'href',
                    href: '#action/toggle-dark',
                    text: '@nav.dark',
                    dock: 'right',
                    action: 'toggle-dark',
                },
                {
                    type: 'dropdown',
                    iconCls: 'fa fa-globe',
                    hint: '@nav.lang',
                    dock: 'right',
                    ghost: true,
                    popover: {
                        type: 'menu',
                        placement: 'bottom',
                        eventKey: 'lang',
                        items: [
                            {
                                text: '中文',
                                action: 'set-lang-zh',
                                group: 'lang',
                                groupMode: 'radio',
                                checked: lang === 'zh-CN',
                            },
                            {
                                text: 'English',
                                action: 'set-lang-en',
                                group: 'lang',
                                groupMode: 'radio',
                                checked: lang === 'en-US',
                            },
                        ],
                    },
                },
                {
                    type: 'dropdown',
                    iconCls: 'fa fa-paint-brush',
                    hint: '@nav.theme',
                    dock: 'right',
                    ghost: true,
                    popover: {
                        type: 'menu',
                        placement: 'bottom',
                        eventKey: 'theme',
                        items: THEME_PRESETS.map(p => ({
                            text: p.name,
                            action: `set-theme-${p.key}`,
                            group: 'theme',
                            groupMode: 'radio',
                            checked: preset === p.key,
                        })),
                    },
                },
            ],
        };
    }

    listens: ListenItem[] = [
        { source: 'lang', events: { select: '_onLangChange' } },
        { source: 'theme', events: { select: '_onThemeChange' } },
    ];

    _onLangChange(data: any): void {
        const locale = data.action === 'set-lang-zh' ? 'zh-CN' : 'en-US';
        const i18n = window.__qimen_i18n__;
        if (i18n) {
            i18n.locale = locale;
        }
        this._updateDropdownPopover('lang', (items: any[]) =>
            items.map(it => ({ ...it, checked: it.action === data.action }))
        );
    }

    _onThemeChange(data: any): void {
        const preset = data.action.replace('set-theme-', '');
        document.documentElement.setAttribute('data-theme-preset', preset);
        this._updateDropdownPopover('theme', (items: any[]) =>
            items.map(it => ({ ...it, checked: it.action === data.action }))
        );
    }

    private _updateDropdownPopover(eventKey: string, updateItems: (items: any[]) => any[]): void {
        for (const comp of this.items) {
            if (comp?.type === 'dropdown' && comp.popover?.eventKey === eventKey) {
                comp.popover = {
                    ...comp.popover,
                    items: updateItems(comp.popover.items),
                };
            }
        }
    }
}

export { ShowcaseNavbar };
