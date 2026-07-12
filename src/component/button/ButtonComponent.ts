/**
 * ButtonComponent 按钮组件
 *
 * 独立组件，使用 withTemplate 模板创建。
 * 支持类型、尺寸、禁用状态等配置。
 *
 * 模板定义好后，setText 等方法由 withTemplate 自动生成。
 */

import { TemplateComponent } from '@qimenjs/component-core';
import { BUTTON_TEMPLATE } from '@qimenjs/component-core';

export let ButtonComponent = TemplateComponent.withTemplate(BUTTON_TEMPLATE);
ButtonComponent.prototype.type = 'button';
