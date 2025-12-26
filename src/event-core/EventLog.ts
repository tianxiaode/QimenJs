import type { ILogger, LogLevel } from '@orbitjs/logger';
import { BusAction, EventLogAction, ScopeLogAction } from './types';

export function logBus(
    logger: ILogger | undefined,
    level: LogLevel,
    action: BusAction,
    busId: string,
    data?: Record<string, any>
) {
    if (!logger) return;
    logger[level](`[event.bus] ${action}`, { busId, ...data });
}

export function logScope(
    logger: ILogger | undefined,
    level: LogLevel,
    action: ScopeLogAction,
    busId: string,
    scopeId: string,
    data?: Record<string, any>
) {
    if (!logger) return;
    logger[level](`[event.scope] ${action}`, { busId, scopeId, ...data });
}

export function logEvent(
    logger: ILogger | undefined,
    level: LogLevel,
    action: EventLogAction,
    busId: string,
    event: string,
    data?: Record<string, any>
) {
    if (!logger) return;
    logger[level](`[event] ${action}`, { busId, event, ...data });
}
