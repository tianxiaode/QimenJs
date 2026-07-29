/**
 * EventForwarder — 事件转发公共逻辑
 *
 * 统一处理五路转发（emits/bridges/entities/router/system），
 * 供 DomEventsEngine / ChildEventsEngine / ListensEngine 共用。
 *
 * 转发时自动收集事件数据：
 *   data = { ...instance.defaultEventData, ...instance.getCustomEventData?.(), ...extraData }
 *
 * EventContext 构建也集中在此，保证所有转发路径的 context 结构一致。
 */

import type { EventContext, EventChainLink } from '@/context';
import { EventContextBuilder } from '@/context';
import { globalEventBus } from '@/events';
import { object } from '@/utils';

export type EventDataType = 'emit' | 'bridge' | 'entity' | 'float' | 'router' | 'system';

export interface ForwardConfig {
    emits?: string[];
    bridges?: string[];
    entities?: string;
    router?: string;
    system?: string[];
}

export class EventForwarder {
    /**
     * 执行五路转发
     *
     * @param instance - 组件实例
     * @param config - 转发配置（emits/bridges/entities/router/system）
     * @param extraData - 额外事件数据（如 action、DOM event 字段等）
     * @param domEvent - 可选原始 DOM 事件（仅 DomEventsEngine 传入）
     * @param actualAction - 实际匹配到的 action 值，用于替换 emits 中的 [action] 占位符
     */
    static forward(
        instance: any,
        config: ForwardConfig,
        extraData?: any,
        domEvent?: any,
        actualAction?: string
    ): void {
        const data = EventForwarder.collectEventData(instance, extraData);

        if (config.emits?.length) {
            const source = EventForwarder.resolveKey(instance.bridgeKey) ?? '';
            for (const emitName of config.emits) {
                const resolvedName = emitName === '[action]' && actualAction ? actualAction : emitName;
                const ctx = EventForwarder.buildContext(instance, resolvedName, data, source, 'emit');
                if (domEvent) (ctx as any).domEvent = domEvent;
                instance.emit(resolvedName, ctx);
            }
        }

        if (config.bridges?.length) {
            const bridgeKey = EventForwarder.resolveKey(instance.bridgeKey);
            if (bridgeKey) {
                for (const bridge of config.bridges) {
                    const ctx = EventForwarder.buildContext(
                        instance,
                        bridge,
                        data,
                        bridgeKey,
                        'bridge'
                    );
                    instance.bridgeEmit(ctx);
                }
            }
        }

        if (config.entities && instance.entityKey) {
            const entityName = typeof config.entities === 'string' ? config.entities : undefined;
            if (entityName) {
                const ctx = EventForwarder.buildContext(
                    instance,
                    entityName,
                    data,
                    instance.entityKey,
                    'entity'
                );
                instance.entityEmit(ctx);
            }
        }

        if (config.router && instance.routeKey) {
            const routeName = typeof config.router === 'string' ? config.router : undefined;
            if (routeName) {
                const ctx = EventForwarder.buildContext(
                    instance,
                    routeName,
                    data,
                    instance.routeKey,
                    'router'
                );
                instance.routerEmit?.(ctx);
            }
        }

        if (config.system?.length) {
            for (const sysEvent of config.system) {
                const ctx = EventForwarder.buildContext(
                    instance,
                    sysEvent,
                    data,
                    instance.constructor.name,
                    'system'
                );
                instance.systemEmit?.(ctx);
            }
        }
    }

    /**
     * 收集事件数据
     *
     * 合并顺序：defaultEventData → getCustomEventData() → extraData
     * defaultEventData 是 getter，子类 super 天然合并。
     */
    static collectEventData(instance: any, extraData?: any): any {
        const defaultData =
            typeof instance.defaultEventData === 'object' ? instance.defaultEventData : {};
        const customData =
            typeof instance.getCustomEventData === 'function' ? instance.getCustomEventData() : {};
        const base = { ...defaultData, ...customData };
        if (!extraData) return base;
        if (typeof extraData === 'object') return { ...base, ...extraData };
        return extraData;
    }

    /**
     * 构建 EventContext
     */
    static buildContext(
        instance: any,
        eventName: string,
        data: any,
        source: string,
        eventType: EventDataType
    ): EventContext {
        const currentCtx = instance._currentEventContext as EventContext | undefined;
        const chain: EventChainLink[] | undefined = currentCtx
            ? [
                  ...(currentCtx.chain || []),
                  {
                      event: currentCtx.event,
                      type: currentCtx.type!,
                      source: currentCtx.source,
                      sourceType: currentCtx.sourceType!,
                  },
              ]
            : undefined;

        const clonedData = data !== undefined ? object.clone(data) : undefined;

        return EventContextBuilder.create()
            .withEvent(eventName)
            .withType(eventName)
            .withSource(source)
            .withSourceType(instance.constructor.name)
            .withData(clonedData)
            .withBusId(globalEventBus.getBusId())
            .withChain(chain)
            .build();
    }

    /**
     * 解析 bridgeKey / entityKey
     *
     * 支持 string | { key: string; fixed?: boolean } | undefined
     */
    static resolveKey(key: any): string | undefined {
        if (!key) return undefined;
        if (typeof key === 'string') return key;
        if (typeof key === 'object' && key.key) return key.key;
        return undefined;
    }
}
