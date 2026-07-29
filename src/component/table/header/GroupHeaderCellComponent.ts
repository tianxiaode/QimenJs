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
import { TemplateRegistrar } from '@qimenjs/component-core';
import type { ColumnAlign } from '../column-types';

export interface GroupHeaderCellProps {
    colName: string;
    title?: string;
    align?: ColumnAlign;
    resizable?: boolean;
    childNames: string[];
    childConfigs: GroupChildConfig[];
}

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

export let GroupHeaderCellComponent = BaseHeaderCellComponent.replace({

    tplReplaces: {
        content: {
            tag: 'div',
            name: 'groupBody',
            cls: 'q-header-cell__group-body',
            children: [
                { tag: 'span', name: 'title', cls: 'q-header-cell__title' },
                { tag: 'div', name: 'children', cls: 'q-header-cell__children' },
            ],
        },
    },

    body: {
        drags: {
            resizeHandle: { axis: 'x', activeClass: 'q-header-cell__resize--active' },
        },

        _childNames: [] as string[],
        _childCells: [] as Array<{ component: any; el: HTMLElement }>,
        _resizable: true as boolean,
        _resizeStartWidth: 0 as number,

        onAfterInit(props?: GroupHeaderCellProps): void {
            const self = this as any;
            self.el.classList.add('q-header-cell--group');
            self.el.classList.remove('q-header-cell--leaf');

            if (props?.childNames) self._childNames = props.childNames;
            if (props?.resizable !== undefined) self._resizable = props.resizable;
            self._applyGroupWidth();
            self._applyResizable();
            if (props?.childConfigs) self._createChildren(props.childConfigs);
        },

        _applyGroupWidth(): void {
            const self = this as any;
            if (self._childNames.length === 0) return;
            const parts = self._childNames.map((n: string) => `var(--q-table-col-${n}-width)`);
            self.el.style.width = `calc(${parts.join(' + ')})`;
            self.el.style.flexShrink = '0';
        },

        _applyResizable(): void {
            const self = this as any;
            const handle = self.nodeMap?.resizeHandle?.el as HTMLElement | null;
            if (!handle) return;
            handle.style.display = self._resizable ? '' : 'none';
        },

        _createChildren(configs: GroupChildConfig[]): void {
            const self = this as any;
            const container = self.nodeMap?.children?.el as HTMLElement | null;
            if (!container) return;

            for (const config of configs) {
                const componentType =
                    config.type === 'group' ? 'GroupHeaderCell' : 'LeafHeaderCell';
                const ChildClass = TemplateRegistrar.getInstance().get(componentType) as any;
                if (!ChildClass) continue;

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
                self._childCells.push({ component: instance, el: instance.el });
                container.appendChild(instance.el);
            }
        },

        onResizeHandleDragStart(ctx: {
            dx: number;
            dy: number;
            el: HTMLElement;
            originalEvent: Event;
        }): void {
            const self = this as any;
            if (!self._resizable || self._childNames.length === 0) return;
            self._resizeStartWidth = self.el.offsetWidth;
        },

        onResizeHandleDragMove(ctx: {
            dx: number;
            dy: number;
            el: HTMLElement;
            originalEvent: Event;
        }): void {
            const self = this as any;
            if (!self._resizable || self._childNames.length === 0) return;
            const targetCol = self._childNames[self._childNames.length - 1];
            const newWidth = Math.max(self._minWidth, self._resizeStartWidth + ctx.dx);
            self.emit('resize', {
                colName: targetCol,
                width: newWidth,
            });
        },

        onResizeHandleDragEnd(_ctx: { el: HTMLElement; originalEvent: Event }): void {},

        update(data: any): void {
            const self = this as any;
            if (data?.title !== undefined) {
                self.setNodeProp('text', String(data.title), 'title');
            }
        },
    },
});

export type GroupHeaderCellComponentType = InstanceType<typeof GroupHeaderCellComponent>;
