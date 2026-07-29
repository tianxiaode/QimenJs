import { TagComponent } from './TagComponent';
import { TAG_TPL } from './tag-tpl';

export function registerTagTemplates(): void {
    TagComponent.register(TAG_TPL);
}