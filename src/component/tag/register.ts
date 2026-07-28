/**
 * Tag 模板注册 — 将模板注册到 TemplateRegistrar
 *
 * 应用启动时调用 registerTagTemplates()。
 */

import { TemplateRegistrar } from '@/component-core/engine/TemplateRegistrar';
import { DelegatedEventEngine } from '@/component-core/engine/DelegatedEventEngine';
import { TAG_TPL, TAG_EVENTS } from './tag-tpl';
import { TagComponent } from './TagComponent';

export function registerTagTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('Tag', TAG_TPL);

    TagComponent._delegatedEventRules = DelegatedEventEngine.compileTplEvents(TAG_EVENTS);
}
