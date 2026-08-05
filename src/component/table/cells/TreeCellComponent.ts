/**
 * TreeCellComponent 树形单元格组件
 *
 * 在 BaseCell 基础上替换 content 为树形结构：
 * toggle（展开/折叠图标）+ text（文本内容）
 *
 * update({ value, depth, leaf, expanded? }) 驱动缩进和图标状态。
 *
 * @example
 * ```ts
 * const cell = new TreeCellComponent({ align: 'left' });
 * cell.update({ value: '技术部', depth: 2, leaf: false, expanded: true });
 * ```
 */

import { BaseCellComponent } from './BaseCellComponent';
import type { BaseCellProps } from './BaseCellComponent';
import type { TreeCellData } from '../column-types';
import { TREE_CELL_TPL } from './tree-cell-tpl';

/** 树形单元格属性接口 */
export type TreeCellProps = BaseCellProps;

const INDENT_UNIT = 20;

class TreeCellComponent extends BaseCellComponent {
    _depth: number = 0;
    _leaf: boolean = true;
    _expanded: boolean = false;

    update(data: TreeCellData): void {
        this._depth = data.depth ?? 0;
        this._leaf = data.leaf ?? true;
        this._expanded = data.expanded ?? false;

        this._applyIndent();
        this._applyToggle();
        this.setNodeProp('text', String(data.value ?? ''), 'text');
    }

    _applyIndent(): void {
        this.setNodeStyle({ marginLeft: `${this._depth * INDENT_UNIT}px` }, 'toggle');
    }

    _applyToggle(): void {
        if (this._leaf) {
            this.addCls('q-cell__toggle--leaf', 'toggle');
            this.removeCls('q-cell__toggle--expanded', 'toggle');
        } else {
            this.removeCls('q-cell__toggle--leaf', 'toggle');
            this.toggleCls('q-cell__toggle--expanded', this._expanded, 'toggle');
        }
    }

    get depth(): number {
        return this._depth;
    }

    get leaf(): boolean {
        return this._leaf;
    }

    get expanded(): boolean {
        return this._expanded;
    }
    set expanded(v: boolean) {
        this._expanded = v;
        this._applyToggle();
    }
}

TreeCellComponent.useTemplate(TREE_CELL_TPL);
export { TreeCellComponent };
/** 树形单元格实例类型 */
export type TreeCellComponentInstance = InstanceType<typeof TreeCellComponent>;
