import { TemplateComponent, ComponentRegistrar } from '@qimenjs/component-core';
import { TabBarComponent } from '../tab-bar/TabBarComponent';

export interface TabItem {
    label: string;
    icon?: string;
    content?: string | (new (props?: Record<string, any>) => any);
}

export interface TabsProps {
    items?: TabItem[];
    activeIndex?: number;
}

export class TabsComponent extends TemplateComponent.withTemplate({
    tpl: {
        tag: 'div',
        className: 'q-tabs',
        children: [
            { tag: 'div', name: 'tabBar', className: 'q-tabs__bar' },
            { tag: 'div', name: 'items', className: 'q-tabs__content' },
        ],
    },
    body: { type: 'Tabs' },
}) {
    private _tabBar: TabBarComponent | null = null;
    private _tabItems: TabItem[] = [];
    private _activeIndex: number = 0;
    private _contentInstances: any[] = [];

    constructor(props?: TabsProps) {
        super();

        this._tabItems = props?.items ?? [];
        this._activeIndex = props?.activeIndex ?? 0;

        this._tabBar = new TabBarComponent({
            items: this._tabItems.map((i: TabItem) => ({ text: i.label, icon: i.icon })),
            selectedIndex: this._activeIndex,
        });

        const barEl = this.nodeMap?.tabBar?.el;
        if (barEl) barEl.appendChild(this._tabBar.el);

        this._tabBar.on('select', ({ index }: any) => {
            this._activeIndex = index;
            this._applyActive();
            this.emit('change', { index, item: this._tabItems[index] });
        });

        this._renderContent();
        this._applyActive();
    }

    get activeIndex(): number {
        return this._activeIndex;
    }
    set activeIndex(value: number) {
        this._activeIndex = value;
        this._tabBar?.selectAt(value);
        this._applyActive();
    }

    get tabBar(): TabBarComponent | null {
        return this._tabBar;
    }

    get tabItems(): readonly TabItem[] {
        return this._tabItems;
    }

    _renderContent(): void {
        const contentEl = this.nodeMap?.items?.el;
        if (!contentEl) return;

        contentEl.innerHTML = '';
        this._contentInstances = [];

        for (let i = 0; i < this._tabItems.length; i++) {
            const item = this._tabItems[i];
            const contentWrapper = document.createElement('div');
            contentWrapper.className = 'q-tabs__pane';
            contentWrapper.hidden = true;

            if (item.content) {
                if (typeof item.content === 'string') {
                    if (item.content.startsWith('<')) {
                        contentWrapper.innerHTML = item.content;
                    } else {
                        const CompClass = ComponentRegistrar.getInstance().get(item.content);
                        if (CompClass) {
                            const instance = new CompClass();
                            contentWrapper.appendChild(instance.el);
                            this._contentInstances.push(instance);
                        }
                    }
                } else {
                    const instance = new item.content();
                    contentWrapper.appendChild(instance.el);
                    this._contentInstances.push(instance);
                }
            }

            contentEl.appendChild(contentWrapper);
        }
    }

    _applyActive(): void {
        const contentEl = this.nodeMap?.items?.el;
        if (!contentEl) return;

        const panes = contentEl.children;
        for (let i = 0; i < panes.length; i++) {
            (panes[i] as HTMLElement).hidden = i !== this._activeIndex;
        }
    }

    update(props?: Partial<TabsProps>): void {
        if (props?.items !== undefined) {
            this._tabItems = props.items;
            this._renderContent();
            if (this._tabBar) {
                this._tabBar.update({
                    items: this._tabItems.map((i: TabItem) => ({
                        text: i.label,
                        icon: i.icon,
                    })),
                });
            }
            this._applyActive();
        }
        if (props?.activeIndex !== undefined) {
            this.activeIndex = props.activeIndex;
        }
    }

    dispose(): void {
        for (const instance of this._contentInstances) {
            instance?.dispose?.();
        }
        this._tabBar?.dispose?.();
        super.dispose();
    }
}
