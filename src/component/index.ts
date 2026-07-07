/**
 * @qimenjs/component
 *
 * UI 组件层 - ComponentBase + ComponentManager + ComponentRegistrar + 能力定义 + 组件
 */

// 核心类导出
export { ComponentBase } from './ComponentBase';
export { ComponentManager, getCmp } from './ComponentManager';
export { ComponentRegistrar, type ComponentDefinition } from './ComponentRegistrar';

// 能力定义导出
export * from './abilities';

// 浮层与模板
export { OverlayRoot } from './OverlayRoot';
export { HiddenRoot } from './HiddenRoot';
export { ZIndexLevel, nextZIndex, releaseZIndex } from './z-index';
export { TemplateRegistry } from './TemplateRegistry';

// i18n 桥接
export { I18nEventBridge, type I18nEventBridgeConfig } from './I18nEventBridge';

// 事件注册
export { ComponentEventRegistry } from './ComponentEventRegistry';

// 基础组件
export { ButtonComponent } from './components/ButtonComponent';
export { InputComponent } from './components/InputComponent';
export { SelectComponent } from './components/SelectComponent';

// 布局组件
export { HBoxComponent } from './components/HBoxComponent';
export { VBoxComponent } from './components/VBoxComponent';
export { GridComponent } from './components/GridComponent';
export { SpaceComponent } from './components/SpaceComponent';

// 工具栏组件
export { ToolbarComponent } from './components/ToolbarComponent';
export { ButtonGroupComponent } from './components/ButtonGroupComponent';
export { SeparatorComponent } from './components/SeparatorComponent';

// 高级组件
export { TableComponent } from './components/TableComponent';
export { FormComponent } from './components/FormComponent';
export { DialogComponent } from './components/DialogComponent';

// 列与单元格基类
export { ColumnBase } from './components/ColumnBase';
export { CellBase } from './components/CellBase';

// 派生列
export { NumberColumn } from './components/NumberColumn';
export { IdColumn } from './components/IdColumn';
export { CheckboxColumn } from './components/CheckboxColumn';

// 动画
export { animationsCSS } from './styles/animations';
