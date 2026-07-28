import { TemplateRegistrar } from '@/component-core/engine/ComponentRegistrar';
import { YEAR_PANEL_TPL } from './year-panel-tpl';
import { MONTH_PANEL_TPL } from './month-panel-tpl';
import { DAY_GRID_TPL } from './day-grid-tpl';
import { DATE_PANEL_TPL } from './date-panel-tpl';
import { HOUR_PANEL_TPL } from './hour-panel-tpl';
import { MINUTE_PANEL_TPL } from './minute-panel-tpl';
import { SECOND_PANEL_TPL } from './second-panel-tpl';

export function registerDatePanelTemplates(): void {
    const registry = TemplateRegistrar.getInstance();

    registry.register('YearPanel', YEAR_PANEL_TPL);
    registry.register('MonthPanel', MONTH_PANEL_TPL);
    registry.register('DayGrid', DAY_GRID_TPL);
    registry.register('DatePanel', DATE_PANEL_TPL);
    registry.register('HourPanel', HOUR_PANEL_TPL);
    registry.register('MinutePanel', MINUTE_PANEL_TPL);
    registry.register('SecondPanel', SECOND_PANEL_TPL);
}
