/**
 * FormField 模板注册 — 将模板注册到 TemplateRegistrar
 *
 * 应用启动时调用 registerFormFieldTemplates()。
 */

import { TemplateRegistrar } from '@/component-core/engine/TemplateRegistrar';
import { FORMFIELD_TPL } from './formfield-tpl';

export function registerFormFieldTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('FormField', FORMFIELD_TPL);
}
