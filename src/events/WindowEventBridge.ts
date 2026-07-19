/**
 * WindowEventBridge — 浏览器窗口事件懒监听桥接
 *
 * 有订阅才 addEventListener，全部取消才 removeEventListener。
 * 桥接到 SystemEventBus，组件无需直接操作 window 事件。
 */

import { SYSTEM_EVENTS } from './SystemEventBus';

type Unsubscribe = () => void;

interface WindowEventEntry {
    emit: (data: any) => void;
    addDomListener: () => void;
    removeDomListener: () => void;
    listeners: Set<(data: any) => void>;
    active: boolean;
}

export class WindowEventBridge {
    private static instance: WindowEventBridge;
    private readonly entries = new Map<string, WindowEventEntry>();

    private constructor() {}

    static getInstance(): WindowEventBridge {
        if (!WindowEventBridge.instance) {
            WindowEventBus.instance = new WindowEventBridge();
        }
        return WindowEventBridge.instance;
    }

    on(event: string, handler: (data: any) => void, emit: (data: any) => void): Unsubscribe {
        let entry = this.entries.get(event);
        if (!entry) {
            entry = this.createEntry(event, emit);
            this.entries.set(event, entry);
        }

        entry.listeners.add(handler);

        if (!entry.active) {
            entry.addDomListener();
            entry.active = true;
        }

        return () => {
            entry!.listeners.delete(handler);
            if (entry!.listeners.size === 0 && entry!.active) {
                entry!.removeDomListener();
                entry!.active = false;
            }
        };
    }

    private createEntry(event: string, emit: (data: any) => void): WindowEventEntry {
        const listeners = new Set<(data: any) => void>();

        const dispatch = (data: any) => {
            emit(data);
            for (const handler of listeners) {
                handler(data);
            }
        };

        const builders: Record<string, () => { add: () => void; remove: () => void }> = {
            [SYSTEM_EVENTS.WINDOW_RESIZE]: () => {
                let timer: ReturnType<typeof setTimeout> | undefined;
                const handler = (e: UIEvent) => {
                    clearTimeout(timer);
                    timer = setTimeout(() => {
                        dispatch({
                            width: window.innerWidth,
                            height: window.innerHeight,
                            originalEvent: e,
                        });
                    }, 150);
                };
                return {
                    add: () => window.addEventListener('resize', handler),
                    remove: () => window.removeEventListener('resize', handler),
                };
            },
            [SYSTEM_EVENTS.VISIBILITY_CHANGE]: () => {
                const handler = () => {
                    dispatch({
                        visible: document.visibilityState === 'visible',
                        visibilityState: document.visibilityState,
                    });
                };
                return {
                    add: () => document.addEventListener('visibilitychange', handler),
                    remove: () => document.removeEventListener('visibilitychange', handler),
                };
            },
            [SYSTEM_EVENTS.THEME_CHANGE]: () => {
                const mql = window.matchMedia('(prefers-color-scheme: dark)');
                const handler = (e: MediaQueryListEvent) => {
                    dispatch({ dark: e.matches, colorScheme: e.matches ? 'dark' : 'light' });
                };
                return {
                    add: () => mql.addEventListener('change', handler),
                    remove: () => mql.removeEventListener('change', handler),
                };
            },
            [SYSTEM_EVENTS.NETWORK_CHANGE]: () => {
                const handler = () => {
                    dispatch({ online: navigator.onLine });
                };
                return {
                    add: () => {
                        window.addEventListener('online', handler);
                        window.addEventListener('offline', handler);
                    },
                    remove: () => {
                        window.removeEventListener('online', handler);
                        window.removeEventListener('offline', handler);
                    },
                };
            },
            [SYSTEM_EVENTS.ORIENTATION_CHANGE]: () => {
                const handler = () => {
                    dispatch({
                        orientation: screen.orientation?.type ?? 'unknown',
                        angle: screen.orientation?.angle ?? 0,
                    });
                };
                return {
                    add: () => screen.orientation?.addEventListener('change', handler),
                    remove: () => screen.orientation?.removeEventListener('change', handler),
                };
            },
            [SYSTEM_EVENTS.MEDIA_QUERY_CHANGE]: () => {
                const queries = [
                    { name: 'reducedMotion', query: '(prefers-reduced-motion: reduce)' },
                    { name: 'colorScheme', query: '(prefers-color-scheme: dark)' },
                    { name: 'highContrast', query: '(prefers-contrast: more)' },
                ];
                const mqls = queries.map(q => ({ ...q, mql: window.matchMedia(q.query) }));
                const handlers: Array<(e: MediaQueryListEvent) => void> = [];
                for (const { name, mql } of mqls) {
                    const handler = (e: MediaQueryListEvent) => {
                        dispatch({ name, query: e.media, matches: e.matches });
                    };
                    handlers.push(handler);
                    mql.addEventListener('change', handler);
                }
                return {
                    add: () => {
                        for (const { name, mql } of mqls) {
                            const handler = handlers.find((_, i) => mqls[i].name === name)!;
                            mql.addEventListener('change', handler);
                        }
                    },
                    remove: () => {
                        for (const { name, mql } of mqls) {
                            const handler = handlers.find((_, i) => mqls[i].name === name)!;
                            mql.removeEventListener('change', handler);
                        }
                    },
                };
            },
        };

        const builder = builders[event];
        if (!builder) {
            throw new Error(`[WindowEventBridge] unknown window event: ${event}`);
        }

        const dom = builder();
        return {
            emit,
            addDomListener: dom.add,
            removeDomListener: dom.remove,
            listeners,
            active: false,
        };
    }

    dispose(): void {
        for (const entry of this.entries.values()) {
            if (entry.active) entry.removeDomListener();
            entry.listeners.clear();
        }
        this.entries.clear();
    }
}

export const windowEventBridge = WindowEventBridge.getInstance();
