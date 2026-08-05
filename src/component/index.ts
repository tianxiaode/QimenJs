/**
 * @qimenjs/component
 *
 * UI 组件层 - 组件定义 + 浮层 + z-index + 组件注册
 */

// 浮层与模板

export { ZIndexLevel, nextZIndex, releaseZIndex } from './z-index';

// 孤儿组件注册触发（无自然 import 链，显式 import 触发底部 register/useTemplate 副作用）
import './text/TextComponent';
import './text/HrefComponent';
import './date/DayGridComponent';
import './table/header/BaseHeaderCellComponent';
import './table/cells/BaseCellComponent';

// 基础组件
export { IconComponent } from './icon/IconComponent';
export { iconCSS } from './icon/icon.css';
export { AvatarComponent, type AvatarProps } from './avatar/AvatarComponent';
export { avatarCSS } from './avatar/avatar.css';
export { CardComponent, type CardProps } from './card/CardComponent';
export { cardCSS } from './card/card.css';
export {
    IndicatorComponent,
    type IndicatorProps,
    type IndicatorMode,
} from './indicator/IndicatorComponent';
export { IndicatorDotComponent } from './indicator/IndicatorDotComponent';
export { indicatorCSS } from './indicator/indicator.css';

// Tabs 标签页组件（Tab + TabBar + Tabs）
export { TabComponent, type TabProps } from './tabs/TabComponent';
export { TabBarComponent, type TabBarProps, type TabBarPosition } from './tabs/TabBarComponent';
export { TabsComponent, type TabPaneItem, type TabsProps } from './tabs/TabsComponent';
export { tabsCSS } from './tabs/tabs.css';

export { ButtonComponent } from './button/ButtonComponent';
export { buttonCSS } from './button/button.css';
export { DropdownComponent } from './dropdown/DropdownComponent';
export { ToggleComponent, type ToggleProps } from './toggle/ToggleComponent';
export { toggleCSS } from './toggle/toggle.css';
export { ToggleIconComponent, type ToggleIconProps } from './toggle-icon/ToggleIconComponent';
export { toggleIconCSS } from './toggle-icon/toggle-icon.css';
export {
    ButtonGroupComponent,
    type ButtonGroupMode,
    type ButtonGroupProps,
} from './button-group/ButtonGroupComponent';
export { buttonGroupCSS } from './button-group/button-group.css';
export { BadgeComponent } from './badge/BadgeComponent';
export { badgeCSS } from './badge/badge.css';
export { TooltipComponent, type TooltipProps } from './tooltip/TooltipComponent';
export { tooltipCSS } from './tooltip/tooltip.css';
export { AlertComponent, type AlertType, type AlertProps } from './alert/AlertComponent';
export { alertCSS } from './alert/alert.css';
export {
    BreadcrumbComponent,
    type BreadcrumbItem,
    type BreadcrumbProps,
} from './breadcrumb/BreadcrumbComponent';
export { breadcrumbCSS } from './breadcrumb/breadcrumb.css';
export { DividerComponent, type DividerProps } from './divider/DividerComponent';
export { dividerCSS } from './divider/divider.css';
export { HeroComponent, type HeroProps } from './hero/HeroComponent';
export { heroCSS } from './hero/hero.css';
export {
    ProgressComponent,
    type ProgressType,
    type ProgressProps,
} from './progress/ProgressComponent';
export { progressCSS } from './progress/progress.css';
export { SpacerComponent, type SpacerProps } from './spacer/SpacerComponent';
export { spacerCSS } from './spacer/spacer.css';
export { TagComponent, type TagType, type TagProps } from './tag/TagComponent';
export { tagCSS } from './tag/tag.css';

// Tags 标签组组件（从 ItemGroupPooledComponent 派生，maxCount 折叠 + close 代理）
export { TagsComponent, type TagsProps } from './tags/TagsComponent';
export { tagsCSS } from './tags/tags.css';

// 表单组件
export { InputComponent, type InputType, type InputProps } from './form/InputComponent';
export { inputCSS } from './form/input.css';
export { InputFieldBodyComponent } from './form/InputFieldBodyComponent';
export { type LabelPosition } from './form/FormFieldComponent';
export {
    PasswordInputComponent,
    type PasswordStrength,
    type PasswordInputProps,
} from './form/PasswordInputComponent';
export { passwordCSS } from './form/password.css';

// 菜单组件
export { MenuItemComponent, type MenuItemProps } from './menu/MenuItemComponent';
export { MenuComponent, type MenuProps } from './menu/MenuComponent';
export { menuCSS } from './menu/menu.css';

// 面板组件
export { PanelComponent, type PanelProps } from './panel/PanelComponent';
export { panelCSS } from './panel/panel.css';

// 手风琴组件
export {
    AccordionComponent,
    type AccordionMode,
    type AccordionProps,
} from './accordion/AccordionComponent';
export { accordionCSS } from './accordion/accordion.css';

// 头部组件
export { HeaderComponent } from './header/HeaderComponent';
export { headerCSS } from './header/header.css';

// 对话框组件
export { DialogComponent, type DialogProps } from './dialog/DialogComponent';
export { dialogCSS } from './dialog/dialog.css';

// 项组组件
export { ItemGroupPooledComponent } from './itemgroup/ItemGroupPooledComponent';
export type { ItemGroupProps } from './itemgroup/ItemGroupBaseComponent';
export { ItemGroupStaticComponent } from './itemgroup/ItemGroupStaticComponent';
export { itemgroupCSS } from './itemgroup/itemgroup.css';

// 工具栏组件
export { ToolbarComponent, type ToolbarProps } from './toolbar/ToolbarComponent';
export { toolbarCSS } from './toolbar/toolbar.css';

// 实体工具栏组件（从 ToolbarComponent 派生，声明式 pagination/crud + 实体事件监听）
export {
    EntityToolbarComponent,
    type EntityToolbarProps,
    type EntityToolbarItemDef,
    type EntityToolbarState,
    type EntityToolbarItemState,
    createPaginationItems,
    createCrudItems,
    PAGINATION_ITEM_NAMES,
    CRUD_ITEM_NAMES,
    type PaginationItemsOptions,
} from './entity-toolbar';

// 导航组件
export {
    NavItemComponent,
    type NavItemProps,
    type NavOverlayOptions,
    type NavPlacement,
} from './nav/NavItemComponent';
export { NavComponent } from './nav/NavComponent';

export { RouteContainerComponent, type RouteContainerProps } from './nav/RouteContainerComponent';
export { navCSS } from './nav/nav.css';

// 树导航组件
export { TreeNavComponent, type TreeNavProps } from './treenav/TreeNavComponent';
export { TreeNavItemComponent, type TreeNavItemProps } from './treenav/TreeNavItemComponent';
export { treeNavCSS } from './treenav/tree-nav.css';

// 加载组件
export { LoadingComponent } from './loading/LoadingComponent';

// 事件枚举
export {
    COMPONENT_LIFECYCLE_EVENTS,
    PAGINATION_EVENTS,
    CRUD_EVENTS,
    CRUD_ACTIONS,
    SELECTION_EVENTS,
    CHILDREN_EVENTS,
    COLUMN_EVENTS,
    SEARCH_EVENTS,
    TOOLBAR_EVENTS,
    TABLE_EVENTS,
    FORM_EVENTS,
} from '@qimenjs/events';

// Markdown 组件
export {
    MarkdownEditorComponent,
    type MarkdownEditorProps,
    type MarkdownEditMode,
    type MarkdownShortcutAction,
    type ShortcutContext,
} from '../markdown/MarkdownEditorComponent';
export { MarkdownEditorFieldBodyComponent } from '../markdown/MarkdownEditorFieldBodyComponent';
export { markdownEditorCSS } from '../markdown/markdown-editor.css';
export { markdownViewerCSS } from '../markdown/markdown-viewer.css';

// Label 组件
export { LabelComponent, type LabelProps } from './label/LabelComponent';
export { labelCSS } from './label/label.css';

// Rating 组件
export { RatingComponent, type RatingProps } from './rating/RatingComponent';
export { ratingCSS } from './rating/rating.css';

// Fieldset 组件
export { FieldsetComponent, type FieldsetProps } from './fieldset/FieldsetComponent';
export { fieldsetCSS } from './fieldset/fieldset.css';

// OneTimePassword 组件
export {
    OneTimePasswordComponent,
    ONE_TIME_PASSWORD_TPL,
    type OneTimePasswordProps,
    type OneTimePasswordComponentInstance,
} from './one-time-password';
export { oneTimePasswordCSS } from './one-time-password/one-time-password.css';

// UploadButton 上传按钮组件（文件选择与上传）
export * from './button/UploadButtonComponent';
export { uploadButtonCSS } from './button/upload-button.css';

// Step 步骤条组件（池化 ItemGroup + StepItem 子项）
export {
    StepComponent,
    type StepStatus,
    type StepItemProps,
    type StepProps,
} from './step/StepComponent';
export { StepItemComponent } from './step/StepItemComponent';
export { stepCSS } from './step/step.css';

// Timeline 时间线组件（从 ItemGroupPooledComponent 派生，纵向节点序列）
export {
    TimelineComponent,
    type TimelineColor,
    type TimelineItem,
    type TimelineProps,
} from './timeline/TimelineComponent';
export { TimelineItemComponent, type TimelineItemProps } from './timeline/TimelineItemComponent';
export { timelineCSS } from './timeline/timeline.css';

// Navbar 顶部导航栏组件（从 ItemGroupStaticComponent 派生，横向布局）
export { NavbarComponent, type NavbarProps } from './navbar/NavbarComponent';
export { navbarCSS } from './navbar/navbar.css';

// Href 超链接文本组件（<a> 封装，navigate 事件 + router 转发）
export { HrefComponent, type HrefTarget, type HrefProps } from './text/HrefComponent';
export { hrefCSS } from './text/href.css';
