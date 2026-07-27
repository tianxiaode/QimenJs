/**
 * step-override-queue.ts — overrideQueue 执行 + onInitState/onBeforeInit/onAfterInit
 */

import type { InitContext } from '../../types/init-context';

export function executeOverrideQueue(instance: any, methodName: string, ...args: any[]): any {
    const ctor = instance.constructor as any;
    const queues = ctor._overrideQueues;
    if (!queues || !queues[methodName]) return;

    const hooks = queues[methodName];
    if (methodName === 'onInitState') {
        const mergedState: Record<string, any> = {};
        for (const hook of hooks) {
            const state = hook.apply(instance, args);
            if (state && typeof state === 'object') {
                Object.assign(mergedState, state);
            }
        }
        Object.assign(instance, mergedState);
        return mergedState;
    } else {
        let lastResult: any;
        for (const hook of hooks) {
            lastResult = hook.apply(instance, args);
        }
        return lastResult;
    }
}

export function onInitState(ctx: InitContext): void {
    const { instance, ctor } = ctx;
    if (ctor._compiled) {
        if (typeof instance.onInitState === 'function') {
            const state = instance.onInitState();
            if (state && typeof state === 'object') {
                Object.assign(instance, state);
            }
        }
    } else {
        executeOverrideQueue(instance, 'onInitState');
    }
}

export function onBeforeInit(ctx: InitContext): void {
    const { instance, ctor, props } = ctx;
    if (ctor._compiled) {
        if (typeof instance.onBeforeInit === 'function') {
            instance.onBeforeInit(props);
        }
    } else {
        executeOverrideQueue(instance, 'onBeforeInit', props);
    }
}

export function onAfterInit(ctx: InitContext): void {
    const { instance, ctor, props } = ctx;
    instance._templateInitialized = true;

    if (ctor._compiled) {
        if (typeof instance.onAfterInit === 'function') {
            instance.onAfterInit(props);
        }
    } else {
        executeOverrideQueue(instance, 'onAfterInit', props);
    }
}
