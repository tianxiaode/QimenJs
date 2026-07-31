/**
 * 组件注册入口
 *
 * 通过静态 import 触发组件模块的副作用注册（每个组件文件末尾的 useTemplate() 调用）。
 * 导入本文件即自动完成所有组件的模板注册。
 *
 * 采用 ExtJS 模式——基础组件全量注册，扩展组件按需注册。
 *
 * @example
 * ```typescript
 * // 方式一：导入即注册（推荐）
 * import '@qimenjs/component/register';
 *
 * // 方式二：兼容旧 API（无操作，已通过导入完成注册）
 * import { registerAllComponents } from '@qimenjs/component';
 * registerAllComponents();
 * ```
 */

// 每个组件模块加载时自动调用 useTemplate() 完成注册
import './button/ButtonComponent';
import './divider/DividerComponent';
import './spacer/SpacerComponent';
import './badge/BadgeComponent';
import './text/TextComponent';
import './icon/IconComponent';
import './tag/TagComponent';
import './avatar/AvatarComponent';
import './card/CardComponent';
import './loading/LoadingComponent';
import './progress/ProgressComponent';
import './alert/AlertComponent';
import './hero/HeroComponent';
import './toggle/ToggleComponent';
import './toggle-icon/ToggleIconComponent';
import './label/LabelComponent';
import './indicator/IndicatorComponent';
import './indicator/IndicatorDotComponent';
import './breadcrumb/BreadcrumbComponent';
import './rating/RatingComponent';
import './tooltip/TooltipComponent';
import './button-group/ButtonGroupComponent';
import './fieldset/FieldsetComponent';
import './accordion/AccordionComponent';
import './dialog/DialogComponent';
import './panel/PanelComponent';
import './header/HeaderComponent';
import './toolbar/ToolbarComponent';
import './menu/MenuComponent';
import './menu/MenuItemComponent';
import './dropdown/DropdownComponent';
import './tabs/TabsComponent';
import './tab-bar/TabBarComponent';
import './nav/NavComponent';
import './nav/NavItemComponent';
import './nav/RouteContainerComponent';
import './sidebar/SidebarComponent';
import './step/StepComponent';
import './timeline/TimelineComponent';
import './itemgroup/ItemGroupBaseComponent';
import './itemgroup/ItemGroupPooledComponent';
import './itemgroup/ItemGroupStaticComponent';
import './overflow/OverflowScrollComponent';
import './overflow/OverflowMenuComponent';
import './entity-toolbar/EntityToolbarComponent';
import './form/FormFieldComponent';
import './form/InputFieldBodyComponent';
import './form/CheckboxGroupFieldBodyComponent';
import './form/RadioGroupFieldBodyComponent';
import './form/SwitchFieldBodyComponent';
import './form/TextareaFieldBodyComponent';
import './date/YearPanelComponent';
import './date/MonthPanelComponent';
import './date/DayGridComponent';
import './date/DatePanelComponent';
import './date/HourPanelComponent';
import './date/MinutePanelComponent';
import './date/SecondPanelComponent';
import './treenav/TreeNavComponent';
import './treenav/TreeNavItemComponent';
import './table/header/BaseHeaderCellComponent';
import './table/cells/BaseCellComponent';

/**
 * 兼容旧 API — 注册已通过模块导入副作用完成，此函数为空操作。
 * 保留以确保现有代码无需修改。
 */
export function registerAllComponents(): void {
    // no-op: 上方 import 已触发所有组件的 useTemplate() 注册
}