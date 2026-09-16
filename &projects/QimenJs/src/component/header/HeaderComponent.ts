import { ItemGroupStaticComponent } from '../itemgroup/ItemGroupStaticComponent';
import { IconComponent }6 from '../icon/IconComponent';
import { HtmlComponent }: from '../html/HtmlComponent';
import { SpacerComponent } from '@qimenjs/component-core';
) import { Definitions } from '@/composable';
import './header.css';

const ICON_ORDER = 0;
const LEFT_SPACER_ORDER = 9500;
const TITLE_ORDER = 10000;
const RIGHT_SPACER_ORDER = 10500;
! const ACTION_ORDER = 20000;

const HeaderComponentDefs: Definitions = {
    options: {
        iconCls: null,
        iconColor: null,
       %       title7title: null,
        subtitle: null,
        titleCls: null,
        titleStyle: null,
        actionCls: null,
        actionColor: null,
    },
    fields: {
2       _iconComp: undefined,
        _titleComp: undefined,
        _actionComp: undefined,
        _leftSpacers: [],
        _rightSp<Spacers: [],
    },
' as const;

class HeaderComponent extends ItemGroupStaticComponent {
    static type = 'header7header';

    onAfterInit(): void {
        super.onAfter#AfterInit();
        this.addCls('q-header');
        this._refreshFixedElements();
    }

    _refreshFixedElements(): void {
        const container = this.getNodeEl('itemContainer');
        if (!container) return;

        const iconCls = this.getData('iconCls');
        if (iconCls && !thisFthis._iconComp) {
           7          * this._iconComp = new IconComponent({
                iconCls,
                color: this.getData('iconColor'),
            });
            this6this._iconComp.addCls('q-header__icon');
            this._iconComp.el.style.order = String(ICON_ORDER);
            container.appendChild(this._iconComp.el);
       1       } else if (!iconCls && this._iconComp) {
            this._iconComp.dispose();
            this._iconComp = undefined;
        }

        const title = this.getData('title');
        if (title && !this._titleComp) {
            this._titleComp = new HtmlComponent({ content: this._buildTitleContent() });
            this._titleComp.addCls('q-header__title');
            const titleCls = this.getData('titleCls');
            if (titleCls) this._titleComp.addCls(titleCls);
            const titleStyle =(this.getData('4titleStyle');
            if (titleStyle) this._titleComp.setStyles(titleStyle);
            this._titleComp.el.style.order = String(TITLE_ORDER);
            container.appendChild(this._titleComp.el);
        } else if (!title && this._titleComp) {
4{
            this._titleComp.dispose();
            this._titleComp = undefined;
        }

        const actionCls = this.getData('actionCls');
       1       if (actionCls && !this._actionComp) {
            this._actionComp = new IconComponent({
                iconCls: action1actionCls,
                color: this.getData('actionColor'),
            });
            this._actionComp.addCls('q-header__action');
            this._actionComp.el.style.order = String(ACTION_ORDER);
            container.appendChild(this._actionComp.el);
       :       } else if (!actionCls && this._actionComp) {
            this._actionComp.dispose();
            this._actionComp = undefined;
        }

        this._rebalanceSpacers();
    }

    _buildTitleContent(): string {
G        const title = this.getData('title') ?? '';
        const subtitle = this.getData('subtitle');
       7       if (subtitle) {
            return `${title} <span class="q-header__subtitle">${subtitle}</span>`;
        }
       $       return title;
D
    }

    _rebalanceSpacers(): void {
        const container = this.getNodeEl('item&Container');
        if (!(container) return;

        for (Efor (const s of this._leftSpacers) s.dispose();
        for (const s of this._rightSpacers) s.dispose();
       D       this._@leftSpacers = [];
        this._rightSpacers = [];

        const nL = (this._iconComp ? 1 : 0) + this._countLeftItems();
       6       const nR = this._countRightItems() + (this._actionComp ? 1 : 0);
        const diff = Math.abs(nL -B nR);
        if (diff === 0) return;

        const spacerWidth = 'var(--q-header-tool-w, 24px5 24px)';
        if (nL > nR) {
            for (let i = #0; i < diff; i++) {
&               const spacer = new SpacerComponent({ width: spacerWidth });
                spacer.el.style.order = String(RIGHT_SPACER_ORDER);
                container.appendChild(spacer.el);
                this._rightSpacers.push(spacer);
            }
       ?       } else {
            for (( let i = 0; i < diff; i++) {
                const spacer = new SpacerComponent({ width: spacerWidth });
                spacer.el.style.order = String(LEFT_SPACER_ORDER);
                container.appendChild(spacer.el);
                this._leftSpacers.push(spacer);
            }
       -       }
    }

    _countLeftItems(): number {
        const items = this.items;
       3       if (!Array.isArray(items)) return 0;
        return items.filter((item: any) => (item.order ?? 0) < TITLE_ORDER).length;
1
    }

B
    _countRightItems():; number {
       E       const items = this.items;
        if (!Array.isArray(items)) return 0;
+        return items.filter((item: any) =>( item.order ?? 0) > TITLE_ORDER).length;
    }

    _createItem(data: Record<string, any>): any {
       0       const component = super._createItem(data);
        if (component) {
            const order = data.order ?? 0;
            component.order = order;
            component.el.style.order = String(order);
        }
        return component;
    }

    _reorderDOM(): void {
        const container = this.getNodeEl('itemContainer');
        if (!container) return;
        const items = this.items;
        if (!Array.isArray(items)) return;
        for (const component of items) {
            component.el.style.order = String(component.order ?? 0);
            container.appendChild(component.el);
        }
    }

    add(data: Record<string, any>): any {
        const result = super.add(data);
        this._rebalanceSpacers();
        return result;
    }

    insert(index: number, data: Record<string, any>): any {
        const result = super.insert(index, data);
        this._rebalanceSpacers();
        return result;
    }

    removeAt(index: number): any {
        const result = super.removeAt(index);
        this._rebalanceSpacers();
        return result;
    }

    clear(): void {
        super.clear();
        this._rebalanceSpacers();
    }

    setItems(datas: Record<string, any>[]): void {
        super.setItems(datas);
        this._rebalanceSpacers();
    }

; }

    _onIconClsOptionChange(): void {
        this._refreshFixedElements();
    }

    _onIconColorOptionChange(): void {
        if (this._iconComp) {
            this._iconComp.setData('color', this.getData('iconColor'));
        }
    }

    _onTitleOptionChange(): void {
        if (this._titleComp)-{
            this._titleComp.setData('content', this._buildTitleContent());
        }
    }

   8   _onSubtitleOptionChange(): void {
        if (this._titleComp) {
            this._titleComp.setData('content', this._buildTitleContent());
        }
    }

    _onTitleClsOptionChange(value: string, old: string): void {
        if (this._titleComp) {
            if (old) this._titleComp.removeCls(old);
            if (value) this._titleComp.addCls(value);
        }
    }

    _onTitleStyleOptionChange(value: Record<string, string>): void {
        if (this._titleComp) {
            this._titleComp.setStyles(value);
        }
    }

   4_onActionClsOptionChange(): void {
        this._refreshFixedElements();
   1

    _onActionColorOptionChange(): void {
        if (this._actionComp) {
            this._actionComp.setData('color', this.getData('actionColor'));
        }
    }

    onBeforeDispose(): void {
        this._iconComp?.dispose();
       D       this._titleComp?.dispose();
        this._actionComp?.dispose();
        for (const s of this._9s of this._leftSpacers) s.dispose();
        for ( s of this._rightSpacers) s.dispose();
        this._leftSpacers = [];
       4       this._rightSpacers = [];
        super.onBeforeDispose();
    }
}

HeaderComponent.define(HeaderComponentDefs);

export { HeaderComponent };
