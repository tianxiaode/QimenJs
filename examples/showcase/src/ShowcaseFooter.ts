import { Component, type TemplateDecl } from '@qimenjs/component-core';

class ShowcaseFooter extends Component {
    get tpl(): TemplateDecl {
        return {
            tag: 'footer',
            classes: 'q-showcase-footer',
            children: [
                {
                    tag: 'div',
                    classes: 'q-showcase-footer__left',
                    children: [
                        {
                            tag: 'span',
                            name: 'copyright',
                            classes: 'q-showcase-footer__copyright',
                        },
                        {
                            tag: 'span',
                            classes: 'q-showcase-footer__divider',
                        },
                        {
                            type: 'href',
                            name: 'license',
                            classes: 'q-showcase-footer__link',
                            options: {
                                text: '@footer.license',
                                href: 'https://opensource.org/licenses/MIT',
                                target: '_blank',
                                size: 'sm',
                            },
                        },
                    ],
                },
                {
                    tag: 'div',
                    classes: 'q-showcase-footer__right',
                    children: [
                        {
                            type: 'href',
                            name: 'github',
                            classes: 'q-showcase-footer__link',
                            options: {
                                text: '@footer.github',
                                href: 'https://github.com/tianxiaode/QimenJs',
                                target: '_blank',
                                size: 'sm',
                            },
                        },
                        {
                            tag: 'span',
                            classes: 'q-showcase-footer__divider',
                        },
                        {
                            type: 'href',
                            name: 'docs',
                            classes: 'q-showcase-footer__link',
                            options: {
                                text: '@footer.docs',
                                href: '#/docs',
                                size: 'sm',
                            },
                        },
                    ],
                },
            ],
        };
    }

    onAfterInit(): void {
        const year = new Date().getFullYear();
        this.setNodeText(`© ${year} QimenJS`, 'copyright');
    }
}

export { ShowcaseFooter };
