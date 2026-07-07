/**
 * EntityLocalReadonlyAbility 本地只读实体能力
 *
 * 适用于 LocalReadonlyEntityManager，只代理只读方法。
 * 组合：EntityCoreAbility + EntityEmitAbility + EntityListenAbility + SelectionAbility
 *
 * 代理的方法：list, get, refresh, filter, sort
 * 监听的组件事件：pagechange, SEARCH_EVENTS.CHANGE, refresh
 * 转发的 mgr 事件：listed, got, dataChange, loading/success/error
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import { EntityCoreAbility } from './EntityCoreAbility';
import { EntityEmitAbility } from './EntityEmitAbility';
import { EntityListenAbility } from './EntityListenAbility';
import { SelectionAbility } from '../selection/SelectionAbility';

/**
 * 本地只读 manager 允许代理的方法白名单
 */
const LOCAL_READONLY_METHODS = new Set([
    'list', 'get', 'refresh', 'filter', 'sort',
    'toParams', 'searchBy', 'matchKeyword', 'applySort',
]);

export const EntityLocalReadonlyAbility: AbilityDefinition = {
    ...EntityCoreAbility,
    ...EntityEmitAbility,
    ...EntityListenAbility,
    ...SelectionAbility,

    /**
     * 覆盖 EntityCoreAbility 的方法代理，只代理只读方法
     */
    _getMgrMethodNames(): string[] {
        const allMethods = EntityCoreAbility._getMgrMethodNames.call(this);
        return allMethods.filter((name: string) => LOCAL_READONLY_METHODS.has(name));
    },
};
