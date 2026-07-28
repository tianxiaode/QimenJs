/**
 * Text 模板注册 — 将模板注册到 TemplateRegistrar
 *
 * 应用启动时调用 registerTextTemplates()。
 */

import { TemplateRegistrar } from '@/component-core/engine/ComponentRegistrar';
import { TEXT_TPL } from './text-tpl';

export function registerTextTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('Text', TEXT_TPL);
}
