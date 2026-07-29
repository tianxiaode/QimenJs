import { FieldsetComponent } from './FieldsetComponent';
import { FIELDSET_TPL } from './fieldset-tpl';

export function registerFieldsetTemplates(): void {
    FieldsetComponent.register(FIELDSET_TPL);
}
