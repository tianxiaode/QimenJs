import { BadgeComponent } from './BadgeComponent';
import { BADGE_TPL } from './badge-tpl';

export function registerBadgeTemplates(): void {
    BadgeComponent.register(BADGE_TPL);
}
