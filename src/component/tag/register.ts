/**
 * Tag 模板注册 — 将模板注册到 TemplateRegistrar
 *
 * 应用启动时调用 registerTagTemplates()。
 */

import { TemplateRegistrar } from '@/component-core/engine/ComponentRegistrar';
import { TAG_TPL } from './tag-tpl';

export function registerTagTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('Tag', TAG_TPL);
}
