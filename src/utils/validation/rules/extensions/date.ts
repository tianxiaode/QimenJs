import { ExtensionRule } from "../../core";
import { DateRule } from "../core";

export interface DateAdvanceRule extends ExtensionRule , Omit<DateRule, 'type'> {
    type: 'dateAdvance';
    today?: boolean;
    yesterday?: boolean;
    tomorrow?: boolean;
    past?: boolean;
    future?: boolean;
    weekend?: number | number[];
}
