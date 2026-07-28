/**
 * Icon 模板注册 — 将模板注册到 TemplateRegistrar
 *
 * 应用启动时调用 registerIconTemplates()。
 */

import { TemplateRegistrar } from '@/component-core/engine/TemplateRegistrar';
import { DelegatedEventEngine } from '@/component-core/engine/DelegatedEventEngine';
import { ICON_TPL, ICON_EVENTS } from './icon-tpl';
import { IconComponent } from './IconComponent';

export function registerIconTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('Icon', ICON_TPL);

    IconComponent._delegatedEventRules = DelegatedEventEngine.compileTplEvents(ICON_EVENTS);
}
