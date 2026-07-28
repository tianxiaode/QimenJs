/**
 * Badge 模板注册 — 将模板注册到 TemplateRegistrar
 *
 * 应用启动时调用 registerBadgeTemplates()。
 */

import { TemplateRegistrar } from '@/component-core/engine/TemplateRegistrar';
import { BADGE_TPL } from './badge-tpl';

export function registerBadgeTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('Badge', BADGE_TPL);
}
