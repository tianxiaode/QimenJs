import { Component, TemplateDecl } from '@qimenjs/component-core';
import { ShowcaseNavbar } from './ShowcaseNavbar';
import { HomePage } from './pages/HomePage';
import { ComponentsPage } from './pages/ComponentsPage';
import { DocsPage } from './pages/DocsPage';

type PageName = 'home' | 'components' | 'docs';

const PAGE_MAP: Record<PageName, any> = {
    home: HomePage,
    components: ComponentsPage,
    docs: DocsPage,
};

export class ShowcaseApp extends Component {
    _currentPage: PageName = 'home';
    _pageInstance: any = null;

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
                    tag: 'div',
                    name: 'pageContainer',
                    classes: 'q-showcase__page',
                    style: { flex: '1' },
                },
            ],
        };
    }

    onAfterInit(): void {
        this._renderPage(this._currentPage);
    }

    _renderPage(page: PageName): void {
        if (this._pageInstance) {
            if (typeof this._pageInstance.dispose === 'function') {
                this._pageInstance.dispose();
            }
            this._pageInstance = null;
        }

        this._currentPage = page;
        const PageClass = PAGE_MAP[page];
        if (!PageClass) return;

        const container = this.getNodeEl('pageContainer');
        if (!container) return;

        this._pageInstance = new PageClass();
        container.appendChild(this._pageInstance.el);
    }
}
