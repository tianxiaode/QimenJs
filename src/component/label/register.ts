import { LabelComponent } from './LabelComponent';
import { LABEL_TPL } from './label-tpl';

export function registerLabelTemplates(): void {
    LabelComponent.register(LABEL_TPL);
}
