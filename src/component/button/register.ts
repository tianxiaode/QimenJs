/**
 * Button 模板注册 — 将模板注册到 TemplateRegistrar
 *
 * 应用启动时调用 registerButtonTemplates()。
 */

import { TemplateRegistrar } from '@/component-core/engine/TemplateRegistrar';
import { BUTTON_TPL } from './button-tpl';

export function registerButtonTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('Button', BUTTON_TPL);
}
