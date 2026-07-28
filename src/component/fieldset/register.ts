import { TemplateRegistrar } from '@/component-core/engine/ComponentRegistrar';
import { FIELDSET_TPL } from './fieldset-tpl';

export function registerFieldsetTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('Fieldset', FIELDSET_TPL);
}
