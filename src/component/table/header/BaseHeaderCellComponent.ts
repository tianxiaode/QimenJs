/**
 * BaseHeaderCellComponent 基础表头单元格组件
 *
 * 所有表头单元格的基类，提供：
 * - colName → CSS 变量宽度绑定
 * - minWidth / flex-shrink: 0 防压缩
 * - content 占位节点，子类通过 tplReplaces 替换
 * - update() 基础契约
 *
 * 子类派生方式：
 *   LeafHeaderCell  = BaseHeaderCell.replace({ tplReplaces, body })
 *   GroupHeaderCell = BaseHeaderCell.replace({ tplReplaces, body })
 */

import { Component } from '@qimenjs/component-core';
import type { ColumnAlign } from '../column-types';
import type { TplNode } from '@qimenjs/component-core';
import { BASE_HEADER_CELL_TPL } from './base-header-cell-tpl';

class BaseHeaderCellComponent extends Component {
    get tpl(): TplNode {
        return BASE_HEADER_CELL_TPL;
    }

    _colName: string = '';
    _align: ColumnAlign = 'left';
    _minWidth: number = 50;

    onAfterInit(props?: Record<string, any>): void {
        if (props?.colName) this._colName = props.colName;
        if (props?.title) this.setNodeProp('text', props.title, 'title');
        if (props?.align) this._align = props.align;
        if (props?.minWidth !== undefined) this._minWidth = props.minWidth;
        this._applyWidth();
        this._applyAlign();
    }

    _applyWidth(): void {
        if (!this._colName) return;
        this.setNodeStyle({
            width: `var(--q-table-col-${this._colName}-width)`,
            minWidth: `var(--q-table-col-${this._colName}-min-width, ${this._minWidth}px)`,
            flexShrink: '0',
        });
    }

    _applyAlign(): void {
        const justifyContent =
            this._align === 'center'
                ? 'center'
                : this._align === 'right'
                  ? 'flex-end'
                  : 'flex-start';
        this.setNodeStyle({ justifyContent }, 'content');
    }

    update(data: any): void {
        if (data?.title !== undefined) {
            this.setNodeProp('text', String(data.title), 'title');
        }
    }
}

export { BaseHeaderCellComponent };
/** 基础表头单元格实例类型 */
export type BaseHeaderCellComponentInstance = InstanceType<typeof BaseHeaderCellComponent>;
