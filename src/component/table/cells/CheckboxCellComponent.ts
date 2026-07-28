/**
 * CheckboxCellComponent 复选框单元格组件
 *
 * 在 BaseCell 基础上通过 tplReplaces 替换 content 为复选框。
 * update({ checked, disabled? }) 驱动选中/禁用状态。
 *
 * @example
 * ```ts
 * const cell = new CheckboxCellComponent({ align: 'center' });
 * cell.update({ checked: true, disabled: false });
 * ```
 */

import { BaseCellComponent } from './BaseCellComponent';
import type { ColumnAlign, CheckboxCellData } from '../column-types';

export interface CheckboxCellProps {
    align?: ColumnAlign;
}

export let CheckboxCellComponent = BaseCellComponent.replace({
    type: 'CheckboxCell',

    tplReplaces: {
        content: {
            tag: 'span',
            name: 'box',
            cls: 'q-cell__checkbox',
        },
    },

    body: {
        onInitState() {
            return {
                _checked: false,
                _disabled: false,
            };
        },

        onAfterInit(props?: CheckboxCellProps): void {},

        update(data: CheckboxCellData): void {
            const self = this as any;
            self._checked = data.checked ?? false;
            self._disabled = data.disabled ?? false;
            self._applyState();
        },

        get checked(): boolean {
            const self = this as any;
            return self._checked;
        },
        set checked(v: boolean) {
            const self = this as any;
            self._checked = v;
            self._applyState();
        },

        get disabled(): boolean {
            const self = this as any;
            return self._disabled;
        },
        set disabled(v: boolean) {
            const self = this as any;
            self._disabled = v;
            self._applyState();
        },

        _applyState(): void {
            const self = this as any;
            const boxEl = self.nodeMap?.box?.el as HTMLElement | null;
            if (!boxEl) return;

            boxEl.classList.toggle('q-cell__checkbox--checked', self._checked);
            boxEl.classList.toggle('q-cell__checkbox--disabled', self._disabled);
            boxEl.setAttribute('aria-checked', String(self._checked));

            if (self._disabled) {
                boxEl.setAttribute('aria-disabled', 'true');
            } else {
                boxEl.removeAttribute('aria-disabled');
            }
        },

        onRootClick(): void {
            const self = this as any;
            if (self._disabled) return;
            self._checked = !self._checked;
            self._applyState();
        },

        getEventData(nodeName: string, eventName: string, eventType: string): Record<string, any> {
            const self = this as any;
            return { checked: self._checked };
        },
    },
});

export type CheckboxCellComponent = InstanceType<typeof CheckboxCellComponent>;
