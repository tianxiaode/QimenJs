/**
 * @qimenjs/component
 *
 * UI 组件层 - ComponentBase + ComponentManager + ComponentRegistrar + 能力定义 + 组件
 */

// 核心类导出（从 component-core 重导出，保持向后兼容）
export { ComponentBase } from '@qimenjs/component-core';
export { ComponentManager, getCmp } from '@qimenjs/component-core';
export { ComponentRegistrar, type ComponentDefinition } from '@qimenjs/component-core';
export { ComponentEventRegistry } from '@qimenjs/component-core';

// 基础能力导出（从 component-core 重导出，保持向后兼容）
export { ThemeAbility, StyleAbility, EventBridgeAbility } from '@qimenjs/component-core';
export { mergePropAliases, applyPropAliases, initAbilitiesFromProps } from '@qimenjs/component-core';
export type { PropAliasMap, EventBridgeConfig, PaginationBridgeConfig, CrudBridgeConfig } from '@qimenjs/component-core';

// 能力定义导出（从 component-abilities 重导出，保持向后兼容）
export { TextAbility, VisibleAbility, DisableAbility, LoadingAbility, SizeAbility } from '@qimenjs/component-abilities';
export { ValueAbility, ValidateAbility, PlaceholderAbility, SubmitAbility, FieldSetAbility } from '@qimenjs/component-abilities';
export { EntityCoreAbility, EntityEmitAbility, EntityListenAbility, EntityAbility } from '@qimenjs/component-abilities';
export { EntityLocalReadonlyAbility, EntityLocalCrudAbility, EntityRemoteReadonlyAbility, EntityRemoteCrudAbility, EntityRemoteTreeAbility } from '@qimenjs/component-abilities';
export { SelectionAbility, SelectableAbility } from '@qimenjs/component-abilities';
export { ChildrenAbility } from '@qimenjs/component-abilities';
export { RenderAbility, VirtualListAbility, OverlayAbility, AnimationAbility } from '@qimenjs/component-abilities';
export { ClickAbility, OptionsAbility, SearchAbility, SortAbility, OpenableAbility, LayoutAbility } from '@qimenjs/component-abilities';
export { ColumnAbility, ColumnManageAbility } from '@qimenjs/component-abilities';
export type { ColumnDefinition } from '@qimenjs/component-abilities';
export { ToolbarAbility, PaginationAbility, PAGINATION_POSITIONS, CrudAbility, CRUD_POSITIONS } from '@qimenjs/component-abilities';
export { EventBindingAbility } from '@qimenjs/component-abilities';

// 浮层与模板
export { OverlayRoot } from './OverlayRoot';
export { HiddenRoot } from './HiddenRoot';
export { ZIndexLevel, nextZIndex, releaseZIndex } from './z-index';
export { TemplateRegistry } from './TemplateRegistry';

// i18n 桥接
export { I18nEventBridge, type I18nEventBridgeConfig } from './I18nEventBridge';

// 基础组件
export { ButtonComponent } from './components/ButtonComponent';
export { InputComponent } from './components/InputComponent';
export { SelectComponent } from './components/SelectComponent';

// 布局组件
export { HBoxComponent } from './components/HBoxComponent';
export { VBoxComponent } from './components/VBoxComponent';
export { GridComponent } from './components/GridComponent';
export { SpaceComponent } from './components/SpaceComponent';

// 工具栏组件
export { ToolbarComponent } from './components/ToolbarComponent';
export { ButtonGroupComponent } from './components/ButtonGroupComponent';
export { SeparatorComponent } from './components/SeparatorComponent';

// 高级组件
export { TableComponent } from './components/TableComponent';
export { FormComponent } from './components/FormComponent';
export { DialogComponent } from './components/DialogComponent';

// 列与单元格基类
export { ColumnBase } from './components/ColumnBase';
export { CellBase } from './components/CellBase';

// 派生列
export { NumberColumn } from './components/NumberColumn';
export { IdColumn } from './components/IdColumn';
export { CheckboxColumn } from './components/CheckboxColumn';

// 事件枚举
export * from './events';

// 动画
export { animationsCSS } from './styles/animations';
