/**
 * @qimenjs/component-abilities
 *
 * UI 组件能力定义 - 提供可组合的 UI 能力，供组件和扩展包按需引用。
 * 与 @qimenjs/composable 的 AbilityDefinition 配合使用。
 */

// 属性别名与初始化协议（从 component-core 重导出，保持向后兼容）
export { mergePropAliases, applyPropAliases, initAbilitiesFromProps } from '@qimenjs/component-core';
export type { PropAliasMap } from '@qimenjs/component-core';

// 基础能力（从 component-core 重导出，保持向后兼容）
export { ThemeAbility } from '@qimenjs/component-core';
export { StyleAbility } from '@qimenjs/component-core';
export { EventBridgeAbility } from '@qimenjs/component-core';
export type { EventBridgeConfig, PaginationBridgeConfig, CrudBridgeConfig, SearchBridgeConfig } from '@qimenjs/component-core';

// 通用 UI 能力
export { PlaceholderAbility } from './ui';
export { VisibleAbility } from './ui';
export { DisableAbility } from './ui';
export { LoadingAbility } from './ui';
export { SizeAbility } from './ui';

// 内容管理
export { ContentAbility, type ContentSlotsDecl } from './content';
export { createContentManager, I18N_PREFIX } from './content';
export type { ContentManagerConfig } from './content';
export { ContentPrefix, OVERLAY_PREFIXES, type ContentPrefixType } from './content';
export { createOverlayManager } from './content';
export type { OverlayManagerConfig, OverlayManagerResult } from './content';
export { positionOverlay, type Placement } from './content';

// 数据能力
export { ValueAbility } from './data';
export { ValidateAbility } from './data';
export { SubmitAbility } from './data';
export { FieldSetAbility } from './data';

// 实体管理能力
export { EntityCoreAbility } from './entity';
export { EntityEmitAbility } from './entity';
export { EntityListenAbility } from './entity';
export { EntityAbility } from './entity';

// 按 manager 类型分类的实体能力
export { EntityLocalReadonlyAbility } from './entity';
export { EntityLocalCrudAbility } from './entity';
export { EntityRemoteReadonlyAbility } from './entity';
export { EntityRemoteCrudAbility } from './entity';
export { EntityRemoteTreeAbility } from './entity';

// 选择能力
export { SelectionAbility } from './selection';
export { SelectableAbility } from './selection';

// 子组件管理能力
export { ChildrenAbility } from './children';

// 渲染能力
export { VirtualListAbility } from './render';
export { OverlayAbility } from './render';
export { AnimationAbility } from './render';

// 交互能力
export { ClickAbility } from './interaction';
export { OptionsAbility } from './interaction';
/** @deprecated 请使用 toolbar/SearchAbility */
export { SearchAbility } from './interaction';
export { SortAbility } from './interaction';
export { OpenableAbility } from './interaction';
export { LayoutAbility } from './interaction';

// 列能力
export { ColumnAbility } from './column';
export type { ColumnDefinition } from './column';
export { ColumnManageAbility } from './column';

// 工具栏能力
export { ToolbarAbility } from './toolbar';
export { PaginationAbility, PAGINATION_POSITIONS } from './toolbar';
export { CrudAbility, CRUD_POSITIONS } from './toolbar';
export { SearchAbility as ToolbarSearchAbility, SEARCH_POSITIONS } from './toolbar';

// 兼容导出：EventBindingAbility 已废弃，由 system-abilities 的 EventAbility + DomEventsAbility 替代
export { EventBindingAbility } from './event';
