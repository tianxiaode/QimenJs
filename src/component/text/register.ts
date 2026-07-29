import { TextComponent } from './TextComponent';
import { TEXT_TPL } from './text-tpl';

export function registerTextTemplates(): void {
    TextComponent.register(TEXT_TPL);
}