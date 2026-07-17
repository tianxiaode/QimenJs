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
import { ButtonComponent } from './button/ButtonComponent';
import { BadgeComponent } from './badge/BadgeComponent';
import { TipsComponent } from './tips/TipsComponent';
import { MenuItemComponent } from './menu/MenuItemComponent';
import { MenuComponent } from './menu/MenuComponent';
import { PanelComponent } from './panel/PanelComponent';
import { HeaderComponent } from './header/HeaderComponent';
import { ItemGroupComponent } from './itemgroup/ItemGroupComponent';
import { NavItemComponent } from './nav/NavItemComponent';
import { NavItemGroupComponent } from './nav/NavItemGroupComponent';

const registrar = ComponentRegistrar.getInstance();

export function registerAllComponents(): void {
    registrar.register('Icon', IconComponent);
    registrar.register('Button', ButtonComponent);
    registrar.register('Badge', BadgeComponent);
    registrar.register('Tips', TipsComponent);
    registrar.register('MenuItem', MenuItemComponent);
    registrar.register('Menu', MenuComponent);
    registrar.register('Panel', PanelComponent);
    registrar.register('Header', HeaderComponent);
    registrar.register('ItemGroup', ItemGroupComponent);
    registrar.register('Toolbar', ItemGroupComponent);
    registrar.register('NavItem', NavItemComponent);
    registrar.register('NavItemGroup', NavItemGroupComponent);
}
