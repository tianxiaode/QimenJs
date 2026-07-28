/**
 * 组件 type 注册入口
 *
 * 提供 registerAllComponents() 方法，将所有基础组件注册到 TemplateRegistrar。
 * 采用 ExtJS 模式——基础组件全量注册，扩展组件按需注册。
 *
 * @example
 * ```typescript
 * import { registerAllComponents } from '@qimenjs/component';
 * registerAllComponents();
 * ```
 */

import { TemplateRegistrar } from '@qimenjs/component-core';
import { registerButtonTemplates } from './button/register';
import { registerDividerTemplates } from './divider/register';
import { registerSpacerTemplates } from './spacer/register';
import { registerBadgeTemplates } from './badge/register';
import { registerTextTemplates } from './text/register';
import { registerIconTemplates } from './icon/register';
import { registerTagTemplates } from './tag/register';
import { registerAvatarTemplates } from './avatar/register';
import { registerCardTemplates } from './card/register';
import { registerLoadingTemplates } from './loading/register';
import { registerProgressTemplates } from './progress/register';
import { registerAlertTemplates } from './alert/register';
import { registerHeroTemplates } from './hero/register';
import { registerToggleTemplates } from './toggle/register';
import { registerToggleIconTemplates } from './toggle-icon/register';
import { registerLabelTemplates } from './label/register';
import { registerIndicatorTemplates } from './indicator/register';
import { registerBreadcrumbTemplates } from './breadcrumb/register';
import { registerRatingTemplates } from './rating/register';
import { registerTipsTemplates } from './tips/register';
import { registerButtonGroupTemplates } from './button-group/register';
import { registerFieldsetTemplates } from './fieldset/register';
import { registerAccordionTemplates } from './accordion/register';
import { registerDialogTemplates } from './dialog/register';
import { registerPanelTemplates } from './panel/register';
import { registerHeaderTemplates } from './header/register';
import { registerToolbarTemplates } from './toolbar/register';
import { registerMenuTemplates } from './menu/register';
import { registerMenuItemTemplates } from './menu/register-item';
import { registerDropdownTemplates } from './dropdown/register';
import { registerTabsTemplates } from './tabs/register';
import { registerTabBarTemplates } from './tab-bar/register';
import { registerNavItemTemplates } from './nav/register';
import { registerSidebarTemplates } from './sidebar/register';
import { registerStepTemplates } from './step/register';
import { registerTimelineTemplates } from './timeline/register';
import { registerItemGroupTemplates } from './itemgroup/register';
import { registerOverflowTemplates } from './overflow/register';
import { registerOverflowScrollTemplates } from './overflow/register-scroll';
import { registerOverflowMenuTemplates } from './overflow/register-menu';
import { registerEntityToolbarTemplates } from './entity-toolbar/register';
import { registerFormFieldTemplates } from './form/register';
import { registerInputFieldBodyTemplates } from './form/register-input-field-body';
import { registerRadioGroupFieldBodyTemplates } from './form/register-radio-group-field-body';
import { registerCheckboxGroupFieldBodyTemplates } from './form/register-checkbox-group-field-body';
import { registerSwitchFieldBodyTemplates } from './form/register-switch-field-body';
import { registerTextareaFieldBodyTemplates } from './form/register-textarea-field-body';
import { registerDatePanelTemplates } from './date/register';
import { registerBaseHeaderCellTemplates } from './table/header/register';
import { registerBaseCellTemplates } from './table/cells/register';
import { registerRouteContainerTemplates } from './nav/register';

export function registerAllComponents(): void {
    registerButtonTemplates();
    registerDividerTemplates();
    registerSpacerTemplates();
    registerBadgeTemplates();
    registerTextTemplates();
    registerIconTemplates();
    registerTagTemplates();
    registerAvatarTemplates();
    registerCardTemplates();
    registerLoadingTemplates();
    registerProgressTemplates();
    registerAlertTemplates();
    registerHeroTemplates();
    registerToggleTemplates();
    registerToggleIconTemplates();
    registerLabelTemplates();
    registerIndicatorTemplates();
    registerBreadcrumbTemplates();
    registerRatingTemplates();
    registerTipsTemplates();
    registerButtonGroupTemplates();
    registerFieldsetTemplates();
    registerAccordionTemplates();
    registerDialogTemplates();
    registerPanelTemplates();
    registerHeaderTemplates();
    registerToolbarTemplates();
    registerMenuItemTemplates();
    registerMenuTemplates();
    registerDropdownTemplates();
    registerTabsTemplates();
    registerTabBarTemplates();
    registerNavItemTemplates();
    registerSidebarTemplates();
    registerStepTemplates();
    registerTimelineTemplates();
    registerItemGroupTemplates();
    registerOverflowScrollTemplates();
    registerOverflowMenuTemplates();
    registerEntityToolbarTemplates();
    registerFormFieldTemplates();
    registerInputFieldBodyTemplates();
    registerRadioGroupFieldBodyTemplates();
    registerCheckboxGroupFieldBodyTemplates();
    registerSwitchFieldBodyTemplates();
    registerTextareaFieldBodyTemplates();
    registerDatePanelTemplates();
    registerBaseHeaderCellTemplates();
    registerBaseCellTemplates();
    registerRouteContainerTemplates();
}
