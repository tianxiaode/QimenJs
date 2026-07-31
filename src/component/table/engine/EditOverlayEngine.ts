/**
 * EditOverlayEngine — 浮动编辑层引擎
 *
 * 消费 ColumnMetaManager，编译产生内联编辑浮动层组件类。
 * 走 OverlayDispatchCenter 定位，与 Table 完全解耦。
 *
 * 结构：每个 editable 列一个 editor slot（hidden），共享 actions 和 error。
 * 激活某列时：hide 所有 slot → show 目标 slot → 清空 error → 聚焦 input。
 *
 * @example
 * ```ts
 * const EditClass = EditOverlayEngine.compile(metaMgr);
 * const overlay = new EditClass();
 * overlay.activate('name', '张三');
 * ```
 */

import { Component } from '../../../component-core/Component';
import type { ColumnDefOrGroup, ColumnMeta, EditType } from '../column-types';
import type { ColumnMetaManager } from './ColumnMetaManager';

const EDIT_TYPE_INPUT_MAP: Record<EditType, string> = {
    text: 'text',
    number: 'number',
    date: 'date',
    select: 'select',
    custom: 'text',
};

export class EditOverlayEngine {
    private static _cache = new WeakMap<ColumnDefOrGroup[], any>();

    static compile(mgr: ColumnMetaManager): any {
        const columns = mgr.rawColumns;
        const cached = EditOverlayEngine._cache.get(columns);
        if (cached) return cached;

        const compiled = EditOverlayEngine._doCompile(mgr);
        EditOverlayEngine._cache.set(columns, compiled);
        return compiled;
    }

    private static _doCompile(mgr: ColumnMetaManager): any {
        const editableMetas = mgr.getEditable();

        if (editableMetas.length === 0) {
            return EditOverlayEngine._createEmptyOverlay();
        }

        const tpl = EditOverlayEngine._buildTpl(editableMetas);

        return Component.withTemplate({
            tpl,
            body: {
                type: 'EditOverlay',

                onInitState() {
                    return {
                        _editableMetas: editableMetas as ColumnMeta[],
                        _activeColName: null as string | null,
                    };
                },

                onAfterInit(this: any): void {
                    this._hideAllSlots();
                },

                activate(this: any, colName: string, value?: any): void {
                    this._activeColName = colName;
                    this._hideAllSlots();
                    this._showSlot(colName);
                    this._clearError();
                    this._setValue(colName, value);
                    this._focusInput(colName);
                },

                deactivate(this: any): void {
                    this._activeColName = null;
                    this._hideAllSlots();
                    this._clearError();
                },

                getEditValue(this: any): any {
                    if (!this._activeColName) return undefined;
                    const input = this._getInput(this._activeColName);
                    return input ? input.value : undefined;
                },

                showError(this: any, message: string): void {
                    this.setNodeProp('text', message, 'error');
                    this.setNodeStyle({ display: '' }, 'error');
                },

                _hideAllSlots(this: any): void {
                    for (const meta of this._editableMetas) {
                        this.setNodeStyle({ display: 'none' }, `slot_${meta.name}`);
                    }
                },

                _showSlot(this: any, colName: string): void {
                    this.setNodeStyle({ display: '' }, `slot_${colName}`);
                },

                _clearError(this: any): void {
                    this.setNodeProp('text', '', 'error');
                    this.setNodeStyle({ display: 'none' }, 'error');
                },

                _setValue(this: any, colName: string, value?: any): void {
                    const input = this._getInput(colName);
                    if (input && value !== undefined) {
                        input.value = String(value);
                    }
                },

                _focusInput(this: any, colName: string): void {
                    const input = this._getInput(colName);
                    if (input) {
                        requestAnimationFrame(() => input.focus());
                    }
                },

                _getInput(this: any, colName: string): HTMLInputElement | null {
                    return (this._resolveNodeEl(`input_${colName}`) as HTMLInputElement) || null;
                },
            },
        });
    }

    private static _createEmptyOverlay(): any {
        return Component.withTemplate({
            tpl: { tag: 'div', cls: 'q-edit-overlay' },
            body: { type: 'EditOverlay' },
        });
    }

    private static _buildTpl(metas: ColumnMeta[]): any {
        const slotChildren = metas.map(meta => ({
            tag: 'div',
            name: `slot_${meta.name}`,
            cls: 'q-edit-overlay__slot',
            style: { display: 'none' },
            children: EditOverlayEngine._buildEditorNode(meta),
        }));

        return {
            tag: 'div',
            cls: 'q-edit-overlay',
            children: [
                ...slotChildren,
                {
                    tag: 'div',
                    name: 'actions',
                    cls: 'q-edit-overlay__actions',
                    children: [
                        { tag: 'span', name: 'save', cls: 'q-edit-overlay__save' },
                        { tag: 'span', name: 'cancel', cls: 'q-edit-overlay__cancel' },
                    ],
                },
                {
                    tag: 'div',
                    name: 'error',
                    cls: 'q-edit-overlay__error',
                    style: { display: 'none' },
                },
            ],
        };
    }

    private static _buildEditorNode(meta: ColumnMeta): any[] {
        if (meta.editType === 'custom' && meta.editComponent) {
            return [
                {
                    type: meta.editComponent,
                    name: `input_${meta.name}`,
                    initConfig: { align: meta.align },
                },
            ];
        }

        if (meta.editType === 'select') {
            return [
                {
                    type: 'SelectCell',
                    name: `input_${meta.name}`,
                    initConfig: { align: meta.align },
                },
            ];
        }

        const inputType = EDIT_TYPE_INPUT_MAP[meta.editType] || 'text';
        return [
            {
                tag: 'input',
                name: `input_${meta.name}`,
                cls: 'q-edit-overlay__input',
                attrs: { type: inputType },
            },
        ];
    }
}
