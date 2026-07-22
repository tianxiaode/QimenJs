/**
 * 组件 type 注册入口
 *
 * 提供 registerAllComponents() 方法，将所有基础组件注册到 ComponentRegistrar。
 * 采用 ExtJS 模式——基础组件全量注册，扩展组件按需注册。
 *
 * @example
 * ```typescript
 * import { registerAllComponents } from '@qimenjs/component';
 * registerAllComponents();
 * ```
 */

import { ComponentRegistrar } from '@qimenjs/component-core';
import { IconComponent } from './icon/IconComponent';
import { AvatarComponent } from './avatar/AvatarComponent';
import { CardComponent } from './card/CardComponent';
import { IndicatorComponent } from './indicator/IndicatorComponent';
import { TabsComponent } from './tabs/TabsComponent';
import { TabBarComponent } from './tab-bar/TabBarComponent';
import { ButtonComponent } from './button/ButtonComponent';
import { DropdownComponent } from './dropdown/DropdownComponent';
import { BadgeComponent } from './badge/BadgeComponent';
import { TipsComponent } from './tips/TipsComponent';
import { MenuItemComponent } from './menu/MenuItemComponent';
import { MenuComponent } from './menu/MenuComponent';
import { PanelComponent } from './panel/PanelComponent';
import { HeaderComponent } from './header/HeaderComponent';
import { ItemGroupPooledComponent } from './itemgroup/ItemGroupPooledComponent';
import { NavItemComponent } from './nav/NavItemComponent';
import { NavItemGroupComponent } from './nav/NavItemGroupComponent';
import { ToggleComponent } from './toggle/ToggleComponent';
import { ToggleIconComponent } from './toggle-icon/ToggleIconComponent';
import { ButtonGroupComponent } from './button-group/ButtonGroupComponent';
import { OverflowScrollComponent } from './overflow/OverflowScrollComponent';
import { OverflowMenuComponent } from './overflow/OverflowMenuComponent';
import { AccordionComponent } from './accordion/AccordionComponent';
import { ToolbarComponent } from './toolbar/ToolbarComponent';
import { LoadingComponent } from './loading/LoadingComponent';
import { HeroComponent } from './hero/HeroComponent';
import { BreadcrumbComponent } from './breadcrumb/BreadcrumbComponent';
import { DividerComponent } from './divider/DividerComponent';
import { SpacerComponent } from './spacer/SpacerComponent';
import { TagComponent } from './tag/TagComponent';
import { AlertComponent } from './alert/AlertComponent';
import { ProgressComponent } from './progress/ProgressComponent';

const registrar = ComponentRegistrar.getInstance();

export function registerAllComponents(): void {
    registrar.register('Icon', IconComponent);
    registrar.register('Avatar', AvatarComponent);
    registrar.register('Card', CardComponent);
    registrar.register('Indicator', IndicatorComponent);
    registrar.register('Tabs', TabsComponent);
    registrar.register('TabBar', TabBarComponent);
    registrar.register('Button', ButtonComponent);
    registrar.register('Dropdown', DropdownComponent);
    registrar.register('Toggle', ToggleComponent);
    registrar.register('ToggleIcon', ToggleIconComponent);
    registrar.register('ButtonGroup', ButtonGroupComponent);
    registrar.register('Badge', BadgeComponent);
    registrar.register('Tips', TipsComponent);
    registrar.register('MenuItem', MenuItemComponent);
    registrar.register('Menu', MenuComponent);
    registrar.register('Panel', PanelComponent);
    registrar.register('Header', HeaderComponent);
    registrar.register('ItemGroup', ItemGroupPooledComponent);
    registrar.register('Toolbar', ToolbarComponent);
    registrar.register('NavItem', NavItemComponent);
    registrar.register('NavItemGroup', NavItemGroupComponent);
    registrar.register('OverflowScroll', OverflowScrollComponent);
    registrar.register('OverflowMenu', OverflowMenuComponent);
    registrar.register('Accordion', AccordionComponent);
    registrar.register('Loading', LoadingComponent);
    registrar.register('Hero', HeroComponent);
    registrar.register('Breadcrumb', BreadcrumbComponent);
    registrar.register('Divider', DividerComponent);
    registrar.register('Spacer', SpacerComponent);
    registrar.register('Tag', TagComponent);
    registrar.register('Alert', AlertComponent);
    registrar.register('Progress', ProgressComponent);
}
