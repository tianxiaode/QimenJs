import { ILogger } from "@orbitjs/logger";

export interface IComposable {
    attach: (host: any) => void;
    dispose?: () => void;
}

export interface IComposableBase {
    logger: ILogger
}

