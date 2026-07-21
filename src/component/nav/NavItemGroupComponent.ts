import { ItemGroupPooledComponent } from '../itemgroup/ItemGroupPooledComponent';
import type { ItemGroupProps } from '../itemgroup/ItemGroupBaseComponent';
import type { NavItemComponent } from './NavItemComponent';
import type { NavOverlayOptions } from './NavItemComponent';

export interface NavItemGroupProps extends ItemGroupProps {
    activeIndex?: number;
    mode?: 'expanded' | 'collapsed';
    maxDepth?: number;
    overlayOptions?: NavOverlayOptions;
    overlayComponent?: any;
}

export let NavItemGroupComponent = ItemGroupPooledComponent.replace({
    type: 'NavItemGroup',
    cls: 'q-nav',
    itemsCls: 'q-nav__items',
    config: {
        defaultItemType: 'NavItem',
        defaultItem: {
            NavItem: { events: { click: { bridges: ['click'] }, close: { bridges: ['close'] } } },
        },
        direction: 'horizontal',
    },
    body: {
        onInitState() {
            return {
                _activeIndex: -1,
                _navMode: 'expanded' as 'expanded' | 'collapsed',
                _maxDepth: 3,
                _overlayOptions: undefined as NavOverlayOptions | undefined,
                _overlayComponent: undefined as any,
            };
        },

        onAfterInit(props?: NavItemGroupProps): void {
            this._navMode = props?.mode ?? 'expanded';
            this._maxDepth = props?.maxDepth ?? 3;
            this._overlayOptions = props?.overlayOptions;
            this._overlayComponent = props?.overlayComponent;

            this.el.classList.toggle('q-nav--collapsed', this._navMode === 'collapsed');

            if (props?.activeIndex !== undefined && props.activeIndex >= 0) {
                this.selectAt(props.activeIndex, true);
            }
        },

        get activeIndex(): number {
            return this._activeIndex;
        },
        get mode(): 'expanded' | 'collapsed' {
            return this._navMode;
        },
        get maxDepth(): number {
            return this._maxDepth;
        },

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
                this.emit('select', { index });
            }
        },

        clearSelection(): void {
            if (this._activeIndex >= 0 && this._activeIndex < this.count) {
                const item = this.getAt(this._activeIndex) as NavItemComponent;
                item.setActive(false);
            }
            this._activeIndex = -1;
        },

        setMode(value: 'expanded' | 'collapsed'): void {
            this._navMode = value;
            this.el.classList.toggle('q-nav--collapsed', value === 'collapsed');

            for (let i = 0; i < this.count; i++) {
                const item = this.getAt(i) as NavItemComponent;
                item.setMode(value);
            }
        },

        setOverlayOptions(options: NavOverlayOptions): void {
            this._overlayOptions = options;
            for (let i = 0; i < this.count; i++) {
                const item = this.getAt(i) as NavItemComponent;
                item.update({ overlayOptions: options });
            }
        },

        onUpdated(props?: Record<string, any>): void {
            if (props?.activeIndex !== undefined) this.selectAt(props.activeIndex);
            if (props?.mode !== undefined) this.setMode(props.mode);
            if (props?.maxDepth !== undefined) this._maxDepth = props.maxDepth;
            if (props?.overlayOptions !== undefined) this.setOverlayOptions(props.overlayOptions);
        },
    },
});
