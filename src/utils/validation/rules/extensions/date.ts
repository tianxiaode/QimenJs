import { DateRuleOptions } from "../core";

export interface DateExtensionRule extends  Omit<DateRuleOptions, "required" | 'nullable'> {
}

export interface WeekendRuleOptions extends Omit<DateRuleOptions, "required" | 'nullable'> {
    weekend: number | number[];
}