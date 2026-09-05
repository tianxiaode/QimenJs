/**
 * 分页按钮工厂 — 标准节点定义 + 工厂方法
 *
 * 从 EntityToolbarComponent 提取的纯数据/纯函数模块，无 this 依赖。
 * 使用时 `...createPaginationItems(config)` 展开到 toolbar 的 items 数组。
 *
 * @example
 * ```ts
 * import { createPaginationItems } from './pagination-items';
 *
 * const toolbar = new EntityToolbarComponent({
 *     items: [
 *         ...createPaginationItems(
 *             { firstPage: true, prevPage: true, pageNum: true, nextPage: true },
 *             { defaultPageSize: 20, pageSizes: [10, 20, 50] }
 *         ),
 *     ],
 * });
 * ```
 */

import type { EntityToolbarItemDef, BuiltinItemDef } from './types';
import { ButtonComponent } from '../button/ButtonComponent';
import { NumberInputComponent } from '../form/NumberInputComponent';
import { SelectComponent } from '../form/SelectComponent';
import { TextComponent } from '../text/TextComponent';

// ══════════════════════════════════════════════════════════════
// 分页按钮 name 集合（供事件路由判断用）
// ══════════════════════════════════════════════════════════════

/** 分页按钮名称集合 */
export const PAGINATION_ITEM_NAMES = new Set(['firstPage', 'prevPage', 'nextPage', 'lastPage']);

// ══════════════════════════════════════════════════════════════
// 内置定义
// ══════════════════════════════════════════════════════════════

const PAGINATION_DEFS: Record<string, BuiltinItemDef> = {
    firstPage: {
        name: 'firstPage',
        type: ButtonComponent,
        order: 100,
        iconCls: 'q-toolbar-btn-first-page',
        hint: '@toolbar.firstPage',
        variant: 'default',
    },
    prevPage: {
        name: 'prevPage',
        type: ButtonComponent,
        order: 110,
        iconCls: 'q-toolbar-btn-prev-page',
        hint: '@toolbar.prevPage',
        variant: 'default',
    },
    pageNum: {
        name: 'pageNum',
        type: NumberInputComponent,
        order: 120,
        iconCls: '',
        hint: '',
        variant: '',
    },
    pageTotal: {
        name: 'pageTotal',
        type: TextComponent,
        order: 130,
        iconCls: '',
        hint: '',
        variant: '',
    },
    nextPage: {
        name: 'nextPage',
        type: ButtonComponent,
        order: 140,
        iconCls: 'q-toolbar-btn-next-page',
        hint: '@toolbar.nextPage',
        variant: 'default',
    },
    lastPage: {
        name: 'lastPage',
        type: ButtonComponent,
        order: 150,
        iconCls: 'q-toolbar-btn-last-page',
        hint: '@toolbar.lastPage',
        variant: 'default',
    },
    pageSize: {
        name: 'pageSize',
        type: SelectComponent,
        order: 160,
        iconCls: '',
        hint: '',
        variant: '',
    },
    totalRecords: {
        name: 'totalRecords',
        type: TextComponent,
        order: 170,
        iconCls: '',
        hint: '',
        variant: '',
    },
};

// ══════════════════════════════════════════════════════════════
// 选项
// ══════════════════════════════════════════════════════════════

/** 分页项配置选项 */
export interface PaginationItemsOptions {
    /** 默认每页条数（pageSize 下拉用），默认 10 */
    defaultPageSize?: number;
    /** 可选每页条数列表，默认 [10, 20, 50, 100] */
    pageSizes?: number[];
}

// ══════════════════════════════════════════════════════════════
// 工厂方法
// ══════════════════════════════════════════════════════════════

/**
 * 创建分页按钮 items 数组
 *
 * @param config - 按钮名 → true（默认）/ false（跳过）/ 对象（覆盖）
 * @param options - pageSize 下拉的默认值和选项列表
 * @returns item 数据数组，可直接展开到 toolbar items
 */
export function createPaginationItems(
    config?: Record<string, boolean | EntityToolbarItemDef>,
    options?: PaginationItemsOptions
): Record<string, any>[] {
    const items: Record<string, any>[] = [];

    // 无 config 时返回全部默认项
    const entries = config ?? Object.fromEntries(Object.keys(PAGINATION_DEFS).map(k => [k, true]));

    const defaultPageSize = options?.defaultPageSize ?? 10;
    const pageSizes = options?.pageSizes ?? [10, 20, 50, 100];

    for (const [key, val] of Object.entries(entries)) {
        if (val === false) continue;

        const def = PAGINATION_DEFS[key];
        if (!def) continue;

        const override = val === true ? {} : (val as EntityToolbarItemDef);
        items.push(buildPaginationItem(def, override, { defaultPageSize, pageSizes }));
    }

    return items;
}

// ══════════════════════════════════════════════════════════════
// 内部构建逻辑（从 EntityToolbarComponent._buildBuiltinItem 迁移）
// ══════════════════════════════════════════════════════════════

function buildPaginationItem(
    def: BuiltinItemDef,
    override: EntityToolbarItemDef,
    opts: { defaultPageSize: number; pageSizes: number[] }
): Record<string, any> {
    const name = override.name ?? def.name;
    const order = override.order ?? def.order;
    const iconCls = override.iconCls ?? def.iconCls;
    const hint = override.hint ?? def.hint;
    const variant = override.variant ?? def.variant;

    if (def.type === ButtonComponent) {
        const variantCls = variant && variant !== 'default' ? ` q-button--${variant}` : '';
        return {
            type: ButtonComponent,
            name,
            action: name,
            icon: iconCls,
            hint,
            cls: `q-entity-toolbar__btn q-entity-toolbar__btn--${name}${variantCls}${override.cls ? ' ' + override.cls : ''}`,
            order,
        };
    }

    if (name === 'pageNum') {
        return {
            type: NumberInputComponent,
            name: 'pageNum',
            value: 1,
            min: 1,
            cls: 'q-entity-toolbar__input q-entity-toolbar__input--page-num',
            order,
        };
    }

    if (name === 'pageSize') {
        return {
            type: SelectComponent,
            name: 'pageSize',
            value: opts.defaultPageSize,
            options: opts.pageSizes.map(s => ({ label: String(s), value: s })),
            cls: 'q-entity-toolbar__select q-entity-toolbar__select--page-size',
            order,
        };
    }

    if (name === 'pageTotal') {
        return {
            type: TextComponent,
            name: 'pageTotal',
            text: '1/0',
            cls: 'q-entity-toolbar__text q-entity-toolbar__text--page-total',
            order,
        };
    }

    if (name === 'totalRecords') {
        return {
            type: TextComponent,
            name: 'totalRecords',
            text: '0',
            cls: 'q-entity-toolbar__text q-entity-toolbar__text--total-records',
            order,
        };
    }

    return { type: def.type, name, hint, order, ...override };
}
