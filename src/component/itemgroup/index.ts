/**
 * ItemGroup 组件统一导出
 */

// 导出公共类型
export type {
    OverflowMode,
    DefaultItemDef,
    DefaultItemConfig,
    ItemGroupConfig,
    ItemGroupProps
} from './ItemGroupComponent';

// 导出公共能力
export { ItemGroupAbility } from './ItemGroupAbility';

// 导出具体组件
export { ItemGroupComponent } from './ItemGroupComponent';
export { ItemGroupNoPoolComponent } from './ItemGroupNoPoolComponent';
export { ItemGroupWithPoolComponent } from './ItemGroupWithPoolComponent';

// 导出具体组件类型
export type { 
    ItemGroupComponentType,
    ItemGroupNoPoolComponentType,
    ItemGroupWithPoolComponentType
};
