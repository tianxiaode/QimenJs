import { TemplateRegistrar } from '@/component-core/engine/ComponentRegistrar';
import { INDICATOR_TPL } from './indicator-tpl';

export function registerIndicatorTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('Indicator', INDICATOR_TPL);
}
