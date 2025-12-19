import { ValidationRuleBase } from "./types";

export interface PresenceRule extends ValidationRuleBase {
    required?: boolean;
    nullable?: boolean;
    empty?: boolean;
}
