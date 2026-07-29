import { DialogComponent } from './DialogComponent';
import { DIALOG_TPL } from './dialog-tpl';

export function registerDialogTemplates(): void {
    DialogComponent.register(DIALOG_TPL);
}
