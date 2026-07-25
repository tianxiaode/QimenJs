/**
 * ToastManager — toast 实例管理器
 *
 * 单例模式，管理 toast 实例的创建、堆叠队列、销毁调度。
 * Toast 类内聚了 el 管理、节点缓存、事件绑定、动画、销毁等全部功能，
 * ToastManager 只负责队列调度和堆叠定位。
 *
 * overlayKey 自动生成：toast:{id}，也可通过 ToastOptions.overlayKey 自定义。
 */

import { FloatingLayerAbility } from '@/overlay/FloatingLayerAbility';
import type { ViewportPosition } from '@/overlay/FloatingLayerAbility';
import { Toast } from './Toast';
import type { ToastOptions, ToastHandle, ToastPosition } from './types';

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
        const overlayKey = options.overlayKey ?? `toast:${id}`;

        const toast = new Toast({ ...options, overlayKey });

        toast.onClose = () => {
            this.instances.delete(id);
            this.repositionAll(position);
        };

        this.instances.set(id, toast);

        this.enforceMaxCount(position);
        this.repositionAll(position);

        return toast.handle;
    }

    private repositionAll(position: ToastPosition): void {
        const samePosition = this.getInstancesByPosition(position);
        let offset = 0;

        for (const toast of samePosition) {
            toast.setViewportPosition(toast.el, position as ViewportPosition, offset, MARGIN);
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
        if (!oldest.handle.isClosed) {
            oldest.handle.close();
        }
    }
}
