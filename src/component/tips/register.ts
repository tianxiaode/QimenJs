import { TemplateRegistrar } from '@/component-core/engine/TemplateRegistrar';
import { TIPS_TPL } from './tips-tpl';

export function registerTipsTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('tips', TIPS_TPL);
}
