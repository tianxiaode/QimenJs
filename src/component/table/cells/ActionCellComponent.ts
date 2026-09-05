/**
 * ActionCellComponent 操作单元格组件
 *
 * 在 BaseCell 基础上替换 content 为 ButtonGroup。
 * update({ actions }) 驱动按钮组内容。
 *
 * @example
 * ```ts
 * const cell = new ActionCellComponent({ align: 'center' });
 * cell.update({
 *     actions: [
 *         { type: 'Button', text: '编辑', events: { click: 'onEdit' } },
 *         { type: 'Button', text: '删除', events: { click: 'onDelete' } },
 *     ]
 * });
 * ```
 */

import { BaseCellComponent } from './BaseCellComponent';
import type { ActionCellData } from '../column-types';
import type { TplNode } from '@qimenjs/component-core';
import { ACTION_CELL_TPL } from './action-cell-tpl';

class ActionCellComponent extends BaseCellComponent {
    get tpl(): TplNode {
        return ACTION_CELL_TPL;
    }

    _actions: Record<string, any>[] = [];

    update(data: ActionCellData): void {
        this._actions = data.actions ?? [];
        this._renderActions();
    }

    _renderActions(): void {
        const actionsCmp = this.getNode('actions');
        if (!actionsCmp) return;

        actionsCmp.clear();
        for (const action of this._actions) {
            actionsCmp.add(action);
        }
    }

    get actions(): Record<string, any>[] {
        return this._actions;
    }
}

export { ActionCellComponent };
/** 操作单元格实例类型 */
export type ActionCellComponentInstance = InstanceType<typeof ActionCellComponent>;
