/**
 * ToastManager — toast 实例管理器
 *
 * 单例模式，管理 toast 实例的创建、堆叠队列、销毁调度。
 * Toast 类内聚了 el 管理、节点缓存、事件绑定、动画、销毁等全部功能，
 * ToastManager 只负责队列调度和堆叠定位。
 */

import { FloatingLayerAbility } from '@/overlay/FloatingLayerAbility';
import type { ViewportPosition } from '@/overlay/FloatingLayerAbility';
import { Toast } from './Toast';
import type { ToastOptions, ToastHandle, ToastPosition } from './types';

/** 同时显示的 toast 最大数量 */
const MAX_COUNT = 5;

/** toast 间距 px */
const GAP = 16;

/** 距视口边缘间距 px */
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

    /**
     * 创建 toast 实例
     */
    create(options: ToastOptions): ToastHandle {
        const position: ToastPosition = options.position ?? 'top-right';

        const id = this.nextId++;
        const toast = new Toast(options);

        // 设置关闭回调：从队列移除 + 重新计算堆叠
        toast.onClose = () => {
            this.instances.delete(id);
            this.repositionAll(position);
        };

        this.instances.set(id, toast);

        // 超过上限时关闭最早的
        this.enforceMaxCount(position);

        // 重新计算所有同位置 toast 的堆叠位置
        this.repositionAll(position);

        return toast.handle;
    }

    /**
     * 重新计算指定位置所有活跃 toast 的堆叠位置
     */
    private repositionAll(position: ToastPosition): void {
        const samePosition = this.getInstancesByPosition(position);
        let offset = 0;

        for (const toast of samePosition) {
            toast.setViewportPosition(toast.el, position as ViewportPosition, offset, MARGIN);
            offset += toast.el.offsetHeight + GAP;
        }
    }

    /**
     * 获取指定位置的所有实例（按创建顺序）
     */
    private getInstancesByPosition(position: ToastPosition): Toast[] {
        const result: Toast[] = [];
        for (const toast of this.instances.values()) {
            if (toast.position === position) {
                result.push(toast);
            }
        }
        return result;
    }

    /**
     * 超过上限时关闭最早的同位置 toast
     */
    private enforceMaxCount(position: ToastPosition): void {
        const samePosition = this.getInstancesByPosition(position);
        if (samePosition.length <= MAX_COUNT) return;

        const oldest = samePosition[0];
        if (!oldest.handle['_closed']) {
            oldest.handle['_closed'] = true;
            oldest.close();
        }
    }
}
