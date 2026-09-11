import { NavbarComponent } from '@qimenjs/component';

class ShowcaseNavbar extends NavbarComponent {
    get defaultOptions(): Record<string, any> {
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
                    type: 'dropdown',
                    //text: '@nav.lang',
                    iconCls: 'fa fa-globe',
                    hint: '@nav.lang',
                    //tooltip: { text: '@nav.lang' },
                    dock: 'right',
                    ghost: true,
                    popover: {
                        type: 'menu',
                        placement: 'bottom',
                        items: [
                            { text: '中文', action: 'set-lang-zh' },
                            { text: 'English', action: 'set-lang-en' },
                        ],
                    },
                },
                {
                    type: 'dropdown',
                    text: '@nav.theme',
                    iconCls: 'fa fa-paint-brush',
                    hint: '@nav.theme',
                    //tooltip: { text: '@nav.theme' },
                    dock: 'right',
                    ghost: true,
                    popover: {
                        type: 'menu',
                        placement: 'bottom',
                        items: [
                            { text: '@nav.themeLight', action: 'set-theme-light' },
                            { text: '@nav.themeDark', action: 'set-theme-dark' },
                        ],
                    },
                },
                {
                    type: 'href',
                    href: '#action/toggle-dark',
                    text: '@nav.dark',
                    dock: 'right',
                    action: 'toggle-dark',
                },
                {
                    type: 'href',
                    href: '#action/toggle-login',
                    text: '@nav.login',
                    dock: 'right',
                    action: 'toggle-login',
                },
            ],
        };
    }
}

export { ShowcaseNavbar };
