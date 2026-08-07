/**
 * CheckboxCellComponent 复选框单元格组件
 *
 * 在 BaseCell 基础上替换 content 为复选框。
 * update({ checked, disabled? }) 驱动选中/禁用状态。
 *
 * @example
 * ```ts
 * const cell = new CheckboxCellComponent({ align: 'center' });
 * cell.update({ checked: true, disabled: false });
 * ```
 */

import { BaseCellComponent } from './BaseCellComponent';
import type { BaseCellProps } from './BaseCellComponent';
import type { CheckboxCellData } from '../column-types';
import type { TplNode } from '@qimenjs/component-core';
import { CHECKBOX_CELL_TPL } from './checkbox-cell-tpl';

/** 复选框单元格属性接口 */
export type CheckboxCellProps = BaseCellProps;

class CheckboxCellComponent extends BaseCellComponent {
    get tpl(): TplNode {
        return CHECKBOX_CELL_TPL;
    }

    _checked: boolean = false;
    _disabled: boolean = false;

    update(data: CheckboxCellData): void {
        this._checked = data.checked ?? false;
        this._disabled = data.disabled ?? false;
        this._applyState();
    }

    get checked(): boolean {
        return this._checked;
    }
    set checked(v: boolean) {
        this._checked = v;
        this._applyState();
    }

    get disabled(): boolean {
        return this._disabled;
    }
    set disabled(v: boolean) {
        this._disabled = v;
        this._applyState();
    }

    _applyState(): void {
        this.toggleCls('q-cell__checkbox--checked', this._checked, 'box');
        this.toggleCls('q-cell__checkbox--disabled', this._disabled, 'box');
        this.setAttr('aria-checked', String(this._checked), 'box');
        if (this._disabled) {
            this.setAttr('aria-disabled', 'true', 'box');
        } else {
            this.removeAttr('aria-disabled', 'box');
        }
    }

    onRootClick(): void {
        if (this._disabled) return;
        this._checked = !this._checked;
        this._applyState();
    }

    getEventData(_nodeName: string, _eventName: string, _eventType: string): Record<string, any> {
        return { checked: this._checked };
    }
}

export { CheckboxCellComponent };
/** 复选框单元格实例类型 */
export type CheckboxCellComponentInstance = InstanceType<typeof CheckboxCellComponent>;
