import { ViewportPosition } from '../types';
import { Toast } from './Toast';
import type { ToastOptions, ToastHandle, ToastAlignment } from '../types';

const MAX_COUNT = 5;
const GAP = 16;
const MARGIN = 16;

export class ToastManager {
    private static instance: ToastManager;
    static defaultAlignment: ToastAlignment = 'top-right';

    private instances = new Map<number, Toast>();
    private shown = new Set<Toast>();
    private pendingMap = new Map<ToastAlignment, Toast[]>();
    private nextId = 0;

    private constructor() {}

    static getInstance(): ToastManager {
        if (!ToastManager.instance) {
            ToastManager.instance = new ToastManager();
        }
        return ToastManager.instance;
    }

    create(options: ToastOptions): ToastHandle {
        const alignment: ToastAlignment = options.alignment ?? ToastManager.defaultAlignment;
        const id = this.nextId++;

        const toast = new Toast({
            toastType: options.toastType ?? 'info',
            duration: options.duration ?? 3000,
            alignment: alignment,
            eventKey: options.eventKey,
            title: options.title,
            message: options.message,
        });

        toast.onCleanup(() => {
            this.instances.delete(id);
            this.shown.delete(toast);
            const stillShown = this.getShownByAlignment(alignment);
            if (stillShown.length === 0) {
                this.showNextBatch(alignment);
            }
        });

        this.instances.set(id, toast);

        const shownCount = this.getShownByAlignment(alignment).length;
        if (shownCount < MAX_COUNT) {
            this.shown.add(toast);
            toast.show();
            this.positionNew(toast, alignment);
        } else {
            this.getPendingList(alignment).push(toast);
        }

        return toast;
    }

    private showNextBatch(alignment: ToastAlignment): void {
        const pending = this.getPendingList(alignment);
        if (pending.length === 0) return;

        const batch = pending.splice(0, MAX_COUNT);
        batch.forEach((toast, i) => {
            setTimeout(() => {
                this.shown.add(toast);
                toast.show();
                this.positionNew(toast, alignment);
            }, i * 50);
        });
    }

    private positionNew(toast: Toast, alignment: ToastAlignment): void {
        const visible = this.getShownByAlignment(alignment);
        let offset = 0;
        for (const t of visible) {
            if (t === toast) break;
            offset += t.el!.offsetHeight + GAP;
        }
        toast.setViewportPosition(alignment as ViewportPosition, offset, MARGIN);
    }

    private repositionAll(alignment: ToastAlignment): void {
        const visible = this.getShownByAlignment(alignment);
        let offset = 0;
        for (const toast of visible) {
            toast.setViewportPosition(alignment as ViewportPosition, offset, MARGIN);
            offset += toast.el!.offsetHeight + GAP;
        }
    }

    private getShownByAlignment(alignment: ToastAlignment): Toast[] {
        const result: Toast[] = [];
        for (const toast of this.instances.values()) {
            if (toast.alignment === alignment && this.shown.has(toast)) {
                result.push(toast);
            }
        }
        return result;
    }

    private getPendingList(alignment: ToastAlignment): Toast[] {
        if (!this.pendingMap.has(alignment)) {
            this.pendingMap.set(alignment, []);
        }
        return this.pendingMap.get(alignment)!;
    }
}
