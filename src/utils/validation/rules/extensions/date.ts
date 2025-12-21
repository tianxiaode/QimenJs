import { ExtensionRule } from "../../core";
import { DateRuleOptions } from "../core";

export interface DateAdvanceRule extends ExtensionRule , Omit<DateRuleOptions, 'type'> {
    type: 'dateEx';
    today?: boolean;
    yesterday?: boolean;
    tomorrow?: boolean;
    past?: boolean;
    future?: boolean;
    weekend?: number | number[];
}
