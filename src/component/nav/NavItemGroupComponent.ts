import { ItemGroupComponent } from '../itemgroup/ItemGroupComponent';
import type { ItemGroupProps } from '../itemgroup/ItemGroupComponent';
import type { NavItemComponent } from './NavItemComponent';
import type { NavOverlayOptions } from './NavItemComponent';

const NAV_FORWARD_EVENTS = ['click', 'close'];

export interface NavItemGroupProps extends ItemGroupProps {
    activeIndex?: number;
    mode?: 'expanded' | 'collapsed';
    maxDepth?: number;
    overlayOptions?: NavOverlayOptions;
    overlayComponent?: any;
}

const NavItemGroupBase = ItemGroupComponent.withTemplate({
    tpl: {
        tag: 'div',
        className: 'q-nav',
        children: [{ tag: 'div', name: 'items', className: 'q-nav__items' }],
    },
    body: { type: 'NavItemGroup' },
});

export class NavItemGroupComponent extends NavItemGroupBase {
    private _activeIndex: number = -1;
    private _navMode: 'expanded' | 'collapsed' = 'expanded';
    private _maxDepth: number = 3;
    private _overlayOptions: NavOverlayOptions | undefined;
    private _overlayComponent: any;

    constructor(props?: NavItemGroupProps) {
        super(props);

        if (props?.cls) {
            this.el.classList.add(...props.cls.split(/\s+/).filter(Boolean));
        }

        this._navMode = props?.mode ?? 'expanded';
        this._maxDepth = props?.maxDepth ?? 3;
        this._overlayOptions = props?.overlayOptions;
        this._overlayComponent = props?.overlayComponent;

        this.el.classList.toggle('q-nav--collapsed', this._navMode === 'collapsed');

        this._initItemGroupComponent({
            itemType: 'NavItem',
            eventKey: 'nav',
            events: NAV_FORWARD_EVENTS,
            direction: props?.direction ?? 'horizontal',
            gap: props?.gap,
            items: props?.items,
        });

        if (props?.activeIndex !== undefined && props.activeIndex >= 0) {
            this.selectAt(props.activeIndex, true);
        }
    }

    get activeIndex(): number {
        return this._activeIndex;
    }
    get mode(): 'expanded' | 'collapsed' {
        return this._navMode;
    }
    get maxDepth(): number {
        return this._maxDepth;
    }

    selectAt(index: number, silent: boolean = false): void {
        if (index < 0 || index >= this.count) return;
        if (index === this._activeIndex) return;

        if (this._activeIndex >= 0 && this._activeIndex < this.count) {
            const prevItem = this.getAt(this._activeIndex) as NavItemComponent;
            prevItem.setActive(false);
        }

        const newItem = this.getAt(index) as NavItemComponent;
        newItem.setActive(true);
        this._activeIndex = index;

        if (!silent) {
            this.emit(
                'select',
                { ...this._extractItemData(newItem, index) },
                { source: this.eventKey || undefined }
            );
        }
    }

    clearSelection(): void {
        if (this._activeIndex >= 0 && this._activeIndex < this.count) {
            const item = this.getAt(this._activeIndex) as NavItemComponent;
            item.setActive(false);
        }
        this._activeIndex = -1;
    }

    setMode(value: 'expanded' | 'collapsed'): void {
        this._navMode = value;
        this.el.classList.toggle('q-nav--collapsed', value === 'collapsed');

        for (let i = 0; i < this.count; i++) {
            const item = this.getAt(i) as NavItemComponent;
            item.setMode(value);
        }
    }

    setOverlayOptions(options: NavOverlayOptions): void {
        this._overlayOptions = options;
        for (let i = 0; i < this.count; i++) {
            const item = this.getAt(i) as NavItemComponent;
            item.update({ overlayOptions: options });
        }
    }

    update(props?: Record<string, any>): void {
        super.update(props);
        if (props?.activeIndex !== undefined) this.selectAt(props.activeIndex);
        if (props?.mode !== undefined) this.setMode(props.mode);
        if (props?.maxDepth !== undefined) this._maxDepth = props.maxDepth;
        if (props?.overlayOptions !== undefined) this.setOverlayOptions(props.overlayOptions);
    }
}
