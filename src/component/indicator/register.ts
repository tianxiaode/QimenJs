import { IndicatorComponent } from './IndicatorComponent';
import { INDICATOR_TPL } from './indicator-tpl';
import { IndicatorDotComponent } from './IndicatorDotComponent';
import { INDICATOR_DOT_TPL } from './indicator-dot-tpl';

export function registerIndicatorTemplates(): void {
    IndicatorComponent.register(INDICATOR_TPL);
    IndicatorDotComponent.register(INDICATOR_DOT_TPL);
}
