import { AlertComponent } from './AlertComponent';
import { ALERT_TPL } from './alert-tpl';

export function registerAlertTemplates(): void {
    AlertComponent.register(ALERT_TPL);
}
