/**
 * UI 能力定义导出
 */

// 属性别名与初始化协议
export { mergePropAliases, applyPropAliases, initAbilitiesFromProps } from './PropAlias';
export type { PropAliasMap } from './PropAlias';

// 通用 UI 能力
export { ThemeAbility } from './ThemeAbility';
export { StyleAbility } from './StyleAbility';
export { TextAbility } from './TextAbility';
export { VisibleAbility } from './VisibleAbility';
export { DisableAbility } from './DisableAbility';
export { LoadingAbility } from './LoadingAbility';
export { SizeAbility } from './SizeAbility';

// 数据能力
export { ValueAbility } from './ValueAbility';
export { ValidateAbility } from './ValidateAbility';
export { PlaceholderAbility } from './PlaceholderAbility';
export { SubmitAbility } from './SubmitAbility';
export { FieldSetAbility } from './FieldSetAbility';

// 实体管理能力
export { EntityAbility } from './EntityAbility';

// 子组件管理能力
export { ChildrenAbility } from './ChildrenAbility';

// 渲染能力
export { RenderAbility } from './RenderAbility';

// 虚拟列表能力
export { VirtualListAbility } from './VirtualListAbility';

// 浮层能力
export { OverlayAbility } from './OverlayAbility';

// 动画能力
export { AnimationAbility } from './AnimationAbility';

// 交互能力
export { ClickAbility } from './ClickAbility';
export { SelectableAbility } from './SelectableAbility';
export { OptionsAbility } from './OptionsAbility';
export { SearchAbility } from './SearchAbility';
export { SortAbility } from './SortAbility';
export { ColumnAbility } from './ColumnAbility';
export type { ColumnDefinition } from './ColumnAbility';
export { ColumnManageAbility } from './ColumnManageAbility';
export { OpenableAbility } from './OpenableAbility';
export { LayoutAbility } from './LayoutAbility';

// 工具栏能力
export { ToolbarAbility } from './ToolbarAbility';
export { PaginationAbility, PAGINATION_POSITIONS } from './PaginationAbility';
export { CrudAbility, CRUD_POSITIONS } from './CrudAbility';

// 事件桥接能力
export { EventBridgeAbility } from './EventBridgeAbility';
export type { EventBridgeConfig, PaginationBridgeConfig, CrudBridgeConfig } from './EventBridgeAbility';

// 兼容导出：EventBindingAbility 已废弃，由 system-abilities 的 EventAbility + DomEventsAbility 替代
// 保留文件以避免破坏性变更，但不再推荐使用
export { EventBindingAbility } from './EventBindingAbility';
