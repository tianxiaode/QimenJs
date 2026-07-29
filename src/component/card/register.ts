import { CardComponent } from './CardComponent';
import { CARD_TPL } from './card-tpl';

export function registerCardTemplates(): void {
    CardComponent.register(CARD_TPL);
}
