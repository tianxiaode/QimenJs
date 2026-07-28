import { TemplateRegistrar } from '@/component-core/engine/TemplateRegistrar';
import { DelegatedEventEngine } from '@/component-core/engine/DelegatedEventEngine';
import { HERO_TPL, HERO_EVENTS } from './hero-tpl';
import { HeroComponent } from './HeroComponent';

export function registerHeroTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('Hero', HERO_TPL);
    HeroComponent._delegatedEventRules = DelegatedEventEngine.compileTplEvents(HERO_EVENTS);
}
