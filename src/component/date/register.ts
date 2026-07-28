import { TemplateRegistrar } from '@/component-core/engine/TemplateRegistrar';
import { DelegatedEventEngine } from '@/component-core/engine/DelegatedEventEngine';
import { YEAR_PANEL_TPL, YEAR_PANEL_EVENTS } from './year-panel-tpl';
import { YearPanelComponent } from './YearPanelComponent';
import { MONTH_PANEL_TPL, MONTH_PANEL_EVENTS } from './month-panel-tpl';
import { MonthPanelComponent } from './MonthPanelComponent';
import { DAY_GRID_TPL, DAY_GRID_EVENTS } from './day-grid-tpl';
import { DayGridComponent } from './DayGridComponent';
import { DATE_PANEL_TPL, DATE_PANEL_EVENTS } from './date-panel-tpl';
import { DatePanelComponent } from './DatePanelComponent';
import { HOUR_PANEL_TPL, HOUR_PANEL_EVENTS } from './hour-panel-tpl';
import { HourPanelComponent } from './HourPanelComponent';
import { MINUTE_PANEL_TPL, MINUTE_PANEL_EVENTS } from './minute-panel-tpl';
import { MinutePanelComponent } from './MinutePanelComponent';
import { SECOND_PANEL_TPL, SECOND_PANEL_EVENTS } from './second-panel-tpl';
import { SecondPanelComponent } from './SecondPanelComponent';

export function registerDatePanelTemplates(): void {
    const registry = TemplateRegistrar.getInstance();

    registry.register('YearPanel', YEAR_PANEL_TPL);
    YearPanelComponent._delegatedEventRules =
        DelegatedEventEngine.compileTplEvents(YEAR_PANEL_EVENTS);

    registry.register('MonthPanel', MONTH_PANEL_TPL);
    MonthPanelComponent._delegatedEventRules =
        DelegatedEventEngine.compileTplEvents(MONTH_PANEL_EVENTS);

    registry.register('DayGrid', DAY_GRID_TPL);
    DayGridComponent._delegatedEventRules = DelegatedEventEngine.compileTplEvents(DAY_GRID_EVENTS);

    registry.register('DatePanel', DATE_PANEL_TPL);
    DatePanelComponent._delegatedEventRules =
        DelegatedEventEngine.compileTplEvents(DATE_PANEL_EVENTS);

    registry.register('HourPanel', HOUR_PANEL_TPL);
    HourPanelComponent._delegatedEventRules =
        DelegatedEventEngine.compileTplEvents(HOUR_PANEL_EVENTS);

    registry.register('MinutePanel', MINUTE_PANEL_TPL);
    MinutePanelComponent._delegatedEventRules =
        DelegatedEventEngine.compileTplEvents(MINUTE_PANEL_EVENTS);

    registry.register('SecondPanel', SECOND_PANEL_TPL);
    SecondPanelComponent._delegatedEventRules =
        DelegatedEventEngine.compileTplEvents(SECOND_PANEL_EVENTS);
}
