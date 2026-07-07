// 子能力（可按需组合）
export { EntityCoreAbility } from './EntityCoreAbility';
export { EntityEmitAbility } from './EntityEmitAbility';
export { EntityListenAbility } from './EntityListenAbility';

// 按 manager 类型分类的组合能力（推荐使用）
export { EntityLocalReadonlyAbility } from './EntityLocalReadonlyAbility';
export { EntityLocalCrudAbility } from './EntityLocalCrudAbility';
export { EntityRemoteReadonlyAbility } from './EntityRemoteReadonlyAbility';
export { EntityRemoteCrudAbility } from './EntityRemoteCrudAbility';
export { EntityRemoteTreeAbility } from './EntityRemoteTreeAbility';

// 向后兼容的组合导出
export { EntityAbility } from './EntityAbility';

// 旧版导出（已废弃，由 EntityEmitAbility 替代）
export { EntityEventAbility } from './EntityEventAbility';
