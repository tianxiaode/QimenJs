/**
 * CRUD 按钮工厂 — 标准节点定义 + 工厂方法
 *
 * 从 EntityToolbarComponent 提取的纯数据/纯函数模块，无 this 依赖。
 * 使用时 `...createCrudItems(config)` 展开到 toolbar 的 items 数组。
 *
 * @example
 * ```ts
 * import { createCrudItems } from './crud-items';
 *
 * const toolbar = new EntityToolbarComponent({
 *     items: [
 *         ...createCrudItems({ create: true, edit: true, delete: true, refresh: true }),
 *     ],
 * });
 * ```
 */

import type { EntityToolbarItemDef, BuiltinItemDef } from './types';
import { ButtonComponent } from '../button/ButtonComponent';

// ══════════════════════════════════════════════════════════════
// CRUD 按钮 name 集合（供事件路由判断用）
// ══════════════════════════════════════════════════════════════

/** CRUD按钮名称集合 */
export const CRUD_ITEM_NAMES = new Set([
    'create',
    'edit',
    'delete',
    'refresh',
    'save',
    'import',
    'export',
]);

// ══════════════════════════════════════════════════════════════
// 内置定义
// ══════════════════════════════════════════════════════════════

const CRUD_DEFS: Record<string, BuiltinItemDef> = {
    create: {
        name: 'create',
        type: ButtonComponent,
        order: 200,
        iconCls: 'q-toolbar-btn-create',
        hint: '@toolbar.create',
        variant: 'primary',
    },
    edit: {
        name: 'edit',
        type: ButtonComponent,
        order: 210,
        iconCls: 'q-toolbar-btn-edit',
        hint: '@toolbar.edit',
        variant: 'default',
    },
    delete: {
        name: 'delete',
        type: ButtonComponent,
        order: 220,
        iconCls: 'q-toolbar-btn-delete',
        hint: '@toolbar.delete',
        variant: 'warning',
    },
    refresh: {
        name: 'refresh',
        type: ButtonComponent,
        order: 230,
        iconCls: 'q-toolbar-btn-refresh',
        hint: '@toolbar.refresh',
        variant: 'default',
    },
    save: {
        name: 'save',
        type: ButtonComponent,
        order: 240,
        iconCls: 'q-toolbar-btn-save',
        hint: '@toolbar.save',
        variant: 'primary',
    },
    import: {
        name: 'import',
        type: ButtonComponent,
        order: 250,
        iconCls: 'q-toolbar-btn-import',
        hint: '@toolbar.import',
        variant: 'default',
    },
    export: {
        name: 'export',
        type: ButtonComponent,
        order: 260,
        iconCls: 'q-toolbar-btn-export',
        hint: '@toolbar.export',
        variant: 'default',
    },
};

// ══════════════════════════════════════════════════════════════
// 工厂方法
// ══════════════════════════════════════════════════════════════

/**
 * 创建 CRUD 按钮 items 数组
 *
 * @param config - 按钮名 → true（默认）/ false（跳过）/ 对象（覆盖）
 * @returns item 数据数组，可直接展开到 toolbar items
 */
export function createCrudItems(
    config?: Record<string, boolean | EntityToolbarItemDef>
): Record<string, any>[] {
    const items: Record<string, any>[] = [];

    // 无 config 时返回全部默认项
    const entries = config ?? Object.fromEntries(Object.keys(CRUD_DEFS).map(k => [k, true]));

    for (const [key, val] of Object.entries(entries)) {
        if (val === false) continue;

        const def = CRUD_DEFS[key];
        if (!def) continue;

        const override = val === true ? {} : (val as EntityToolbarItemDef);
        items.push(buildCrudItem(def, override));
    }

    return items;
}

// ══════════════════════════════════════════════════════════════
// 内部构建逻辑（CRUD 按钮全部为 Button 类型）
// ══════════════════════════════════════════════════════════════

function buildCrudItem(def: BuiltinItemDef, override: EntityToolbarItemDef): Record<string, any> {
    const name = override.name ?? def.name;
    const order = override.order ?? def.order;
    const iconCls = override.iconCls ?? def.iconCls;
    const hint = override.hint ?? def.hint;
    const variant = override.variant ?? def.variant;

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
