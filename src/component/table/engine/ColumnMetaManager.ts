/**
 * ColumnMetaManager — 列元数据管理器（实例级）
 *
 * 参照 NodeMapManager 模式：持有数据 + 提供查询 + 管理生命周期。
 * 每个 Table 实例创建自己的 ColumnMetaManager，不跨实例共享。
 *
 * 职责：
 * - compile: ColumnDefOrGroup[] → ColumnMeta[]（展平分组，仅叶子列）
 * - get/getAll: 按名称或全量查询
 * - getEditable/getGroupable/getSummarizable: 懒缓存筛选
 * - dispose: 清理
 *
 * TableEngine 统一接收 ColumnMetaManager，按需取用列信息：
 *   TableEngine.compile(mgr)
 */

import type {
    ColumnDef,
    ColumnDefOrGroup,
    ColumnGroupDef,
    ColumnMeta,
    ColumnAlign,
    CellType,
    EditType,
    AggregatorType,
} from '../column-types';

function resolveWidth(w?: string | number): string | undefined {
    if (w === undefined) return undefined;
    return typeof w === 'number' ? `${w}px` : w;
}

function resolveAlign(cellType: CellType, align?: ColumnAlign): ColumnAlign {
    if (align) return align;
    if (cellType === 'checkbox' || cellType === 'action') return 'center';
    return 'left';
}

export class ColumnMetaManager {
    private _rawColumns: ColumnDefOrGroup[] = [];
    private _metas: ColumnMeta[] = [];
    private _map: Record<string, ColumnMeta> = {};
    private _cache: {
        editable?: ColumnMeta[];
        groupable?: ColumnMeta[];
        summarizable?: ColumnMeta[];
    } = {};

    compile(columns: ColumnDefOrGroup[]): void {
        this._rawColumns = columns;
        this._metas = [];
        this._flattenColumns(columns);
        this._buildMap();
        this._clearCache();
    }

    get(name: string): ColumnMeta | undefined {
        return this._map[name];
    }

    getAll(): ColumnMeta[] {
        return this._metas;
    }

    get rawColumns(): ColumnDefOrGroup[] {
        return this._rawColumns;
    }

    get count(): number {
        return this._metas.length;
    }

    getEditable(): ColumnMeta[] {
        if (!this._cache.editable) {
            this._cache.editable = this._metas.filter(m => m.editable);
        }
        return this._cache.editable;
    }

    getGroupable(): ColumnMeta[] {
        if (!this._cache.groupable) {
            this._cache.groupable = this._metas.filter(m => m.groupAggregator);
        }
        return this._cache.groupable;
    }

    getSummarizable(): ColumnMeta[] {
        if (!this._cache.summarizable) {
            this._cache.summarizable = this._metas.filter(m => m.tableAggregator);
        }
        return this._cache.summarizable;
    }

    getLeafNames(): string[] {
        return this._metas.map(m => m.name);
    }

    dispose(): void {
        this._rawColumns = [];
        this._metas = [];
        this._map = {};
        this._clearCache();
    }

    private _flattenColumns(columns: ColumnDefOrGroup[]): void {
        for (const col of columns) {
            if (this._isGroup(col)) {
                this._flattenColumns(col.children);
            } else {
                this._metas.push(this._compileLeafMeta(col));
            }
        }
    }

    private _compileLeafMeta(def: ColumnDef): ColumnMeta {
        const cellType: CellType = def.cellType || 'text';
        return {
            name: def.name,
            field: def.field || def.name,
            title: def.title,
            cellType,
            format: def.format,
            align: resolveAlign(cellType, def.align),
            width: resolveWidth(def.width),
            minWidth: def.minWidth,
            maxWidth: def.maxWidth,
            hidden: def.hidden ?? false,
            fixed: def.fixed,
            sortable: def.sortable ?? false,
            resizable: def.resizable ?? true,
            editable: def.editable ?? false,
            editType: def.editType ?? 'text',
            editComponent: def.editComponent,
            groupAggregator: def.groupAggregator,
            tableAggregator: def.tableAggregator,
            cellTpl: def.cellTpl,
            headerTpl: def.headerTpl,
        };
    }

    private _isGroup(col: ColumnDefOrGroup): col is ColumnGroupDef {
        return 'children' in col && Array.isArray((col as ColumnGroupDef).children);
    }

    private _buildMap(): void {
        this._map = {};
        for (const meta of this._metas) {
            this._map[meta.name] = meta;
        }
    }

    private _clearCache(): void {
        this._cache = {};
    }
}
