/**
 * EditOverlayComponent — 浮动编辑层基础组件
 *
 * 内置编辑浮层操作逻辑，不绑定模板。由引擎根据列配置编译模板后，
 * 通过 `class XxxEditOverlay extends EditOverlayComponent {}` + `XxxEditOverlay.useTemplate(tpl)` 完成绑定。
 *
 * @example
 * ```ts
 * const EditClass = class extends EditOverlayComponent {
 *     _editableMetas = editableMetas;
 * };
 * EditClass.useTemplate(tpl);
 * const overlay = new EditClass();
 * overlay.activate('name', '张三');
 * ```
 */

import { Component } from '../../../component-core/Component';
import type { ColumnMeta } from '../column-types';

export class EditOverlayComponent extends Component {
    _editableMetas: ColumnMeta[] = [];
    _activeColName: string | null = null;

    onAfterInit(): void {
        this._hideAllSlots();
    }

    /**
     * 激活指定列的编辑器
     *
     * @param colName - 列名
     * @param value - 初始值
     */
    activate(colName: string, value?: any): void {
        this._activeColName = colName;
        this._hideAllSlots();
        this._showSlot(colName);
        this._clearError();
        this._setValue(colName, value);
        this._focusInput(colName);
    }

    /**
     * 关闭编辑浮层
     */
    deactivate(): void {
        this._activeColName = null;
        this._hideAllSlots();
        this._clearError();
    }

    /**
     * 获取当前编辑值
     */
    getEditValue(): any {
        if (!this._activeColName) return undefined;
        const input = this._getInput(this._activeColName);
        return input ? input.value : undefined;
    }

    /**
     * 显示错误信息
     *
     * @param message - 错误文本
     */
    showError(message: string): void {
        this.setNodeProp('text', message, 'error');
        this.setNodeStyle({ display: '' }, 'error');
    }

    _hideAllSlots(): void {
        for (const meta of this._editableMetas) {
            this.setNodeStyle({ display: 'none' }, `slot_${meta.name}`);
        }
    }

    _showSlot(colName: string): void {
        this.setNodeStyle({ display: '' }, `slot_${colName}`);
    }

    _clearError(): void {
        this.setNodeProp('text', '', 'error');
        this.setNodeStyle({ display: 'none' }, 'error');
    }

    _setValue(colName: string, value?: any): void {
        const input = this._getInput(colName);
        if (input && value !== undefined) {
            input.value = String(value);
        }
    }

    _focusInput(colName: string): void {
        const input = this._getInput(colName);
        if (input) {
            requestAnimationFrame(() => input.focus());
        }
    }

    _getInput(colName: string): HTMLInputElement | null {
        return (this._resolveNodeEl(`input_${colName}`) as HTMLInputElement) || null;
    }
}
