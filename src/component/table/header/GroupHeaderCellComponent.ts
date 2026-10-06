import { HeaderCellComponent } from './HeaderCellComponent';
import type { ColumnAlign } from '../column-types';
import type { TemplateDecl } from '@qimenjs/component-core';
import { Definitions } from '@/composable';
import { GROUP_HEADER_CELL_TPL } from './group-header-cell-tpl';
import './groupheadercell.css';

export interface GroupChildConfig {
    type: 'leaf' | 'group';
    colName: string;
    title?: string;
    align?: ColumnAlign;
    sortable?: boolean;
    resizable?: boolean;
    draggable?: boolean;
    minWidth?: number;
    groupable?: boolean;
    groupField?: string;
    hideableColumns?: Array<{ colName: string; title?: string; hidden: boolean }>;
    children?: GroupChildConfig[];
}

const GroupHeaderCellComponentDefs: Definitions = {
    options: {
        sortable: false,
        resizable: true,
    },
    fields: {
        childNames: [],
        childConfigs: undefined,
        childCells: undefined,
    },
} as const;

class GroupHeaderCellComponent extends HeaderCellComponent {
    static type = 'group-header-cell';

    get tpl(): TemplateDecl {
        return GROUP_HEADER_CELL_TPL;
    }

    _childCells: Array<{ component: any; el: HTMLElement }> = [];
    _resizeStartWidth: number = 0;

    onAfterInit(): void {
        super.onAfterInit();
        this.addCls('q-header-cell--group');
        this._applyGroupWidth();
        this._applyResizable();
        if (this.childCells && this.childCells.length > 0) {
            this._adoptChildCells(this.childCells);
        } else if (this.childConfigs) {
            this._createChildren(this.childConfigs);
        }
        this.onCleanup(() => this._destroyChildren());
    }

    _applySortIcon(): void {
        this.setStyles({ display: 'none' }, 'sortIcon');
        this.removeCls('q-header-cell--sortable');
    }

    _applyResizable(): void {
        this.setStyles({ display: this.resizable ? '' : 'none' }, 'resizeHandle');
    }

    _applyGroupWidth(): void {
        if (this.childNames.length === 0) return;
        const parts = this.childNames.map((n: string) => `var(--q-table-col-${n}-width)`);
        this.setStyles({
            width: `calc(${parts.join(' + ')})`,
            flexShrink: '0',
        });
    }

    _createChildren(configs: GroupChildConfig[]): void {
        const container = this.getNodeEl('children');
        if (!container) return;

        const eventKey = this.eventKey ?? this.getData?.('eventKey');

        for (const config of configs) {
            const ChildClass =
                config.type === 'group' ? GroupHeaderCellComponent : HeaderCellComponent;

            const childProps: any = {
                colName: config.colName,
                title: config.title,
                align: 'center',
                minWidth: config.minWidth,
                order: `var(--q-table-col-${config.colName}-order)`,
                eventKey,
                action: config.colName,
            };

            if (config.type === 'leaf') {
                childProps.sortable = config.sortable;
                childProps.resizable = config.resizable;
                childProps.draggable = config.draggable;
                childProps.groupable = config.groupable ?? false;
                childProps.groupField = config.groupField ?? '';
                childProps.hideableColumns = config.hideableColumns ?? null;
            } else if (config.type === 'group' && config.children) {
                childProps.childNames = config.children.map((c: GroupChildConfig) => c.colName);
                childProps.childConfigs = config.children;
            }

            const instance = new ChildClass(childProps);
            this._childCells.push({ component: instance, el: instance.el as HTMLElement });
            (this.childComponentList = this.childComponentList ?? []).push(instance);
            container.appendChild(instance.el);
        }
    }

    _adoptChildCells(cells: any[]): void {
        const container = this.getNodeEl('children');
        if (!container) return;
        for (const cell of cells) {
            this._childCells.push({ component: cell, el: cell.el as HTMLElement });
            (this.childComponentList = this.childComponentList ?? []).push(cell);
            container.appendChild(cell.el);
        }
    }

    _onResizeDrag(domEvt: any): void {
        if (!this.resizable || this.childNames.length === 0) return;
        const phase = domEvt?.data?.phase;
        if (phase === 'start') {
            const lastChild = this._childCells[this._childCells.length - 1];
            this._resizeStartWidth = lastChild?.el?.offsetWidth ?? this.el!.offsetWidth;
        } else if (phase === 'move') {
            const dx = domEvt.data.dx ?? 0;
            const targetCol = this.childNames[this.childNames.length - 1];
            const newWidth = Math.max(this.minWidth, this._resizeStartWidth + dx);
            this.componentEmit('resize', {
                colName: targetCol,
                width: newWidth,
            });
        }
    }

    _destroyChildren(): void {
        for (const { component } of this._childCells) {
            component.dispose?.();
        }
        this._childCells = [];
        this.childComponentList = [];
        const container = this.getNodeEl('children');
        if (container) container.innerHTML = '';
    }

    update(data: any): void {
        if (data?.colName !== undefined && data.colName !== this.colName) {
            this.setData('colName', data.colName);
        }
        if (data?.action !== undefined && data.action !== this.action) {
            this.setData('action', data.action);
        }
        if (data?.title !== undefined) {
            this.setData('title', data.title);
        }
        if (data?.childCells !== undefined) {
            this._destroyChildren();
            this._adoptChildCells(data.childCells);
        } else if (data?.childConfigs !== undefined) {
            const oldConfigs = this.childConfigs;
            const newConfigs = data.childConfigs;
            const changed =
                !oldConfigs ||
                oldConfigs.length !== newConfigs.length ||
                oldConfigs.some(
                    (c: GroupChildConfig, i: number) => c.colName !== newConfigs[i]?.colName
                );
            if (changed) {
                this.setData('childConfigs', newConfigs);
                if (data?.childNames !== undefined) {
                    this.setData('childNames', data.childNames);
                }
                this._destroyChildren();
                this._createChildren(newConfigs);
            }
        }
    }
}

GroupHeaderCellComponent.define(GroupHeaderCellComponentDefs);
GroupHeaderCellComponent.register();

export { GroupHeaderCellComponent };
export type GroupHeaderCellComponentInstance = InstanceType<typeof GroupHeaderCellComponent>;
