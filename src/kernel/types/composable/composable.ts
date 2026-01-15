import { ILogger } from "@orbitjs/logger";

export interface IComposable {
    attach: (host: any) => void;
    dispose?: () => void;
}

export interface IComposableBase {
    logger: ILogger
    getStatic<T>(key: string | symbol): T | undefined;
    setStatic<T>(key: string | symbol, value: T): void;
    [key: string]: any
}

