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
                    type: 'href',
                    href: '#action/toggle-lang',
                    text: '@nav.lang',
                    dock: 'right',
                    action: 'toggle-lang',
                },
                {
                    type: 'href',
                    href: '#action/toggle-theme',
                    text: '@nav.theme',
                    dock: 'right',
                    action: 'toggle-theme',
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
    // onAfterInit(): void {
    //     this.logo = 'Q';
    //     this.companyName = 'QimenJS';
    //     this.defaultItemOption = {
    //         size: 'lg',
    //     };
    //     super.onAfterInit();
    // }
}

export { ShowcaseNavbar };
