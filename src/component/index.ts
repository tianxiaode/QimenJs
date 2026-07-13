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
export { ButtonComponent } from './button/ButtonComponent';
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

// 事件枚举
export * from './events';

// 动画
export { animationsCSS } from './styles/animations';
