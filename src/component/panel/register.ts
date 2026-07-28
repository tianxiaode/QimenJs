import { TemplateRegistrar } from '@/component-core/engine/ComponentRegistrar';
import { PANEL_TPL } from './panel-tpl';

export function registerPanelTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('Panel', PANEL_TPL);
}
