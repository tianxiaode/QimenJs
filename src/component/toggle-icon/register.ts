import { TemplateRegistrar } from '@/component-core/engine/ComponentRegistrar';
import { TOGGLE_ICON_TPL } from './toggle-icon-tpl';

export function registerToggleIconTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('ToggleIcon', TOGGLE_ICON_TPL);
}
