import { SpacerComponent } from './SpacerComponent';
import { SPACER_TPL } from './spacer-tpl';

export function registerSpacerTemplates(): void {
    SpacerComponent.register(SPACER_TPL);
}