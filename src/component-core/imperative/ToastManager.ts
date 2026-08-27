import { ViewportPosition } from '../types';
import { Toast } from './Toast';
import type { ToastOptions, ToastHandle, ToastPosition } from '../types';

const MAX_COUNT = 5;
const GAP = 16;
const MARGIN = 16;

export class ToastManager {
    private static instance: ToastManager;

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
        const position: ToastPosition = options.position ?? 'top-right';
        const id = this.nextId++;

        const toast = new Toast({
            options: {
                toastType: options.toastType ?? 'info',
                duration: options.duration ?? 3000,
                position: options.position ?? 'top-right',
                eventKey: options.eventKey,
                title: options.title,
                message: options.message,
            },
        });

        toast.onClose = () => {
            this.instances.delete(id);
            this.repositionAll(position);
        };

        this.instances.set(id, toast);

        this.enforceMaxCount(position);
        this.repositionAll(position);

        return toast;
    }

    private repositionAll(position: ToastPosition): void {
        const samePosition = this.getInstancesByPosition(position);
        let offset = 0;

        for (const toast of samePosition) {
            toast.setViewportPosition(position as ViewportPosition, offset, MARGIN);
            offset += toast.el.offsetHeight + GAP;
        }
    }

    private getInstancesByPosition(position: ToastPosition): Toast[] {
        const result: Toast[] = [];
        for (const toast of this.instances.values()) {
            if (toast.position === position) {
                result.push(toast);
            }
        }
        return result;
    }

    private enforceMaxCount(position: ToastPosition): void {
        const samePosition = this.getInstancesByPosition(position);
        if (samePosition.length <= MAX_COUNT) return;

        const oldest = samePosition[0];
        if (!oldest.isClosed) {
            oldest.close();
        }
    }
}
