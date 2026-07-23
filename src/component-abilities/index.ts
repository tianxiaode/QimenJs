/**
 * @qimenjs/component-abilities
 *
 * UI 组件能力定义 - 提供可组合的 UI 能力，供组件和扩展包按需引用。
 * 与 @qimenjs/composable 的 AbilityDefinition 配合使用。
 */

// 渲染能力
export { VirtualListAbility } from './render';
export { AnimationAbility } from './render';

export { ArrowAbility, type ArrowConfig } from './render';
export { arrowCSS } from './render';

// 菜单能力
export { MenuItemManageAbility, type MenuItemConfig } from './menu';

// 分组选择能力
export {
    GroupSelectAbility,
    type GroupSelectMode,
    type GroupInfo,
    type GroupSelectConfig,
} from './group';

// 尺寸能力
export { SizeAbility, type SizeConfig } from './size';

// 表单值能力
export { FormValueAbility } from './form';
