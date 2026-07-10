/**
 * EntityCoreAbility — 实体管理
 *
 * 对应 LayoutNode 的 EntityProps 字段：entity
 *
 * entity 为类引用（new 创建 Manager），在 __init__ 阶段创建 EntityManager。
 * InitAbility.initConfig 中已处理 entity 实例化，
 * 此能力仅提供 entity 属性声明。
 */

import type { AbilityDefinition } from '@/composable';

/** EntityManager 接口（框架定义） */
export interface EntityManager {
    dispose(): void;
}

export const EntityCoreAbility: AbilityDefinition = {
    entity: {
        get(): (new (...args: any[]) => any) | undefined { return this.props.entity; },
        set(v: (new (...args: any[]) => any) | undefined) { this.setProp('entity', v); },
    },
};
