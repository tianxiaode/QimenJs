import { TemplateRegistrar } from '@/component-core/engine/ComponentRegistrar';
import { STEP_TPL } from './step-tpl';

export function registerStepTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('Step', STEP_TPL);
}
