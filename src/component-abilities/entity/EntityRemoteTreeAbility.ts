/**
 * EntityRemoteTreeAbility 远程树实体能力
 *
 * 适用于 RemoteTreeEntityManager，代理树形操作方法。
 * 组合：EntityCoreAbility + EntityEmitAbility + EntityListenAbility + SelectionAbility
 *
 * 代理的方法：list, get, refresh, prev, next, jump, changeSize, filter, searchBy, sort, reset,
 *            create, update, delete, expand, collapse, move, getSubTree
 * 监听的组件事件：crudaction, pagechange, searchchange, refresh
 * 转发的 mgr 事件：listed, got, created, updated, deleted, dataChange, loading/success/error（含分页信息）
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import { EntityCoreAbility } from './EntityCoreAbility';
import { EntityEmitAbility } from './EntityEmitAbility';
import { EntityListenAbility } from './EntityListenAbility';
import { SelectionAbility } from '../selection/SelectionAbility';

/**
 * 远程树 manager 允许代理的方法白名单
 */
const REMOTE_TREE_METHODS = new Set([
    'list', 'get', 'refresh', 'reload',
    'prev', 'next', 'jump', 'changeSize',
    'filter', 'searchBy', 'sort', 'reset',
    'toParams', 'matchKeyword', 'applySort',
    'loadPage',
    'create', 'update', 'delete',
    'expand', 'collapse', 'move', 'getSubTree',
    'isLoaded', 'setLoaded',
]);

export const EntityRemoteTreeAbility: AbilityDefinition = {
    ...EntityCoreAbility,
    ...EntityEmitAbility,
    ...EntityListenAbility,
    ...SelectionAbility,

    /**
     * 覆盖 EntityCoreAbility 的方法代理，只代理树形方法
     */
    _getMgrMethodNames(): string[] {
        const allMethods = EntityCoreAbility._getMgrMethodNames.call(this);
        return allMethods.filter((name: string) => REMOTE_TREE_METHODS.has(name));
    },
};
