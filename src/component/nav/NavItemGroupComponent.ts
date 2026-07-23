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
            const self = this as any;
            self._navMode = props?.mode ?? 'expanded';
            self._maxDepth = props?.maxDepth ?? 3;
            self._overlayOptions = props?.overlayOptions;
            self._overlayComponent = props?.overlayComponent;

            self.el.classList.toggle('q-nav--collapsed', self._navMode === 'collapsed');

            if (props?.activeIndex !== undefined && props.activeIndex >= 0) {
                self.selectAt(props.activeIndex, true);
            }
        },

        get activeIndex(): number {
            const self = this as any;
            return self._activeIndex;
        },
        get mode(): 'expanded' | 'collapsed' {
            const self = this as any;
            return self._navMode;
        },
        get maxDepth(): number {
            const self = this as any;
            return self._maxDepth;
        },

        selectAt(index: number, silent: boolean = false): void {
            const self = this as any;
            if (index < 0 || index >= self.count) return;
            if (index === self._activeIndex) return;

            if (self._activeIndex >= 0 && self._activeIndex < self.count) {
                const prevItem = self.getAt(self._activeIndex) as NavItemComponent;
                prevItem.setActive(false);
            }

            const newItem = self.getAt(index) as NavItemComponent;
            newItem.setActive(true);
            self._activeIndex = index;

            if (!silent) {
                self.emit('select', { index });
            }
        },

        clearSelection(): void {
            const self = this as any;
            if (self._activeIndex >= 0 && self._activeIndex < self.count) {
                const item = self.getAt(self._activeIndex) as NavItemComponent;
                item.setActive(false);
            }
            self._activeIndex = -1;
        },

        setMode(value: 'expanded' | 'collapsed'): void {
            const self = this as any;
            self._navMode = value;
            self.el.classList.toggle('q-nav--collapsed', value === 'collapsed');

            for (let i = 0; i < self.count; i++) {
                const item = self.getAt(i) as NavItemComponent;
                item.setMode(value);
            }
        },

        setOverlayOptions(options: NavOverlayOptions): void {
            const self = this as any;
            self._overlayOptions = options;
            for (let i = 0; i < self.count; i++) {
                const item = self.getAt(i) as NavItemComponent;
                item.update({ overlayOptions: options });
            }
        },

        onUpdated(props?: Record<string, any>): void {
            const self = this as any;
            if (props?.activeIndex !== undefined) self.selectAt(props.activeIndex);
            if (props?.mode !== undefined) self.setMode(props.mode);
            if (props?.maxDepth !== undefined) self._maxDepth = props.maxDepth;
            if (props?.overlayOptions !== undefined) self.setOverlayOptions(props.overlayOptions);
        },
    },
});
