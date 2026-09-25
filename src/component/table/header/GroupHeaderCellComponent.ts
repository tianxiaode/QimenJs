import { HeaderCellComponent } from './HeaderCellComponent';
import type { ColumnAlign } from '../column-types';
import type { DragOptions, TemplateDecl } from '@qimenjs/component-core';
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
    reorderable?: boolean;
    minWidth?: number;
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
    },
} as const;

class GroupHeaderCellComponent extends HeaderCellComponent {
    static type = 'group-header-cell';

    get tpl(): TemplateDecl {
        return GROUP_HEADER_CELL_TPL;
    }

    drag?: boolean | DragOptions = {
        axis: 'x',
        activeClass: 'q-header-cell__resize--active',
        handle: 'resizeHandle',
    };

    _childCells: Array<{ component: any; el: HTMLElement }> = [];
    _resizeStartWidth: number = 0;

    onAfterInit(): void {
        super.onAfterInit();
        this.addCls('q-header-cell--group');
        this._applyGroupWidth();
        this._applyResizable();
        if (this.childConfigs) this._createChildren(this.childConfigs);
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

        for (const config of configs) {
            const ChildClass =
                config.type === 'group' ? GroupHeaderCellComponent : HeaderCellComponent;

            const childProps: any = {
                colName: config.colName,
                title: config.title,
                align: config.align,
                minWidth: config.minWidth,
            };

            if (config.type === 'leaf') {
                childProps.sortable = config.sortable;
                childProps.resizable = config.resizable;
                childProps.reorderable = config.reorderable;
            } else if (config.type === 'group' && config.children) {
                childProps.childNames = config.children.map((c: GroupChildConfig) => c.colName);
                childProps.childConfigs = config.children;
            }

            const instance = new ChildClass(childProps);
            if (typeof instance.on === 'function') {
                instance.on('menuSelect', (data: any) => {
                    this.emit('menuSelect', data);
                });
            }
            this._childCells.push({ component: instance, el: instance.el as HTMLElement });
            container.appendChild(instance.el);
        }
    }

    onDragStart(_ctx: { dx: number; dy: number; el: HTMLElement; originalEvent: Event }): void {
        if (!this.resizable || this.childNames.length === 0) return;
        this._resizeStartWidth = this.el!.offsetWidth;
    }

    onDragMove(ctx: { dx: number; dy: number; el: HTMLElement; originalEvent: Event }): void {
        if (!this.resizable || this.childNames.length === 0) return;
        const targetCol = this.childNames[this.childNames.length - 1];
        const newWidth = Math.max(this.minWidth, this._resizeStartWidth + ctx.dx);
        this.emit('resize', {
            colName: targetCol,
            width: newWidth,
        });
    }

    onDragEnd(_ctx: { el: HTMLElement; originalEvent: Event }): void {}

    update(data: any): void {
        if (data?.title !== undefined) {
            this.setData('title', data.title);
        }
    }
}

GroupHeaderCellComponent.define(GroupHeaderCellComponentDefs);
GroupHeaderCellComponent.register();

export { GroupHeaderCellComponent };
export type GroupHeaderCellComponentInstance = InstanceType<typeof GroupHeaderCellComponent>;
