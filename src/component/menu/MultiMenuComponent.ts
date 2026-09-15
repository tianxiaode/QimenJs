import { MenuComponent } from './MenuComponent';

class MultiMenuComponent extends MenuComponent {
    static type = 'multi-menu';

    _currentItems: any[] = [];
    _itemMeta: Map<any, any> = new Map();
    _viewStack: any[][] = [];

    onAfterInit(): void {
        super.onAfterInit();
        this.addCls('q-multi-menu');
    }

    setItems(datas: any[]): void {
        this._viewStack = [];
        this._currentItems = datas.filter((d: any) => d.mobileMenu !== false);
        this._itemMeta.clear();
        super.setItems(this._currentItems);
        for (let i = 0; i < this.items.length; i++) {
            this._itemMeta.set(this.items[i], { mobileMenu: this._currentItems[i]?.mobileMenu });
        }
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
        const view = [{ text: '← 返回', action: '__nav_back' }, ...subItems];
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
        super.setItems(items);
        for (let i = 0; i < this.items.length; i++) {
            this._itemMeta.set(this.items[i], { mobileMenu: this._currentItems[i]?.mobileMenu });
        }
    }
}

export { MultiMenuComponent };