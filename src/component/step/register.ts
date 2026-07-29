import { StepComponent } from './StepComponent';
import { STEP_TPL } from './step-tpl';

export function registerStepTemplates(): void {
    StepComponent.register(STEP_TPL);
}