import { ItemGroupPooledComponent } from '../itemgroup/ItemGroupPooledComponent';
import type { ItemGroupProps } from '../itemgroup/ItemGroupBaseComponent';

export type ButtonGroupMode = 'single' | 'multiple';

export interface ButtonGroupProps extends ItemGroupProps {
    mode?: ButtonGroupMode;
    selectedIndex?: number;
    selectedIndices?: number[];
}

export let ButtonGroupComponent = ItemGroupPooledComponent.replace({
    type: 'ButtonGroup',
    cls: 'q-button-group',
    itemsCls: 'q-button-group__items',
    config: {
        defaultItemType: 'Toggle',
        defaultItem: {
            Toggle: { events: { toggle: { bridges: ['toggle'] } } },
        },
        direction: 'horizontal',
        gap: '2px',
    },
    body: {
        onInitState() {
            return {
                _mode: 'single' as ButtonGroupMode,
            };
        },

        onAfterInit(props?: ButtonGroupProps): void {
            const self = this as any;
            self._mode = props?.mode ?? 'single';
            self.el.classList.toggle('q-button-group--multiple', self._mode === 'multiple');

            self.on('toggle', (data: any) => {
                self._onItemToggle(data);
            });

            if (self._mode === 'single' && props?.selectedIndex !== undefined) {
                self.selectAt(props.selectedIndex, true);
            }
            if (self._mode === 'multiple' && props?.selectedIndices?.length) {
                for (const idx of props.selectedIndices) {
                    self.pressAt(idx, true, true);
                }
            }
        },

        get mode(): ButtonGroupMode {
            const self = this as any;
            return self._mode;
        },

        get selectedIndex(): number {
            const self = this as any;
            for (let i = 0; i < self.count; i++) {
                if (self.getAt(i)?.pressed) return i;
            }
            return -1;
        },

        get selectedIndices(): number[] {
            const self = this as any;
            const indices: number[] = [];
            for (let i = 0; i < self.count; i++) {
                if (self.getAt(i)?.pressed) indices.push(i);
            }
            return indices;
        },

        selectAt(index: number, silent: boolean = false): void {
            const self = this as any;
            if (index < 0 || index >= self.count) return;

            for (let i = 0; i < self.count; i++) {
                const item = self.getAt(i);
                if (item?.pressed && i !== index) {
                    item.pressed = false;
                }
            }

            const target = self.getAt(index);
            if (target && !target.pressed) {
                target.pressed = true;
            }

            if (!silent) {
                self.emit('select', { index, item: target });
            }
        },

        pressAt(index: number, pressed: boolean, silent: boolean = false): void {
            const self = this as any;
            if (index < 0 || index >= self.count) return;
            const item = self.getAt(index);
            if (item) {
                item.pressed = pressed;
            }
            if (!silent) {
                self.emit('select', { index, pressed, item });
            }
        },

        _onItemToggle(data: any): void {
            const self = this as any;
            const index = data?.index;
            if (index === undefined) return;

            const item = self.getAt(index);
            if (!item) return;

            if (self._mode === 'single') {
                if (item.pressed) {
                    self.selectAt(index);
                } else {
                    item.pressed = true;
                }
            }
        },

        onUpdated(props?: Record<string, any>): void {
            const self = this as any;
            if (props?.mode !== undefined) {
                self._mode = props.mode;
                self.el.classList.toggle('q-button-group--multiple', self._mode === 'multiple');
            }
            if (props?.selectedIndex !== undefined) {
                self.selectAt(props.selectedIndex);
            }
        },
    },
});
