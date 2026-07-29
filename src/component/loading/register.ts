import { LoadingComponent } from './LoadingComponent';
import { LOADING_TPL } from './loading-tpl';

export function registerLoadingTemplates(): void {
    LoadingComponent.register(LOADING_TPL);
}
