import { TemplateComponent } from '@qimenjs/component-core';
import { RouteNavComponent } from '@qimenjs/component';
import { EventBridge } from '@qimenjs/events';

class SidebarComponent extends TemplateComponent.withTemplate({
    tpl: {
        tag: 'div',
        className: 'app-sidebar',
        layout: 'vbox',
        children: [
            {
                tag: 'div', name: 'sidebar:nav', type: RouteNavComponent, className: 'sidebar-nav',
                props: {
                    eventKey: 'nav',
                    direction: 'vertical',
                    gap: '0',
                    pathIndex: { '/': 0, '/components': 1, '/theme': 2 },
                    indexPath: ['/', '/components', '/theme'],
                    items: [
                        { text: '首页', icon: '<i class="fa-solid fa-house"></i>', active: true },
                        { text: '组件', icon: '<i class="fa-solid fa-cubes"></i>' },
                        { text: '主题', icon: '<i class="fa-solid fa-palette"></i>' },
                    ],
                    activeIndex: 0,
                },
            },
        ],
    },
    body: {
        type: 'SidebarComponent',

        _collapsed: false,

        _applyCollapsedMode(): void {
            const mode = this._collapsed ? 'collapsed' : 'expanded';
            this.el.classList.toggle('app-sidebar--collapsed', this._collapsed);
            EventBridge.getInstance().emit('nav:mode', { mode });
        },
    },
}) {
    constructor() {
        super();
        EventBridge.getInstance().on('sidebar:toggle', () => {
            this._collapsed = !this._collapsed;
            this._applyCollapsedMode();
        });
    }
}

export { SidebarComponent };