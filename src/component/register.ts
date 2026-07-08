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
import { ButtonComponent } from './components/ButtonComponent';
import { InputComponent } from './components/InputComponent';
import { SelectComponent } from './components/SelectComponent';
import { IconComponent } from './components/IconComponent';
import { TextComponent } from './components/TextComponent';
import { HBoxComponent } from './components/HBoxComponent';
import { VBoxComponent } from './components/VBoxComponent';
import { GridComponent } from './components/GridComponent';
import { SpaceComponent } from './components/SpaceComponent';
import { ToolbarComponent } from './components/ToolbarComponent';
import { ButtonGroupComponent } from './components/ButtonGroupComponent';
import { SeparatorComponent } from './components/SeparatorComponent';
import { DialogComponent } from './components/DialogComponent';
import { FormComponent } from './components/FormComponent';
import { TableComponent } from './components/TableComponent';

const registrar = ComponentRegistrar.getInstance();

/**
 * 注册所有基础组件到 ComponentRegistrar
 *
 * 调用后，渲染器可通过 ComponentRegistrar.get(type) 获取组件类。
 * 应在应用启动时调用一次。
 */
export function registerAllComponents(): void {
    registrar.register('Button', ButtonComponent);
    registrar.register('Input', InputComponent);
    registrar.register('Select', SelectComponent);
    registrar.register('Icon', IconComponent);
    registrar.register('Text', TextComponent);
    registrar.register('HBox', HBoxComponent);
    registrar.register('VBox', VBoxComponent);
    registrar.register('Grid', GridComponent);
    registrar.register('Space', SpaceComponent);
    registrar.register('Toolbar', ToolbarComponent);
    registrar.register('ButtonGroup', ButtonGroupComponent);
    registrar.register('Separator', SeparatorComponent);
    registrar.register('Dialog', DialogComponent);
    registrar.register('Form', FormComponent);
    registrar.register('Table', TableComponent);
}
