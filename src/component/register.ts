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
import { DialogComponent } from './dialog/DialogComponent';
import { LoadingComponent } from './loading/LoadingComponent';
import { HeroComponent } from './hero/HeroComponent';
import { BreadcrumbComponent } from './breadcrumb/BreadcrumbComponent';
import { DividerComponent } from './divider/DividerComponent';
import { SpacerComponent } from './spacer/SpacerComponent';
import { TagComponent } from './tag/TagComponent';
import { AlertComponent } from './alert/AlertComponent';
import { ProgressComponent } from './progress/ProgressComponent';
import { InputComponent } from './form/InputComponent';
import { PasswordInputComponent } from './form/PasswordInputComponent';
import { TextComponent } from './text/TextComponent';
import { InputInfoGroupComponent } from './form/InputInfoGroupComponent';
import { FormComponent } from './form/FormComponent';
import { TextareaComponent } from './form/TextareaComponent';
import { NumberInputComponent } from './form/NumberInputComponent';
import { SelectComponent } from './form/SelectComponent';
import { SwitchComponent } from './form/SwitchComponent';
import { CheckboxGroupComponent } from './form/CheckboxGroupComponent';
import { RadioGroupComponent } from './form/RadioGroupComponent';
import { MarkdownEditorComponent } from '../markdown/MarkdownEditorComponent';
import { TextCellComponent } from './table/cells/TextCellComponent';
import { TreeCellComponent } from './table/cells/TreeCellComponent';
import { CheckboxCellComponent } from './table/cells/CheckboxCellComponent';
import { ActionCellComponent } from './table/cells/ActionCellComponent';

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
    registrar.register('Dialog', DialogComponent);
    registrar.register('Loading', LoadingComponent);
    registrar.register('Hero', HeroComponent);
    registrar.register('Breadcrumb', BreadcrumbComponent);
    registrar.register('Divider', DividerComponent);
    registrar.register('Spacer', SpacerComponent);
    registrar.register('Tag', TagComponent);
    registrar.register('Alert', AlertComponent);
    registrar.register('Progress', ProgressComponent);
    registrar.register('Input', InputComponent);
    registrar.register('PasswordInput', PasswordInputComponent);
    registrar.register('Text', TextComponent);
    registrar.register('InputInfoGroup', InputInfoGroupComponent);
    registrar.register('Form', FormComponent);
    registrar.register('Textarea', TextareaComponent);
    registrar.register('NumberInput', NumberInputComponent);
    registrar.register('Select', SelectComponent);
    registrar.register('Switch', SwitchComponent);
    registrar.register('CheckboxGroup', CheckboxGroupComponent);
    registrar.register('RadioGroup', RadioGroupComponent);
    registrar.register('MarkdownEditor', MarkdownEditorComponent);
    registrar.register('TextCell', TextCellComponent);
    registrar.register('TreeCell', TreeCellComponent);
    registrar.register('CheckboxCell', CheckboxCellComponent);
    registrar.register('ActionCell', ActionCellComponent);
}
