/**
 * @qimenjs/component
 *
 * UI 组件层 - 组件定义 + 浮层 + z-index + 组件注册
 */

// 浮层与模板

// 孤儿组件注册触发（无自然 import 链，显式 import 触发底部 register/useTemplate 副作用）
import './text/TextComponent';
import './text/HrefComponent';
import './date/DayGridComponent';
import './table/header/BaseHeaderCellComponent';
import './table/cells/BaseCellComponent';

// 基础组件
export { IconComponent } from './icon/IconComponent';
export { AvatarComponent } from './avatar/AvatarComponent';
export { CardComponent } from './card/CardComponent';

// Tabs 标签页组件（Tab + TabBar + Tabs）
export { TabComponent } from './tabs/TabComponent';
export { TabBarComponent } from './tabs/TabBarComponent';
export { TabsComponent } from './tabs/TabsComponent';

export * from './button';
export { DropdownComponent } from './dropdown/DropdownComponent';
export { ToggleComponent } from './toggle/ToggleComponent';
export { ToggleIconComponent } from './toggle-icon/ToggleIconComponent';
export { ButtonGroupComponent } from './button-group/ButtonGroupComponent';
export { AlertComponent } from './alert/AlertComponent';
export { BreadcrumbComponent } from './breadcrumb/BreadcrumbComponent';
export { DividerComponent } from './divider/DividerComponent';
export { HeroComponent } from './hero/HeroComponent';
export { ProgressComponent } from './progress/ProgressComponent';
export { SpacerComponent } from './spacer/SpacerComponent';
export { TagComponent } from './tag/TagComponent';

// Tags 标签组组件（从 ItemGroupPooledComponent 派生，maxCount 折叠 + close 代理）
export { TagsComponent } from './tags/TagsComponent';

// 表单组件
export { InputComponent } from './form/InputComponent';
export { InputFieldBodyComponent } from './form/InputFieldBodyComponent';
export { PasswordInputComponent } from './form/PasswordInputComponent';
export { PasswordStrengthComponent } from './form/PasswordStrengthComponent';

// 菜单组件
export { MenuItemComponent } from './menu/MenuItemComponent';
export { MenuComponent } from './menu/MenuComponent';

// 面板组件
export { PanelComponent } from './panel/PanelComponent';

// 手风琴组件
export { AccordionComponent } from './accordion/AccordionComponent';

// 头部组件
export { HeaderComponent } from './header/HeaderComponent';

// 对话框组件
export { DialogComponent } from './dialog/DialogComponent';

// 项组组件
export { ItemGroupPooledComponent } from './itemgroup/ItemGroupPooledComponent';
export type { ItemGroupProps } from './itemgroup/ItemGroupBaseComponent';
export { ItemGroupStaticComponent } from './itemgroup/ItemGroupStaticComponent';

// 工具栏组件
export { ToolbarComponent } from './toolbar/ToolbarComponent';

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
export { NavItemComponent } from './nav/NavItemComponent';
export { NavComponent } from './nav/NavComponent';

export { RouteContainerComponent } from './nav/RouteContainerComponent';

// 树导航组件
export { TreeNavComponent } from './treenav/TreeNavComponent';
export { TreeNavItemComponent } from './treenav/TreeNavItemComponent';

// Markdown 组件（暂不导出，useTemplate 重构中）
// export { MarkdownEditorComponent } from '../markdown/MarkdownEditorComponent';
// export { MarkdownEditorFieldBodyComponent } from '../markdown/MarkdownEditorFieldBodyComponent';

// Label 组件
export { LabelComponent } from './label/LabelComponent';

// Fieldset 组件
export { FieldsetComponent } from './fieldset/FieldsetComponent';

// UploadButton 上传按钮组件（文件选择与上传）
export * from './button/UploadButtonComponent';

// Navbar 顶部导航栏组件（从 ItemGroupStaticComponent 派生，横向布局）
export { NavbarComponent } from './navbar/NavbarComponent';

// Href 超链接文本组件（<a> 封装，navigate 事件 + router 转发）
export { HrefComponent } from './text/HrefComponent';
