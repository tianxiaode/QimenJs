import { YearPanelComponent } from './YearPanelComponent';
import { MonthPanelComponent } from './MonthPanelComponent';
import { DayGridComponent } from './DayGridComponent';
import { DatePanelComponent } from './DatePanelComponent';
import { HourPanelComponent } from './HourPanelComponent';
import { MinutePanelComponent } from './MinutePanelComponent';
import { SecondPanelComponent } from './SecondPanelComponent';
import { YEAR_PANEL_TPL } from './year-panel-tpl';
import { MONTH_PANEL_TPL } from './month-panel-tpl';
import { DAY_GRID_TPL } from './day-grid-tpl';
import { DATE_PANEL_TPL } from './date-panel-tpl';
import { HOUR_PANEL_TPL } from './hour-panel-tpl';
import { MINUTE_PANEL_TPL } from './minute-panel-tpl';
import { SECOND_PANEL_TPL } from './second-panel-tpl';

export function registerDatePanelTemplates(): void {
    YearPanelComponent.register(YEAR_PANEL_TPL);
    MonthPanelComponent.register(MONTH_PANEL_TPL);
    DayGridComponent.register(DAY_GRID_TPL);
    DatePanelComponent.register(DATE_PANEL_TPL);
    HourPanelComponent.register(HOUR_PANEL_TPL);
    MinutePanelComponent.register(MINUTE_PANEL_TPL);
    SecondPanelComponent.register(SECOND_PANEL_TPL);
}