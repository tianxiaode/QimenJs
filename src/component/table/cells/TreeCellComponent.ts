/**
 * TreeCellComponent 树形单元格组件
 *
 * 在 BaseCell 基础上通过 tplReplaces 替换 content 为树形结构：
 * toggle（展开/折叠图标）+ indent（缩进占位）+ text（文本内容）
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
import type { ColumnAlign, TreeCellData } from '../column-types';

export interface TreeCellProps {
    align?: ColumnAlign;
}

const INDENT_UNIT = 20;

export let TreeCellComponent = BaseCellComponent.replace({
    type: 'TreeCell',

    tplReplaces: {
        content: {
            tag: 'div',
            cls: 'q-cell__tree',
            children: [
                { tag: 'span', name: 'toggle', cls: 'q-cell__toggle' },
                { tag: 'span', name: 'text', cls: 'q-cell__text' },
            ],
        },
    },

    body: {
        onInitState() {
            return {
                _depth: 0,
                _leaf: true,
                _expanded: false,
            };
        },

        onAfterInit(props?: TreeCellProps): void {},

        update(data: TreeCellData): void {
            const self = this as any;
            self._depth = data.depth ?? 0;
            self._leaf = data.leaf ?? true;
            self._expanded = data.expanded ?? false;

            self._applyIndent();
            self._applyToggle();
            self.setNodeProp('text', String(data.value ?? ''), 'text');
        },

        _applyIndent(): void {
            const self = this as any;
            const toggleEl = self.nodeMap?.toggle?.el as HTMLElement | null;
            if (toggleEl) {
                toggleEl.style.marginLeft = `${self._depth * INDENT_UNIT}px`;
            }
        },

        _applyToggle(): void {
            const self = this as any;
            const toggleEl = self.nodeMap?.toggle?.el as HTMLElement | null;
            if (!toggleEl) return;

            if (self._leaf) {
                toggleEl.classList.add('q-cell__toggle--leaf');
                toggleEl.classList.remove('q-cell__toggle--expanded');
            } else {
                toggleEl.classList.remove('q-cell__toggle--leaf');
                toggleEl.classList.toggle('q-cell__toggle--expanded', self._expanded);
            }
        },

        get depth(): number {
            const self = this as any;
            return self._depth;
        },

        get leaf(): boolean {
            const self = this as any;
            return self._leaf;
        },

        get expanded(): boolean {
            const self = this as any;
            return self._expanded;
        },
        set expanded(v: boolean) {
            const self = this as any;
            self._expanded = v;
            self._applyToggle();
        },
    },
});

export type TreeCellComponent = InstanceType<typeof TreeCellComponent>;
