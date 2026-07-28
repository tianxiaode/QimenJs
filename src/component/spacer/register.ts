/**
 * Spacer 模板注册 — 将模板注册到 TemplateRegistrar
 *
 * 应用启动时调用 registerSpacerTemplates()。
 */

import { TemplateRegistrar } from '@/component-core/engine/ComponentRegistrar';
import { SPACER_TPL } from './spacer-tpl';

export function registerSpacerTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('Spacer', SPACER_TPL);
}
