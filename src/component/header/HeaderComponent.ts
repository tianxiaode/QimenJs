import { ItemGroupStaticComponent } from '../itemgroup/ItemGroupStaticComponent';
import { HtmlComponent } from '../html/HtmlComponent';
import { SpacerComponent } from '@qimenjs/component-core';
import { Definitions } from '@/composable';
import './header.css';

const LEFT_SPACER_ORDER = 9500;
const TITLE_ORDER = 10000;
const RIGHT_SPACER_ORDER = 10500;

const HeaderComponentDefs: Definitions = {
    options: {
        title: null,
        subtitle: null,
        titleCls: null,
        titleStyle: null,
    },
    fields: {
        _titleComp: undefined,
        _leftSpacers: [],
        _rightSpacers: [],
    },
} as const;

class HeaderComponent extends ItemGroupStaticComponent {
    static type = 'header';
    defaultItemType = 'icon';

    get defaultOptions(): Record<string, any> {
        return {
            ...super.defaultOptions,
            defaultItemOption: { clickable: true },
        };
    }

    onAfterInit(): void {
        super.onAfterInit();
        this.addCls('q-header');
        this._refreshFixedElements();
    }

    _refreshFixedElements(): void {
        const container = this.getNodeEl('itemContainer');
        if (!container) return;

        const title = this.getData('title');
        if (title && !this._titleComp) {
            this._titleComp = new HtmlComponent({ content: this._buildTitleContent() });
            this._titleComp.addCls('q-header__title');
            const titleCls = this.getData('titleCls');
            if (titleCls) this._titleComp.addCls(titleCls);
            const titleStyle = this.getData('titleStyle');
            if (titleStyle) this._titleComp.setStyles(titleStyle);
            this._titleComp.el.style.order = String(TITLE_ORDER);
            container.appendChild(this._titleComp.el);
        } else if (!title && this._titleComp) {
            this._titleComp.dispose();
            this._titleComp = undefined;
        }

        this._rebalanceSpacers();
    }

    _buildTitleContent(): string {
        const title = this.getData('title') ?? '';
        const subtitle = this.getData('subtitle');
        if (subtitle) {
            return `${title} <span class="q-header__subtitle">${subtitle}</span>`;
        }
        return title;
    }

    _rebalanceSpacers(): void {
        const container = this.getNodeEl('itemContainer');
        if (!container) return;

        for (const s of this._leftSpacers) s.dispose();
        for (const s of this._rightSpacers) s.dispose();
        this._leftSpacers = [];
        this._rightSpacers = [];

        const nL = this._countLeftItems();
        const nR = this._countRightItems();
        const diff = Math.abs(nL - nR);
        if (diff === 0) return;

        const spacerWidth = 'var(--q-header-tool-w, 36px)';
        if (nL > nR) {
            for (let i = 0; i < diff; i++) {
                const spacer = new SpacerComponent({ width: spacerWidth });
                spacer.el.style.order = String(RIGHT_SPACER_ORDER);
                container.appendChild(spacer.el);
                this._rightSpacers.push(spacer);
            }
        } else {
            for (let i = 0; i < diff; i++) {
                const spacer = new SpacerComponent({ width: spacerWidth });
                spacer.el.style.order = String(LEFT_SPACER_ORDER);
                container.appendChild(spacer.el);
                this._leftSpacers.push(spacer);
            }
        }
    }

    _countLeftItems(): number {
        const items = this.items;
        if (!Array.isArray(items)) return 0;
        return items.filter((item: any) => (item.order ?? 0) < TITLE_ORDER).length;
    }

    _countRightItems(): number {
        const items = this.items;
        if (!Array.isArray(items)) return 0;
        return items.filter((item: any) => (item.order ?? 0) > TITLE_ORDER).length;
    }

    _createItem(data: Record<string, any>): any {
        const component = super._createItem(data);
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

    _onTitleOptionChange(): void {
        if (this._titleComp) {
            this._titleComp.setData('content', this._buildTitleContent());
        }
    }

    _onSubtitleOptionChange(): void {
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

    onBeforeDispose(): void {
        this._titleComp?.dispose();
        for (const s of this._leftSpacers) s.dispose();
        for (const s of this._rightSpacers) s.dispose();
        this._leftSpacers = [];
        this._rightSpacers = [];
        super.onBeforeDispose();
    }
}

HeaderComponent.define(HeaderComponentDefs);

export { HeaderComponent };
