import { TooltipComponent } from './TooltipComponent';
import { TOOLTIP_TPL } from './tooltip-tpl';

export function registerTooltipTemplates(): void {
    TooltipComponent.register(TOOLTIP_TPL);
}
