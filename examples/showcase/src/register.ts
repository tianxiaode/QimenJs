/**
 * showcase 组件注册入口
 *
 * component-core 包内组件通过集中注册入口完成注册，
 * component 包内组件按需 import 并显式注册。
 *
 * !! 规则：showcase 新增组件用法时，必须在此文件补充对应注册，
 * 否则 `type: 'xxx'` 无法解析。使用深路径导入，避免全量打包。
 */

// component-core 全部组件集中注册
import '@qimenjs/component-core/register';

// component 包组件按需注册（深路径导入，避免全量打包）
import {
    ButtonComponent,
    ButtonGroupComponent,
    CardComponent,
    AvatarComponent,
    NavbarComponent,
    HrefComponent,
    TextComponent,
    HeroComponent,
    TagComponent,
    DropdownComponent,
    MenuComponent,
    MenuItemComponent,
    MultiMenuComponent,
    ToggleComponent,
    RouteContainerComponent,
    DividerComponent,
    HtmlComponent,
    IconComponent,
    LabelComponent,
    FieldsetComponent,
    HeaderComponent,
    PanelComponent,
    TabComponent,
    TabBarComponent,
    TabsComponent,
    BreadcrumbComponent,
    NavItemComponent,
    NavComponent,
    TreeNavComponent,
    TreeNavItemComponent,
    AlertComponent,
    AccordionComponent,
    ListComponent,
    ListItemComponent,
    ProgressComponent,
    StatisticComponent,
    TableComponent,
} from '@qimenjs/component';
ButtonComponent.register();
ButtonGroupComponent.register();
CardComponent.register();
AvatarComponent.register();
NavbarComponent.register();
HrefComponent.register();
TextComponent.register();
HeroComponent.register();
TagComponent.register();
DropdownComponent.register();
MenuComponent.register();
MenuItemComponent.register();
MultiMenuComponent.register();
ToggleComponent.register();
RouteContainerComponent.register();
DividerComponent.register();
HtmlComponent.register();
IconComponent.register();
LabelComponent.register();
TextComponent.register();
FieldsetComponent.register();
HeaderComponent.register();
PanelComponent.register();
TabComponent.register();
TabBarComponent.register();
TabsComponent.register();
BreadcrumbComponent.register();
NavItemComponent.register();
NavComponent.register();
TreeNavComponent.register();
TreeNavItemComponent.register();
AlertComponent.register();
AccordionComponent.register();
ListComponent.register();
ListItemComponent.register();
ProgressComponent.register();
StatisticComponent.register();
TableComponent.register();
