/**
 * EntityLocalCrudAbility 本地 CRUD 实体能力
 *
 * 适用于 LocalCrudEntityManager，代理本地 CRUD 方法。
 * 组合：EntityCoreAbility + EntityEmitAbility + EntityListenAbility + SelectionAbility
 *
 * 代理的方法：list, get, refresh, filter, sort, create, update, delete, save, toggle
 * 监听的组件事件：crudaction, pagechange, searchchange, refresh
 * 转发的 mgr 事件：listed, got, created, updated, deleted, saved, toggled, dataChange, loading/success/error
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import { EntityCoreAbility } from './EntityCoreAbility';
import { EntityEmitAbility } from './EntityEmitAbility';
import { EntityListenAbility } from './EntityListenAbility';
import { SelectionAbility } from '../selection/SelectionAbility';

/**
 * 本地 CRUD manager 允许代理的方法白名单
 */
const LOCAL_CRUD_METHODS = new Set([
    'list', 'get', 'refresh', 'filter', 'sort',
    'toParams', 'searchBy', 'matchKeyword', 'applySort',
    'create', 'update', 'delete', 'save', 'toggle',
    'addItem', 'updateItem', 'softDelete', 'confirmDelete',
    'getDeletionPlan', 'rollbackDelete', 'clearChanges',
]);

export const EntityLocalCrudAbility: AbilityDefinition = {
    ...EntityCoreAbility,
    ...EntityEmitAbility,
    ...EntityListenAbility,
    ...SelectionAbility,

    /**
     * 覆盖 EntityCoreAbility 的方法代理，只代理本地 CRUD 方法
     */
    _getMgrMethodNames(): string[] {
        const allMethods = EntityCoreAbility._getMgrMethodNames.call(this);
        return allMethods.filter((name: string) => LOCAL_CRUD_METHODS.has(name));
    },
};
