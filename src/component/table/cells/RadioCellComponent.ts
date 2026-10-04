/**
 * RadioCellComponent 单选框单元格组件
 *
 * 在 BaseCell 基础上替换 content 为单选框。
 * update({ checked, disabled? }) 驱动选中/禁用状态。
 *
 * 受控模式（controlled: true）下 onRootClick 不自行切换，
 * 状态完全由外部 update() 驱动（表格选择列场景）。
 *
 * @example
 * ```ts
 * const cell = new RadioCellComponent({ align: 'center' });
 * cell.update({ checked: true, disabled: false });
 * ```
 */

import { BaseCellComponent } from './BaseCellComponent';
import type { RadioCellData } from '../column-types';
import type { TemplateDecl } from '@/component-core';
import { Definitions } from '@/composable';
import { RADIO_CELL_TPL } from './radio-cell-tpl';
import './cellselect.css';

const RadioCellComponentDefs: Definitions = {
    options: {
        controlled: false,
    },
} as const;

class RadioCellComponent extends BaseCellComponent {
    get tpl(): TemplateDecl {
        return RADIO_CELL_TPL;
    }

    _checked: boolean = false;
    _disabled: boolean = false;

    update(data: RadioCellData): void {
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
        this.toggleCls('q_cell__radio--checked', this._checked, 'box');
        this.toggleCls('q_cell__radio--disabled', this._disabled, 'box');
        this.setAttributes({ 'aria-checked': String(this._checked) }, 'box');
        if (this._disabled) {
            this.setAttributes({ 'aria-disabled': 'true' }, 'box');
        } else {
            this.removeAttributes(['aria-disabled'], 'box');
        }
    }

    _onValueOptionChange(_value: any): void {
    }

    onRootClick(): void {
        if (this._disabled || this.controlled) return;
        this._checked = !this._checked;
        this._applyState();
    }

    getEventData(_nodeName: string, _eventName: string, _eventType: string): Record<string, any> {
        return { checked: this._checked };
    }
}

RadioCellComponent.define(RadioCellComponentDefs);

export { RadioCellComponent };
/** 单选框单元格实例类型 */
export type RadioCellComponentInstance = InstanceType<typeof RadioCellComponent>;
