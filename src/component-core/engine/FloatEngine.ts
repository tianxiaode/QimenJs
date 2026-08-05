/**
 * FloatEngine — 浮层引擎（单例）
 *
 * 为组件提供浮层的完整生命周期管理，与 DragEngine 对称。
 *
 * 架构分层：
 *   1. 缓存层 — abilityState 读写，屏蔽存储细节
 *   2. 引擎层 — diff/sync + 事件发射，驱动浮层生命周期
 *   3. 处理器层 — 类型处理器（tooltip/dialog/loading），将 props 转为 FloatDecl
 *   4. API 层 — attach/detach/show/hide/toggle/update，对外暴露
 *
 * 类型处理器（Handlers）：
 *   每种浮层类型有独立的 handler 函数，将 props 配置转为 FloatDecl。
 *   新增类型只需 registerHandler，不需改引擎核心。
 *
 * @example
 * const engine = FloatEngine.getInstance();

 * engine.attachFloat(component, 'dropIcon', { type: 'Menu', trigger: 'click' });
 * engine.showFloat(component, 'dialog');
 */

import type { FloatDecl } from '../types/tpl-node-types';
import type {
    TooltipQuickConfig,
    DialogQuickConfig,
    LoadingQuickConfig,
} from '../types/init-context';
import { EventContextBuilder } from '@/context';
import { OVERLAY_ACTIONS } from '@/events';
import { getId } from '@/utils/string';

// ══════════════════════════════════════════════════════════════
// 类型定义
// ══════════════════════════════════════════════════════════════

/** 浮层类型处理器，将 props 配置转为 FloatDecl */
export type FloatHandler = (config: any) => FloatDecl;

// ══════════════════════════════════════════════════════════════
// FloatEngine 单例类
// ══════════════════════════════════════════════════════════════

/** 浮层引擎（单例），提供浮层完整生命周期管理，含缓存层/引擎层/处理器层/API层 */
export class FloatEngine {
    private static instance: FloatEngine;
    private handlers: Map<string, FloatHandler> = new Map();

    private constructor() {
        this._registerBuiltinHandlers();
    }

    static getInstance(): FloatEngine {
        if (!FloatEngine.instance) {
            FloatEngine.instance = new FloatEngine();
        }
        return FloatEngine.instance;
    }

    // ── 内置类型处理器 ──

    private _registerBuiltinHandlers(): void {
        this.registerHandler('tooltip', (config: TooltipQuickConfig | string) => {
            const cfg: TooltipQuickConfig =
                typeof config === 'string' ? { tooltip: config } : config;
            return {
                type: 'Tooltip',
                trigger: 'hover',
                anchor: cfg.anchor ?? 'self',
                placement: cfg.placement ?? 'top',
                showDelay: cfg.showDelay,
                hideDelay: cfg.hideDelay,
                data: { tooltip: cfg.tooltip },
            } as FloatDecl;
        });

        this.registerHandler('dialog', (config: DialogQuickConfig) => {
            const { mask, closeOnEscape, closeOnClickOutside, emits, ...dialogData } = config;
            return {
                type: 'Dialog',
                trigger: 'manual',
                placement: 'center',
                mask: mask ?? true,
                closeOnEscape: closeOnEscape ?? true,
                closeOnClickOutside: closeOnClickOutside ?? false,
                emits,
                data: dialogData,
            } as FloatDecl;
        });

        this.registerHandler('loading', (config: LoadingQuickConfig) => {
            const { maskMode, mask, ...loadingData } = config;
            return {
                type: 'Loading',
                trigger: 'manual',
                anchor: 'self',
                placement: 'anchor-center',
                maskMode: maskMode ?? 'scoped',
                mask: mask ?? true,
                data: loadingData,
            } as FloatDecl;
        });
    }

    // ── Handler 注册表 ──

    registerHandler(key: string, handler: FloatHandler): void {
        this.handlers.set(key, handler);
    }

    getHandler(key: string): FloatHandler | undefined {
        return this.handlers.get(key);
    }

    // ── 缓存管理 ──

    private readonly FLOATS_CACHE_KEY = 'FloatEngine:cache';

    getCache(self: any): Record<string, FloatDecl> {
        return self.abilityState(this.FLOATS_CACHE_KEY, () => ({})) ?? {};
    }

    setCache(self: any, val: Record<string, FloatDecl>): void {
        self.setAbilityState(this.FLOATS_CACHE_KEY, val);
    }

    // ── 事件发射 ──

    private ensureComponentId(self: any): string {
        if (!self.id) {
            self.id = self.props?.id || getId('cmp');
        }
        return self.id;
    }

    emitInit(self: any, key: string, decl: FloatDecl): void {
        const componentId = this.ensureComponentId(self);
        self.overlayEmit(
            EventContextBuilder.create()
                .withEvent(`overlay:${componentId}:${OVERLAY_ACTIONS.INIT}`)
                .withType(OVERLAY_ACTIONS.INIT)
                .withSource(componentId)
                .withData({ component: self, floats: { [key]: decl } })
                .build()
        );
    }

    emitAction(self: any, key: string, action: string): void {
        const overlayKey = `${self.id}:${key}`;
        self.overlayEmit(
            EventContextBuilder.create()
                .withEvent(`overlay:${overlayKey}:${action}`)
                .withType(action)
                .withSource(overlayKey)
                .withData({ component: self })
                .build()
        );
    }

    private emitControl(self: any, action: string, key: string): void {
        const overlayKey = `${self.id}:${key}`;
        self.overlayEmit(
            EventContextBuilder.create()
                .withEvent(`overlay:${overlayKey}:${action}`)
                .withType(action)
                .withSource(overlayKey)
                .withData({ component: self })
                .build()
        );
    }

    private emitChange(self: any, key: string, data: Record<string, any>): void {
        const overlayKey = `${self.id}:${key}`;
        self.overlayEmit(
            EventContextBuilder.create()
                .withEvent(`overlay:${overlayKey}:${OVERLAY_ACTIONS.CHANGE}`)
                .withType(OVERLAY_ACTIONS.CHANGE)
                .withSource(overlayKey)
                .withData({ component: { id: self.id }, data })
                .build()
        );
    }

    // ── Diff & Sync ──

    syncFloats(self: any, prev: Record<string, FloatDecl>, next: Record<string, FloatDecl>): void {
        this.ensureComponentId(self);

        const prevKeys = Object.keys(prev);
        const nextKeys = Object.keys(next);

        const removed = prevKeys.filter(k => !nextKeys.includes(k));
        const added = nextKeys.filter(k => !prevKeys.includes(k));
        const changed = nextKeys.filter(
            k => prevKeys.includes(k) && JSON.stringify(prev[k]) !== JSON.stringify(next[k])
        );

        for (const key of removed) {
            this.emitAction(self, key, OVERLAY_ACTIONS.DISPOSE);
        }

        for (const key of added) {
            this.emitInit(self, key, next[key]);
        }

        for (const key of changed) {
            this.emitAction(self, key, OVERLAY_ACTIONS.DISPOSE);
            this.emitInit(self, key, next[key]);
        }
    }

    // ── 核心 API ──

    buildFromProps(self: any): Record<string, FloatDecl> {
        const props = self.props || {};
        const result: Record<string, FloatDecl> = {};

        for (const [key, handler] of this.handlers) {
            const config = props[key];
            if (config !== null && config !== undefined) {
                result[key] = handler(config);
            }
        }

        return result;
    }

    commitFloats(self: any): void {
        const cache = this.getCache(self);
        if (Object.keys(cache).length === 0) return;
        this.syncFloats(self, {}, cache);
    }

    attachFloat(self: any, key: string, decl: FloatDecl): void {
        const current = this.getCache(self);
        const merged = { ...current, [key]: decl };

        if (self._initializing) {
            this.setCache(self, merged);
        } else {
            const prev = current;
            this.setCache(self, merged);
            this.syncFloats(self, prev, merged);
        }
    }

    detachFloat(self: any, key: string): void {
        const current = this.getCache(self);
        if (!current || !(key in current)) return;

        const next = { ...current };
        delete next[key];

        if (self._initializing) {
            this.setCache(self, Object.keys(next).length > 0 ? next : {});
        } else {
            const prev = current;
            const nextVal = Object.keys(next).length > 0 ? next : {};
            this.setCache(self, nextVal);
            this.syncFloats(self, prev, nextVal);
        }
    }

    setFloats(self: any, val: Record<string, FloatDecl> | undefined): void {
        const prev = this.getCache(self);

        if (self._initializing) {
            const merged = val ? { ...prev, ...val } : prev;
            this.setCache(self, merged);
            return;
        }

        const next = val ?? {};
        this.setCache(self, next);
        this.syncFloats(self, prev, next);
    }

    getFloats(self: any): Record<string, FloatDecl> | undefined {
        const cache = this.getCache(self);
        return Object.keys(cache).length > 0 ? cache : undefined;
    }

    // ── 控制操作 ──

    showFloat(self: any, key: string): void {
        this.emitControl(self, OVERLAY_ACTIONS.SHOW, key);
    }

    hideFloat(self: any, key: string): void {
        this.emitControl(self, OVERLAY_ACTIONS.HIDE, key);
    }

    toggleFloat(self: any, key: string): void {
        this.emitControl(self, OVERLAY_ACTIONS.TOGGLE, key);
    }

    updateFloat(self: any, key: string, data: Record<string, any>): void {
        this.emitChange(self, key, data);
    }

    // ── 快捷方法 ──

    showDialog(self: any): void {
        this.showFloat(self, 'dialog');
    }

    hideDialog(self: any): void {
        this.hideFloat(self, 'dialog');
    }

    toggleDialog(self: any): void {
        this.toggleFloat(self, 'dialog');
    }

    updateDialog(self: any, data: Record<string, any>): void {
        this.updateFloat(self, 'dialog', data);
    }

    updateTooltip(self: any, data: Record<string, any>): void {
        this.updateFloat(self, 'tooltip', data);
    }

    showLoading(self: any, text?: string, maskMode?: 'none' | 'scoped' | 'global'): void {
        if (text !== undefined || maskMode !== undefined) {
            const data: Record<string, any> = {};
            if (text !== undefined) data.text = text;
            if (maskMode !== undefined) data.maskMode = maskMode;
            this.updateFloat(self, 'loading', data);
        }
        this.showFloat(self, 'loading');
    }

    hideLoading(self: any): void {
        this.hideFloat(self, 'loading');
    }

    updateLoading(self: any, data: Record<string, any>): void {
        this.updateFloat(self, 'loading', data);
    }
}
