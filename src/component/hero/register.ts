import { TemplateRegistrar } from '@/component-core/engine/ComponentRegistrar';
import { HERO_TPL } from './hero-tpl';

export function registerHeroTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('Hero', HERO_TPL);
}
