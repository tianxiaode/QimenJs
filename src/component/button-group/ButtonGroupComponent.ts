import { ItemGroupPooledComponent } from '../itemgroup/ItemGroupPooledComponent';
import type { ItemGroupProps } from '../itemgroup/ItemGroupBaseComponent';
import { DomEventsMap } from '@qimenjs/component-core';

/** 按钮组模式类型 */
export type ButtonGroupMode = 'single' | 'multiple';

/** 按钮组属性接口 */
export interface ButtonGroupProps extends ItemGroupProps {
    mode?: ButtonGroupMode;
    selectedIndex?: number;
    selectedIndices?: number[];
}

/** 按钮组组件 */
class ButtonGroupComponent extends ItemGroupPooledComponent {
    _mode: ButtonGroupMode = 'single';
    _lastToggleIndex: number = -1;

    domEvents?: DomEventsMap | undefined = {
        click: {
            Toggle: {
                handler: '_onToggleClick',
                emits: ['select'],
            },
        },
    };

    get defaultEventData(): Record<string, any> {
        const self = this as any;
        return {
            ...super.defaultEventData,
            selectedIndex: self.selectedIndex,
            selectedIndices: self.selectedIndices,
            selectedValues: self.selectedValues,
            lastToggleIndex: self._lastToggleIndex,
        };
    }

    _onToggleClick(domEvt: any): void {
        const item = this.getTargetItem(domEvt.target);
        if (!item) return;

        const self = this as any;
        const index = item.index;
        const toggle = item.component;
        self._lastToggleIndex = index;

        if (self._mode === 'single') {
            if (!toggle.pressed) {
                self.selectAt(index);
            }
        } else {
            toggle.pressed = !toggle.pressed;
        }
    }

    onAfterInit(props?: ButtonGroupProps): void {
        const self = this as any;
        self._mode = props?.mode ?? 'single';

        this.toggleCls('q-button-group--multiple', self._mode === 'multiple');
        this.addCls('q-button-group');
        this.addCls('q-button-group__items', 'itemContainer');

        super.onAfterInit({
            ...props,
            defaultItemType: 'Toggle',
            direction: props?.direction ?? 'horizontal',
            gap: props?.gap ?? '2px',
        });

        if (self._mode === 'single' && props?.selectedIndex !== undefined) {
            self.selectAt(props.selectedIndex, true);
        }
        if (self._mode === 'multiple' && props?.selectedIndices?.length) {
            for (const idx of props.selectedIndices) {
                self.pressAt(idx, true, true);
            }
        }
    }

    get mode(): ButtonGroupMode {
        const self = this as any;
        return self._mode;
    }

    get selectedIndex(): number {
        const self = this as any;
        for (let i = 0; i < self.count; i++) {
            if (self.getAt(i)?.pressed) return i;
        }
        return -1;
    }

    get selectedIndices(): number[] {
        const self = this as any;
        const indices: number[] = [];
        for (let i = 0; i < self.count; i++) {
            if (self.getAt(i)?.pressed) indices.push(i);
        }
        return indices;
    }

    get selectedValues(): any[] {
        const self = this as any;
        const values: any[] = [];
        for (let i = 0; i < self.count; i++) {
            const item = self.getAt(i);
            if (item?.pressed && item.value !== undefined) values.push(item.value);
        }
        return values;
    }

    get unselectedValues(): any[] {
        const self = this as any;
        const values: any[] = [];
        for (let i = 0; i < self.count; i++) {
            const item = self.getAt(i);
            if (!item?.pressed && item.value !== undefined) values.push(item.value);
        }
        return values;
    }

    selectAt(index: number, silent: boolean = false): void {
        const self = this as any;
        if (index < 0 || index >= self.count) return;

        const prevIndex = self.selectedIndex;

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

        if (!silent && prevIndex !== index) {
            self.emit('select', { index, prevIndex });
        }
    }

    pressAt(index: number, pressed: boolean): void {
        const self = this as any;
        if (index < 0 || index >= self.count) return;
        const item = self.getAt(index);
        if (item) {
            item.pressed = pressed;
        }
    }

    onUpdated(props?: Record<string, any>): void {
        const self = this as any;
        if (props?.mode !== undefined) {
            self._mode = props.mode;
            this.toggleCls('q-button-group--multiple', self._mode === 'multiple');
        }
        if (props?.selectedIndex !== undefined) {
            self.selectAt(props.selectedIndex);
        }
    }
}

export { ButtonGroupComponent };
/** 按钮组实例类型 */
export type ButtonGroupComponentInstance = InstanceType<typeof ButtonGroupComponent>;

ButtonGroupComponent.register();
