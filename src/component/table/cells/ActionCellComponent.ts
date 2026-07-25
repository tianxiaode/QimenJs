/**
 * ActionCellComponent 操作单元格组件
 *
 * 在 BaseCell 基础上通过 tplReplaces 替换 content 为 ButtonGroup。
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
import type { ColumnAlign, ActionCellData } from '../column-types';

export interface ActionCellProps {
    align?: ColumnAlign;
}

export let ActionCellComponent = BaseCellComponent.replace({
    type: 'ActionCell',

    tplReplaces: {
        content: {
            type: 'ButtonGroup',
            name: 'actions',
            cls: 'q-cell__actions',
            initConfig: {
                direction: 'horizontal',
                gap: '4px',
            },
        },
    },

    body: {
        onInitState() {
            return {
                _actions: [] as Record<string, any>[],
            };
        },

        onAfterInit(props?: ActionCellProps): void {},

        update(data: ActionCellData): void {
            const self = this as any;
            self._actions = data.actions ?? [];
            self._renderActions();
        },

        _renderActions(): void {
            const self = this as any;
            const actionsCmp = self.nodeMap?.actions?.component;
            if (!actionsCmp) return;

            actionsCmp.clear();
            for (const action of self._actions) {
                actionsCmp.add(action);
            }
        },

        get actions(): Record<string, any>[] {
            const self = this as any;
            return self._actions;
        },
    },
});

export type ActionCellComponent = InstanceType<typeof ActionCellComponent>;
