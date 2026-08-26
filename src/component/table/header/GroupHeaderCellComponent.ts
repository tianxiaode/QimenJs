/**
 * GroupHeaderCellComponent 分组表头单元格组件
 *
 * 多表头的分组容器，递归嵌套：
 * - 顶部全宽标题
 * - 底部 children 容器（flex row），放子 HeaderCell（leaf 或 group）
 * - 右边缘 resize 手柄，拖拽时代理到最右子列
 * - 宽度 = calc(子列 CSS 变量之和)
 * - 无排序
 *
 * @example
 * ```ts
 * const groupCell = new GroupHeaderCellComponent({
 *     colName: 'baseInfo',
 *     title: '基本信息',
 *     childNames: ['name', 'age', 'dept'],
 *     childConfigs: [...],
 * });
 * ```
 */

import { BaseHeaderCellComponent } from './BaseHeaderCellComponent';
import type { BaseHeaderCellProps } from './BaseHeaderCellComponent';
import type { ColumnAlign } from '../column-types';
import type { TplNode } from '@qimenjs/component-core';
import { GROUP_HEADER_CELL_TPL } from './group-header-cell-tpl';
import { LeafHeaderCellComponent } from './LeafHeaderCellComponent';
import './groupheadercell.css.ts';

/** 分组表头单元格属性接口 */
export interface GroupHeaderCellProps extends BaseHeaderCellProps {
    resizable?: boolean;
    childNames: string[];
    childConfigs: GroupChildConfig[];
}

/** 分组表头子项配置 */
export interface GroupChildConfig {
    type: 'leaf' | 'group';
    colName: string;
    title?: string;
    align?: ColumnAlign;
    sortable?: boolean;
    resizable?: boolean;
    minWidth?: number;
    children?: GroupChildConfig[];
}

class GroupHeaderCellComponent extends BaseHeaderCellComponent {
    get tpl(): TplNode {
        return GROUP_HEADER_CELL_TPL;
    }

    _childNames: string[] = [];
    _childCells: Array<{ component: any; el: HTMLElement }> = [];
    _resizable: boolean = true;
    _resizeStartWidth: number = 0;

    onAfterInit(props?: GroupHeaderCellProps): void {
        super.onAfterInit(props);
        this.addCls('q-header-cell--group');
        this.removeCls('q-header-cell--leaf');

        if (props?.childNames) this._childNames = props.childNames;
        if (props?.resizable !== undefined) this._resizable = props.resizable;
        this.attachDrag('resizeHandle', {
            axis: 'x' as const,
            activeClass: 'q-header-cell__resize--active',
        });
        this._applyGroupWidth();
        this._applyResizable();
        if (props?.childConfigs) this._createChildren(props.childConfigs);
    }

    _applyGroupWidth(): void {
        if (this._childNames.length === 0) return;
        const parts = this._childNames.map((n: string) => `var(--q-table-col-${n}-width)`);
        this.setNodeStyle({
            width: `calc(${parts.join(' + ')})`,
            flexShrink: '0',
        });
    }

    _applyResizable(): void {
        this.setNodeStyle({ display: this._resizable ? '' : 'none' }, 'resizeHandle');
    }

    _createChildren(configs: GroupChildConfig[]): void {
        const container = this._resolveNodeEl('children');
        if (!container) return;

        for (const config of configs) {
            const ChildClass = config.type === 'group' ? GroupHeaderCellComponent : LeafHeaderCellComponent;

            const childProps: any = {
                colName: config.colName,
                title: config.title,
                align: config.align,
                minWidth: config.minWidth,
            };

            if (config.type === 'leaf') {
                childProps.sortable = config.sortable;
                childProps.resizable = config.resizable;
            } else if (config.type === 'group' && config.children) {
                childProps.childNames = config.children.map((c: GroupChildConfig) => c.colName);
                childProps.childConfigs = config.children;
            }

            const instance = new ChildClass(childProps);
            this._childCells.push({ component: instance, el: instance.el });
            container.appendChild(instance.el);
        }
    }

    onResizeHandleDragStart(_ctx: {
        dx: number;
        dy: number;
        el: HTMLElement;
        originalEvent: Event;
    }): void {
        if (!this._resizable || this._childNames.length === 0) return;
        this._resizeStartWidth = this.el.offsetWidth;
    }

    onResizeHandleDragMove(ctx: {
        dx: number;
        dy: number;
        el: HTMLElement;
        originalEvent: Event;
    }): void {
        if (!this._resizable || this._childNames.length === 0) return;
        const targetCol = this._childNames[this._childNames.length - 1];
        const newWidth = Math.max(this._minWidth, this._resizeStartWidth + ctx.dx);
        this.emit('resize', {
            colName: targetCol,
            width: newWidth,
        });
    }

    onResizeHandleDragEnd(_ctx: { el: HTMLElement; originalEvent: Event }): void {}

    update(data: any): void {
        if (data?.title !== undefined) {
            this.setNodeProp('text', String(data.title), 'title');
        }
    }
}

export { GroupHeaderCellComponent };
/** 分组表头单元格实例类型 */
export type GroupHeaderCellComponentInstance = InstanceType<typeof GroupHeaderCellComponent>;
