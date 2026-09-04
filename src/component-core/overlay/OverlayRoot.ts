/**
 * OverlayRoot 全局浮层根容器
 *
 * 在 <body> 下创建全局浮层容器，所有浮层组件渲染到该容器中。
 * 浮层容器本身可见（用于 z-index 层叠），但 pointer-events: none
 * 避免遮挡下层交互。
 *
 * 同时提供 mountOverlay / unmountOverlay 便捷方法，
 * 用于将组件挂载到浮层根容器（替代已移除的 HiddenRoot）。
 *
 * 统一监听 document press/keydown 事件，通过 registerOverlay 将原生 event
 * 转发给所有注册的浮层条目，由各浮层自行判断是否处理。
 */

import { ComposableBase } from '@/composable';
import { EventsAbility, DomEventsAbility } from '@/system-abilities/system';

type OverlayCallback = (event: Event) => void;

export class OverlayRoot extends ComposableBase {
    /** 运行时由 use([EventsAbility, DomEventsAbility]) 注入 */
    declare bind: (target: EventTarget, semantic: string, options?: any) => () => void;
    declare on: (event: string, handler: (ctx: any) => void) => () => void;

    private static instance: OverlayRoot;
    private root: HTMLElement | null = null;
    private entries: OverlayCallback[] = [];
    private handlersBound = false;

    static getInstance(): OverlayRoot {
        if (!OverlayRoot.instance) {
            OverlayRoot.instance = new OverlayRoot();
        }
        return OverlayRoot.instance;
    }

    getRoot(): HTMLElement {
        if (this.root) return this.root;

        if (typeof document === 'undefined') {
            throw new Error('OverlayRoot: document is not available');
        }

        this.root = document.getElementById('q-overlay-root');
        if (!this.root) {
            this.root = document.createElement('div');
            this.root.id = 'q-overlay-root';
            this.root.style.position = 'fixed';
            this.root.style.top = '0';
            this.root.style.left = '0';
            this.root.style.width = '100%';
            this.root.style.height = '100%';
            this.root.style.zIndex = '1050';
            this.root.style.pointerEvents = 'none';
            document.body.appendChild(this.root);
        }

        return this.root;
    }

    registerOverlay(callback: OverlayCallback): void {
        this.entries.push(callback);
        this._ensureHandlers();
    }

    unregisterOverlay(callback: OverlayCallback): void {
        const idx = this.entries.indexOf(callback);
        if (idx >= 0) {
            this.entries.splice(idx, 1);
        }
    }

    private _ensureHandlers(): void {
        if (this.handlersBound) return;
        this.handlersBound = true;

        const offPress = this.bind(document, 'press');
        const offKeydown = this.bind(document, 'keydown');
        this.onCleanup(offPress);
        this.onCleanup(offKeydown);

        this.onCleanup(
            this.on('dom:press', (ctx: any) => {
                const event = ctx?.data?.originalEvent as Event;
                if (event) {
                    for (const cb of [...this.entries]) {
                        cb(event);
                    }
                }
            })
        );

        this.onCleanup(
            this.on('dom:keydown', (ctx: any) => {
                const event = ctx?.data?.originalEvent as Event;
                if (event) {
                    for (const cb of [...this.entries]) {
                        cb(event);
                    }
                }
            })
        );
    }

    mountOverlay(el: HTMLElement): void {
        const root = this.getRoot();
        root.appendChild(el);
    }

    unmountOverlay(el: HTMLElement): void {
        if (el.parentNode) {
            el.parentNode.removeChild(el);
        }
    }

    destroy(): void {
        this.dispose();
        if (this.root && this.root.parentNode) {
            this.root.parentNode.removeChild(this.root);
        }
        this.root = null;
        OverlayRoot.instance = undefined as any;
    }
}

OverlayRoot.use([EventsAbility, DomEventsAbility]);
