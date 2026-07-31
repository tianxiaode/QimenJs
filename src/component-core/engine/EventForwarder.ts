/**
 * EventForwarder — 事件转发公共逻辑
 *
 * 路由表模式：六路转发（emits/bridges/entities/file/router/system）各自封装为
 * { key, canExecute, execute } 条目，forward 退化为纯调度循环。
 *
 * 两层过滤叠加：
 *   canExecute — 静态守卫（config 有配 + instance 有 key）
 *   getForwardFilter — 动态守卫（组件运行时决定允许哪些路）
 * execute 内部零分支，只做纯执行。
 *
 * 扩展：加路 = FORWARD_ROUTES push 一条，调度器不改。
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

export type EventDataType = 'emit' | 'bridge' | 'entity' | 'float' | 'router' | 'system' | 'file';

export type ForwardRouteKey = 'emit' | 'bridge' | 'entity' | 'router' | 'system' | 'file';

export interface ForwardConfig {
    emits?: string[];
    bridges?: string[];
    entities?: string;
    /** 转发为文件命令（值为 fileKey，action 取 actualAction/事件名） */
    file?: string;
    router?: string;
    system?: string[];
}

interface ForwardContext {
    instance: any;
    config: ForwardConfig;
    data: any;
    domEvent?: any;
    actualAction?: string;
    customData: any;
    hasCustomData: boolean;
}

interface ForwardRoute {
    key: ForwardRouteKey;
    canExecute(ctx: ForwardContext): boolean;
    execute(ctx: ForwardContext): void;
}

function _forwardEmits(ctx: ForwardContext): void {
    const source = EventForwarder.resolveKey(ctx.instance.bridgeKey) ?? '';
    for (const emitName of ctx.config.emits!) {
        const resolvedName =
            emitName === '[action]' && ctx.actualAction ? ctx.actualAction : emitName;
        const eventCtx = EventForwarder.buildContext(
            ctx.instance,
            resolvedName,
            ctx.data,
            source,
            'emit'
        );
        if (ctx.domEvent) (eventCtx as any).domEvent = ctx.domEvent;
        ctx.instance.emit(resolvedName, eventCtx);
    }
}

function _forwardBridges(ctx: ForwardContext): void {
    const bridgeKey = EventForwarder.resolveKey(ctx.instance.bridgeKey)!;
    for (const bridge of ctx.config.bridges!) {
        const eventCtx = EventForwarder.buildContext(
            ctx.instance,
            bridge,
            ctx.data,
            bridgeKey,
            'bridge'
        );
        ctx.instance.bridgeEmit(eventCtx);
    }
}

function _forwardEntities(ctx: ForwardContext): void {
    const resolvedName =
        ctx.config.entities === '[action]' && ctx.actualAction
            ? ctx.actualAction
            : ctx.config.entities!;
    const eventCtx = EventForwarder.buildContext(
        ctx.instance,
        resolvedName,
        ctx.data,
        ctx.instance.entityKey,
        'entity'
    );
    ctx.instance.entityEmit(eventCtx);
}

function _forwardRouter(ctx: ForwardContext): void {
    const eventCtx = EventForwarder.buildContext(
        ctx.instance,
        ctx.config.router!,
        ctx.data,
        'router',
        'router'
    );
    ctx.instance.routerEmit?.(eventCtx);
}

function _forwardSystem(ctx: ForwardContext): void {
    for (const sysEvent of ctx.config.system!) {
        const eventCtx = EventForwarder.buildContext(
            ctx.instance,
            sysEvent,
            ctx.data,
            ctx.instance.constructor.name,
            'system'
        );
        ctx.instance.systemEmit?.(eventCtx);
    }
}

function _forwardFiles(ctx: ForwardContext): void {
    const fileKey = ctx.config.file!;
    // action 取 actualAction（domEvents 匹配的 action 或 childEvents 的事件名）
    const action = ctx.actualAction || '';
    if (!action) return;
    const eventCtx = EventForwarder.buildContext(ctx.instance, action, ctx.data, fileKey, 'file');
    ctx.instance.fileEmit?.(eventCtx);
}

const FORWARD_ROUTES: ForwardRoute[] = [
    {
        key: 'emit',
        canExecute: ctx => !!ctx.config.emits?.length,
        execute: _forwardEmits,
    },
    {
        key: 'bridge',
        canExecute: ctx =>
            !!ctx.config.bridges?.length && !!EventForwarder.resolveKey(ctx.instance.bridgeKey),
        execute: _forwardBridges,
    },
    {
        key: 'entity',
        canExecute: ctx => !!ctx.config.entities && !!ctx.instance.entityKey,
        execute: _forwardEntities,
    },
    {
        key: 'router',
        canExecute: ctx => !!ctx.config.router,
        execute: _forwardRouter,
    },
    {
        key: 'system',
        canExecute: ctx => !!ctx.config.system?.length,
        execute: _forwardSystem,
    },
    {
        key: 'file',
        canExecute: ctx => !!ctx.config.file,
        execute: _forwardFiles,
    },
];

export class EventForwarder {
    /**
     * 执行转发调度
     *
     * 遍历 FORWARD_ROUTES，canExecute + getForwardFilter 两层过滤后执行。
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
        const customData =
            typeof instance.getCustomEventData === 'function' ? instance.getCustomEventData() : {};
        const hasCustomData =
            customData && typeof customData === 'object' && Object.keys(customData).length > 0;
        const data = EventForwarder.collectEventData(instance, extraData, customData);

        const ctx: ForwardContext = {
            instance,
            config,
            data,
            domEvent,
            actualAction,
            customData,
            hasCustomData,
        };

        const allowed =
            typeof instance.getForwardFilter === 'function'
                ? instance.getForwardFilter(domEvent)
                : null;

        for (const route of FORWARD_ROUTES) {
            if (!route.canExecute(ctx)) continue;
            if (allowed && !allowed.includes(route.key)) continue;
            route.execute(ctx);
        }
    }

    /**
     * 收集事件数据
     *
     * 合并顺序：defaultEventData → getCustomEventData() → extraData
     * defaultEventData 是 getter，子类 super 天然合并。
     */
    static collectEventData(instance: any, extraData?: any, precomputedCustomData?: any): any {
        const defaultData =
            typeof instance.defaultEventData === 'object' ? instance.defaultEventData : {};
        const customData =
            precomputedCustomData !== undefined
                ? precomputedCustomData
                : typeof instance.getCustomEventData === 'function'
                  ? instance.getCustomEventData()
                  : {};
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
        _eventType: EventDataType
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
