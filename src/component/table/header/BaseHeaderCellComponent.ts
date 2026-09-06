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
import { Definitions } from '@/composable';
import { BASE_HEADER_CELL_TPL } from './base-header-cell-tpl';

const BaseHeaderCellComponentDefs: Definitions = {
    options: {
        colName: '',
        align: 'left',
        minWidth: 50,
        title: null,
    },
} as const;

class BaseHeaderCellComponent extends Component {
    get tpl(): TplNode {
        return BASE_HEADER_CELL_TPL;
    }

    onAfterInit(): void {
        if (this.title) this.setNodeProp('text', this.title, 'title');
        this._applyWidth();
        this._applyAlign();
    }

    _onAlignOptionChange(_value: string): void {
        this._applyAlign();
    }

    _applyWidth(): void {
        if (!this.colName) return;
        this.setNodeStyle({
            width: `var(--q-table-col-${this.colName}-width)`,
            minWidth: `var(--q-table-col-${this.colName}-min-width, ${this.minWidth}px)`,
            flexShrink: '0',
        });
    }

    _applyAlign(): void {
        const justifyContent =
            this.align === 'center'
                ? 'center'
                : this.align === 'right'
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

BaseHeaderCellComponent.define(BaseHeaderCellComponentDefs);

export { BaseHeaderCellComponent };
/** 基础表头单元格实例类型 */
export type BaseHeaderCellComponentInstance = InstanceType<typeof BaseHeaderCellComponent>;
