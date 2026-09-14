import { Component, TemplateDecl } from '@qimenjs/component-core';
import { ShowcaseNavbar } from './ShowcaseNavbar';
import { ShowcaseFooter } from './ShowcaseFooter';
import { HomePage } from './pages/HomePage';
import { ComponentsPage } from './pages/ComponentsPage';
import { DocsPage } from './pages/DocsPage';

export class ShowcaseApp extends Component {
    get tpl(): TemplateDecl {
        return {
            tag: 'div',
            classes: 'q-showcase',
            style: {
                fontFamily: 'sans-serif',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
            },
            children: [
                {
                    type: ShowcaseNavbar,
                    name: 'navbar',
                },
                {
                    type: 'route-container',
                    name: 'pageContainer',
                    classes: 'q-showcase__page',
                    style: { flex: '1' },
                    options: {
                        routeMap: {
                            '/': HomePage,
                            '/components': ComponentsPage,
                            '/docs': DocsPage,
                        },
                        defaultComponent: HomePage,
                    },
                },
                {
                    type: ShowcaseFooter,
                    name: 'footer',
                },
            ],
        };
    }
}
