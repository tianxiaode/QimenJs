import { ProgressComponent } from './ProgressComponent';
import { PROGRESS_TPL } from './progress-tpl';

export function registerProgressTemplates(): void {
    ProgressComponent.register(PROGRESS_TPL);
}