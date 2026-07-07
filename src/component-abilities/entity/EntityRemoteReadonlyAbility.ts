/**
 * EntityRemoteReadonlyAbility 远程只读实体能力
 *
 * 适用于 RemoteReadonlyEntityManager，代理远程只读方法（含分页导航）。
 * 组合：EntityCoreAbility + EntityEmitAbility + EntityListenAbility + SelectionAbility
 *
 * 代理的方法：list, getAll, get, refresh, prev, next, jump, changeSize, filter, searchBy, sort, reset
 * 监听的组件事件：pagechange, searchchange, refresh
 * 转发的 mgr 事件：listed, got, dataChange, loading/success/error（含分页信息）
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import { EntityCoreAbility } from './EntityCoreAbility';
import { EntityEmitAbility } from './EntityEmitAbility';
import { EntityListenAbility } from './EntityListenAbility';
import { SelectionAbility } from '../selection/SelectionAbility';

/**
 * 远程只读 manager 允许代理的方法白名单
 */
const REMOTE_READONLY_METHODS = new Set([
    'list', 'getAll', 'get', 'refresh', 'reload',
    'prev', 'next', 'jump', 'changeSize',
    'filter', 'searchBy', 'sort', 'reset',
    'toParams', 'matchKeyword', 'applySort',
    'loadPage',
]);

export const EntityRemoteReadonlyAbility: AbilityDefinition = {
    ...EntityCoreAbility,
    ...EntityEmitAbility,
    ...EntityListenAbility,
    ...SelectionAbility,

    /**
     * 覆盖 EntityCoreAbility 的方法代理，只代理远程只读方法
     */
    _getMgrMethodNames(): string[] {
        const allMethods = EntityCoreAbility._getMgrMethodNames.call(this);
        return allMethods.filter((name: string) => REMOTE_READONLY_METHODS.has(name));
    },
};
