/**
 * Icon 模板注册 — 将模板注册到 TemplateRegistrar
 *
 * 应用启动时调用 registerIconTemplates()。
 */

import { TemplateRegistrar } from '@/component-core/engine/ComponentRegistrar';
import { ICON_TPL } from './icon-tpl';

export function registerIconTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('Icon', ICON_TPL);
}
