import { Constructor } from '@orbitjs/utils';
import { globalEventBus } from '../core/GlobalEventBus';
import { EventHandler } from '../core/types';
import { EventScope } from '../core';

/**
 * WithEventsPublic 接口定义了混入事件功能后类的公共API
 *
 * 包含了事件订阅、发布、手势绑定等基本功能
 */
export interface WithEventsPublic {
    /**
     * 订阅事件
     *
     * @param event 事件名称
     * @param handler 事件处理器
     * @returns 返回一个取消订阅的函数
     */
    on(event: string, handler: EventHandler): () => void;

    /**
     * 一次性订阅事件
     *
     * 事件触发一次后会自动取消订阅
     *
     * @param event 事件名称
     * @param handler 事件处理器
     */
    once(event: string, handler: EventHandler): void;

    /**
     * 触发事件
     *
     * @param event 事件名称
     * @param payload 事件数据载荷
     */
    emit(event: string, payload?: any): void;
}

/**
 * 核心：纯逻辑层 Mixin
 */
export function WithEvents<TBase extends Constructor>(
    Base: TBase
): abstract new (...args: ConstructorParameters<TBase>) => InstanceType<TBase> & WithEventsPublic {
    return class extends Base {
        private _eventScope: EventScope | undefined;

        private get eventScope() {
            if (this._eventScope === undefined) {
                this._eventScope = globalEventBus.createEventScope();
            }
            return this._eventScope;
        }

        on(event: string, handler: EventHandler) {
            return this.eventScope.on(event, handler);
        }

        emit(event: string, payload?: any) {
            this.eventScope.emit(event, payload);
        }

        dispose() {
            // 如果父类有 dispose 则调用
            super.dispose?.();
            this._eventScope?.dispose();
        }
    } as unknown as Constructor<InstanceType<TBase> & WithEventsPublic>;
}
