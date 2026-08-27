/**
 * @qimenjs/component-abilities
 *
 * UI 组件能力定义 - 提供可组合的 UI 能力，供组件和扩展包按需引用。
 * 与 @qimenjs/composable 的 AbilityDefinition 配合使用。
 */

// 渲染能力
export { ArrowAbility } from '../component-core/abilities/render';

// 分组选择能力
export {
    GroupSelectAbility,
    type GroupSelectMode,
    type GroupInfo,
    type GroupSelectConfig,
} from './group';

// 尺寸能力
export { SizeAbility, type SizeConfig } from './size';

// 调整大小能力
export { ResizeAbility, type ResizeConfig, type ResizeEdge } from './resize';

// 指示器能力
export { IndicatorAbility, type IndicatorType, type IndicatorConfig } from './indicator';

// 溢出能力
export {
    OverflowAbility,
    type OverflowMode,
    type OverflowState,
    type OverflowItem,
} from './overflow';
