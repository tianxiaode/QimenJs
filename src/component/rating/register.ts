import { TemplateRegistrar } from '@/component-core/engine/ComponentRegistrar';
import { RATING_TPL } from './rating-tpl';

export function registerRatingTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('Rating', RATING_TPL);
}
