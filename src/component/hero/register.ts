import { HeroComponent } from './HeroComponent';
import { HERO_TPL } from './hero-tpl';

export function registerHeroTemplates(): void {
    HeroComponent.register(HERO_TPL);
}
