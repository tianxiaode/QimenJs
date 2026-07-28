/**
 * Divider 模板注册 — 将模板注册到 TemplateRegistrar
 *
 * 应用启动时调用 registerDividerTemplates()。
 */

import { TemplateRegistrar } from '@/component-core/engine/ComponentRegistrar';
import { DIVIDER_TPL } from './divider-tpl';

export function registerDividerTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('Divider', DIVIDER_TPL);
}
