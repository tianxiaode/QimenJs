import { HeaderComponent } from './HeaderComponent';
import { HEADER_TPL } from './header-tpl';

export function registerHeaderTemplates(): void {
    HeaderComponent.register(HEADER_TPL);
}