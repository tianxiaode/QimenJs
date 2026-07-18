import { ItemGroupComponent } from '../itemgroup/ItemGroupComponent';
import type { ItemGroupProps } from '../itemgroup/ItemGroupComponent';

export type ButtonGroupMode = 'single' | 'multiple';

export interface ButtonGroupProps extends ItemGroupProps {
    mode?: ButtonGroupMode;
    selectedIndex?: number;
    selectedIndices?: number[];
}

export let ButtonGroupComponent = ItemGroupComponent.replace({
    type: 'ButtonGroup',
    cls: 'q-button-group',
    itemsCls: 'q-button-group__items',
    config: {
        itemType: 'Toggle',
        eventKey: 'btn',
        events: ['toggle'],
        direction: 'horizontal',
        gap: '2px',
    },
    body: {
        _mode: 'single' as ButtonGroupMode,

        onAfterInit(props?: ButtonGroupProps): void {
            this._mode = props?.mode ?? 'single';
            this.el.classList.toggle('q-button-group--multiple', this._mode === 'multiple');

            this.on('btn:toggle', (data: any) => {
                this._onItemToggle(data);
            });

            if (this._mode === 'single' && props?.selectedIndex !== undefined) {
                this.selectAt(props.selectedIndex, true);
            }
            if (this._mode === 'multiple' && props?.selectedIndices?.length) {
                for (const idx of props.selectedIndices) {
                    this.pressAt(idx, true, true);
                }
            }
        },

        get mode(): ButtonGroupMode {
            return this._mode;
        },

        get selectedIndex(): number {
            for (let i = 0; i < this.count; i++) {
                if (this.getAt(i)?.pressed) return i;
            }
            return -1;
        },

        get selectedIndices(): number[] {
            const indices: number[] = [];
            for (let i = 0; i < this.count; i++) {
                if (this.getAt(i)?.pressed) indices.push(i);
            }
            return indices;
        },

        selectAt(index: number, silent: boolean = false): void {
            if (index < 0 || index >= this.count) return;

            for (let i = 0; i < this.count; i++) {
                const item = this.getAt(i);
                if (item?.pressed && i !== index) {
                    item.pressed = false;
                }
            }

            const target = this.getAt(index);
            if (target && !target.pressed) {
                target.pressed = true;
            }

            if (!silent) {
                this.emit('select', { index, item: target }, { source: 'btn' });
            }
        },

        pressAt(index: number, pressed: boolean, silent: boolean = false): void {
            if (index < 0 || index >= this.count) return;
            const item = this.getAt(index);
            if (item) {
                item.pressed = pressed;
            }
            if (!silent) {
                this.emit('select', { index, pressed, item }, { source: 'btn' });
            }
        },

        _onItemToggle(data: any): void {
            const index = data?.index;
            if (index === undefined) return;

            const item = this.getAt(index);
            if (!item) return;

            if (this._mode === 'single') {
                if (item.pressed) {
                    this.selectAt(index);
                } else {
                    item.pressed = true;
                }
            }
        },

        onUpdated(props?: Record<string, any>): void {
            if (props?.mode !== undefined) {
                this._mode = props.mode;
                this.el.classList.toggle('q-button-group--multiple', this._mode === 'multiple');
            }
            if (props?.selectedIndex !== undefined) {
                this.selectAt(props.selectedIndex);
            }
        },
    },
});
