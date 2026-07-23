/**
 * @qimenjs/component
 *
 * UI 组件层 - 组件定义 + 浮层 + z-index + 组件注册
 */

// 浮层与模板

export { ZIndexLevel, nextZIndex, releaseZIndex } from './z-index';

// 组件 type 注册
export { registerAllComponents } from './register';

// 基础组件
export { IconComponent } from './icon/IconComponent';
export { iconCSS } from './icon/icon.css';
export { AvatarComponent, type AvatarProps } from './avatar/AvatarComponent';
export { avatarCSS } from './avatar/avatar.css';
export { CardComponent, type CardProps } from './card/CardComponent';
export { cardCSS } from './card/card.css';
export {
    IndicatorComponent,
    type IndicatorType,
    type IndicatorProps,
} from './indicator/IndicatorComponent';
export { indicatorCSS } from './indicator/indicator.css';
export { TabBarComponent, type TabBarProps } from './tab-bar/TabBarComponent';
export { tabBarCSS } from './tab-bar/tab-bar.css';
export { TabsComponent, type TabItem, type TabsProps } from './tabs/TabsComponent';
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
export { TipsComponent, type TipsProps } from './tips/TipsComponent';
export { tipsCSS } from './tips/tips.css';
export { AlertComponent, type AlertType, type AlertProps } from './alert/AlertComponent';
export { alertCSS } from './alert/alert.css';
export { BreadcrumbComponent, type BreadcrumbItem, type BreadcrumbProps } from './breadcrumb/BreadcrumbComponent';
export { breadcrumbCSS } from './breadcrumb/breadcrumb.css';
export { DividerComponent, type DividerProps } from './divider/DividerComponent';
export { dividerCSS } from './divider/divider.css';
export { HeroComponent, type HeroProps } from './hero/HeroComponent';
export { heroCSS } from './hero/hero.css';
export { ProgressComponent, type ProgressType, type ProgressProps } from './progress/ProgressComponent';
export { progressCSS } from './progress/progress.css';
export { SpacerComponent, type SpacerProps } from './spacer/SpacerComponent';
export { spacerCSS } from './spacer/spacer.css';
export { TagComponent, type TagType, type TagProps } from './tag/TagComponent';
export { tagCSS } from './tag/tag.css';

// 表单组件
export { InputComponent, type InputType, type LabelPosition, type InputProps } from './form/InputComponent';
export { inputCSS } from './form/input.css';
export { PasswordInputComponent, type PasswordStrength, type PasswordInputProps } from './form/PasswordInputComponent';
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

// 项组组件
export { ItemGroupPooledComponent } from './itemgroup/ItemGroupPooledComponent';
export type { ItemGroupProps } from './itemgroup/ItemGroupBaseComponent';
export { ItemGroupStaticComponent } from './itemgroup/ItemGroupStaticComponent';
export { itemgroupCSS } from './itemgroup/itemgroup.css';

// 工具栏组件
export { ToolbarComponent, type ToolbarProps } from './toolbar/ToolbarComponent';
export { toolbarCSS } from './toolbar/toolbar.css';

// 导航组件
export {
    NavItemComponent,
    type NavItemProps,
    type NavOverlayOptions,
    type NavPlacement,
} from './nav/NavItemComponent';
export { NavItemGroupComponent, type NavItemGroupProps } from './nav/NavItemGroupComponent';
export { RouteNavComponent, type RouteNavProps } from './nav/RouteNavComponent';
export { RouteContainerComponent, type RouteContainerProps } from './nav/RouteContainerComponent';
export { navCSS } from './nav/nav.css';

// 溢出组件
export { OverflowMenuComponent, type OverflowDirection as OverflowMenuDirection, type OverflowMenuItem, type OverflowMenuProps } from './overflow/OverflowMenuComponent';
export { OverflowScrollComponent, type OverflowDirection as OverflowScrollDirection, type OverflowState, type OverflowScrollProps } from './overflow/OverflowScrollComponent';
export { overflowCSS } from './overflow/overflow.css';

// 加载组件
export { LoadingComponent } from './loading/LoadingComponent';

// 事件枚举
export * from './events';

// 动画
export { animationsCSS } from './styles/animations';
