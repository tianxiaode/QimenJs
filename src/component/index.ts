/**
 * @qimenjs/component
 *
 * UI 组件层 - 组件定义 + 浮层 + z-index + 组件注册
 */

// 浮层与模板
export { OverlayRoot } from './OverlayRoot';
export { ZIndexLevel, nextZIndex, releaseZIndex } from './z-index';

// 组件 type 注册
export { registerAllComponents } from './register';

// 基础组件
export { IconComponent } from './icon/IconComponent';
export { iconCSS } from './icon/icon.css';
export { ButtonComponent } from './button/ButtonComponent';
export { buttonCSS } from './button/button.css';
export { BadgeComponent } from './badge/BadgeComponent';
export { badgeCSS } from './badge/badge.css';
export { TipsComponent, type TipsProps } from './tips/TipsComponent';
export { tipsCSS } from './tips/tips.css';

// 工具栏组件
export { ToolbarComponent, type OverflowMode } from './toolbar/ToolbarComponent';
export { toolbarCSS } from './toolbar/toolbar.css';

// 菜单组件
export { MenuItemComponent, type MenuItemProps } from './menu/MenuItemComponent';
export { MenuComponent, type MenuProps } from './menu/MenuComponent';
export { menuCSS } from './menu/menu.css';

// 面板组件
export { PanelComponent, type PanelProps } from './panel/PanelComponent';

// 头部组件
export { HeaderComponent } from './header/HeaderComponent';
export { headerCSS } from './header/header.css';

// 项组组件
export { ItemGroupComponent, type ItemGroupProps } from './itemgroup/ItemGroupComponent';
export { itemgroupCSS } from './itemgroup/itemgroup.css';

// 导航组件
export { NavItemComponent, type NavItemProps, type NavOverlayOptions, type NavPlacement } from './nav/NavItemComponent';
export { NavItemGroupComponent, type NavItemGroupProps } from './nav/NavItemGroupComponent';
export { RouteNavComponent, type RouteNavProps } from './nav/RouteNavComponent';
export { RouteContainerComponent, type RouteContainerProps } from './nav/RouteContainerComponent';
export { navCSS } from './nav/nav.css';

// 事件枚举
export * from './events';

// 动画
export { animationsCSS } from './styles/animations';
