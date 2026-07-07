/**
 * EntityAbility 实体管理能力（组合导出）
 *
 * 将三个独立能力组合为一个便捷导出，保持向后兼容：
 * - EntityCoreAbility：mgr 管理、entityConfig、方法代理
 * - EntityEmitAbility：监听 mgr 事件 → 转发为组件事件（含分页信息）
 * - EntityListenAbility：监听组件事件 → 调用 mgr 操作
 * - SelectionAbility：多选集合状态管理
 *
 * 推荐按 manager 类型使用更精确的能力：
 * - EntityLocalReadonlyAbility：本地只读
 * - EntityLocalCrudAbility：本地 CRUD
 * - EntityRemoteReadonlyAbility：远程只读（含分页导航）
 * - EntityRemoteCrudAbility：远程 CRUD（含分页导航）
 * - EntityRemoteTreeAbility：远程树形
 *
 * 或按需组合子能力：
 * ```typescript
 * // 完整功能（等同于 EntityAbility）
 * static abilities = [EntityCoreAbility, EntityEmitAbility, EntityListenAbility, SelectionAbility];
 *
 * // 只需要实体管理 + 事件转发，不需要监听组件事件
 * static abilities = [EntityCoreAbility, EntityEmitAbility, SelectionAbility];
 * ```
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import { EntityCoreAbility } from './EntityCoreAbility';
import { EntityEmitAbility } from './EntityEmitAbility';
import { EntityListenAbility } from './EntityListenAbility';
import { SelectionAbility } from '../selection/SelectionAbility';

/**
 * EntityAbility = EntityCoreAbility + EntityEmitAbility + EntityListenAbility + SelectionAbility
 *
 * 保持向后兼容的组合导出。
 * 新代码建议使用按 manager 类型分类的能力或直接组合子能力。
 */
export const EntityAbility: AbilityDefinition = {
    ...EntityCoreAbility,
    ...EntityEmitAbility,
    ...EntityListenAbility,
    ...SelectionAbility,
};
