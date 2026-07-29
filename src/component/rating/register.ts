import { RatingComponent } from './RatingComponent';
import { RATING_TPL } from './rating-tpl';

export function registerRatingTemplates(): void {
    RatingComponent.register(RATING_TPL);
}