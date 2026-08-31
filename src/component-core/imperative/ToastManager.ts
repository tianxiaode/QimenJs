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

        toast.onClose = () => {
            this.instances.delete(id);
            this.repositionAll(alignment);
        };

        this.instances.set(id, toast);

        this.enforceMaxCount(alignment);
        return toast;
    }

    private repositionAll(alignment: ToastAlignment): void {
        const sameAlignment = this.getInstancesByAligment(alignment);
        let offset = 0;

        for (const toast of sameAlignment) {
            toast.setViewportPosition(alignment as ViewportPosition, offset, MARGIN);
            offset += toast.el!.offsetHeight + GAP;
        }
    }

    private getInstancesByAligment(alignment: ToastAlignment): Toast[] {
        const result: Toast[] = [];
        for (const toast of this.instances.values()) {
            if (toast.alignment === alignment) {
                result.push(toast);
            }
        }
        return result;
    }

    private enforceMaxCount(alignment: ToastAlignment): void {
        const sameAlignment = this.getInstancesByAligment(alignment);
        if (sameAlignment.length <= MAX_COUNT) return;

        const oldest = sameAlignment[0];
        if (!oldest.isClosed) {
            oldest.close();
        }
    }
}
