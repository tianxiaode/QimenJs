import { CommonRule, PresenceOptions } from "../../core";

export interface PresenceRule extends CommonRule, PresenceOptions {
    type: "presence";
}
