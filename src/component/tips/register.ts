import { TemplateRegistrar } from '@/component-core/engine/ComponentRegistrar';
import { TIPS_TPL } from './tips-tpl';

export function registerTipsTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('tips', TIPS_TPL);
}
