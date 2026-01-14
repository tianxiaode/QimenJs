import { ILogger } from "@/logger";
import { GestureSemantic } from "../events";

export interface ILoggerAbility {
    logger: ILogger
}

export interface IEventAbilitiy {
    on(event: string, listener: Function): () => void;
    once(event: string, listener: Function): void;
    emit(event: string, payload?: any): void;
}

export interface IDomEventsAbility extends IEventAbilitiy{
    bind: (target: EventTarget, semantic: GestureSemantic, options?: any) => void;
}


