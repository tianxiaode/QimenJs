import { Logger } from "@orbitjs/logger";
import { IComposable } from "../../types";
import { AbilityBase } from "./AbilityBase";

export class LoggerAbility extends AbilityBase {
    protected onAttach(): void {
        this.host.logger = Logger.for(this.host.constructor.name);
        this.host.logger.debug("Attached");
    }

    protected onDispose(): void {
        this.host.logger = null;
    }
}