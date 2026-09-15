import { Definitions } from '@/composable';
import { MenuComponent } from './MenuComponent';

const MultiMenuComponentDefs: Definitions = {
    options: {
        backText: null,
        backIcon: 'q-menu-back-icon',
    },
} as const;

class MultiMenuComponent extends MenuComponent {
    static type = 'multi-menu';

    _currentItems: any[] = [];
    _mainItems: any[] | null = null;
    _itemMeta: Map<any, any> = new Map();
    _viewStack: any[][] = [];

    onAfterInit(): void {
        super.onAfterInit();
        this.addCls('q-multi-menu');
    }

    setItems(datas: any[]): void {
        this._viewStack = [];
        this._mainItems = datas.filter((d: any) => d.mobileMenu !== false);
        this._currentItems = this._mainItems;
        this._itemMeta.clear();
        super.setItems(this._currentItems);
        this._buildMeta();
    }

    show(): void {
        if (this._mainItems) {
            this._viewStack = [];
            this._currentItems = this._mainItems;
            this._itemMeta.clear();
            super.setItems(this._currentItems);
            this._buildMeta();
        }
        super.show();
    }

    _onItemClick(domEvt: any): void {
        const item = domEvt.targetComponent;
        if (!item) return;

        if (item.getData?.('action') === '__nav_back') {
            this._popView();
            return;
        }

        const meta = this._itemMeta.get(item);
        if (meta?.mobileMenu?.items) {
            this._pushView(meta.mobileMenu.items);
            return;
        }

        super._onItemClick(domEvt);
    }

    _pushView(subItems: any[]): void {
        this._viewStack.push([...this._currentItems]);
        const backText = this.getData('backText') ?? '返回';
        const backIcon = this.getData('backIcon');
        const view = [{ text: backText, icon: backIcon, action: '__nav_back' }, ...subItems];
        this._setView(view);
    }

    _popView(): void {
        const prev = this._viewStack.pop();
        if (!prev) return;
        this._setView(prev);
    }

    _setView(items: any[]): void {
        this._currentItems = items;
        this._itemMeta.clear();
        const resolved = items.map((item) =>
            typeof item.checked === 'function' ? { ...item, checked: item.checked() } : item
        );
        super.setItems(resolved);
        this._buildMeta();
    }

    _buildMeta(): void {
        for (let i = 0; i < this.items.length; i++) {
            this._itemMeta.set(this.items[i], { mobileMenu: this._currentItems[i]?.mobileMenu });
        }
    }
}

MultiMenuComponent.define(MultiMenuComponentDefs);

export { MultiMenuComponent };