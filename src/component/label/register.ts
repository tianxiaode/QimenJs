import { TemplateRegistrar } from '@/component-core/engine/TemplateRegistrar';
import { LABEL_TPL } from './label-tpl';

export function registerLabelTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('Label', LABEL_TPL);
}
