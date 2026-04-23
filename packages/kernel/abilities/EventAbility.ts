import { EventHandler, IComposableBase, IEventScope, IExposeResult } from '@/kernel/types';
import { globalEventBus } from '../../events';
import { AbilityBase } from '../../composable';

/**
 * EventAbility - 事件能力类
 * 
 * 提供事件监听、一次性监听和事件发射的能力。
 * 通过创建独立的事件作用域（event scope）来管理事件，避免全局污染。
 * 每个实例拥有独立的事件生命周期。
 */
export class EventAbility<T extends IComposableBase> extends AbilityBase<T> {

    /**
     * 暴露事件相关的操作接口
     * 
     * 创建一个独立的事件作用域，并返回可操作该作用域的API方法
     * 
     * @returns 包含事件操作方法的对象
     */
    protected expose(): IExposeResult {
        const scope = globalEventBus.createEventScope();

        // 只暴露必要的 API
        return {
            /**
             * 获取当前事件作用域
             * 
             * @returns 当前实例的事件作用域对象
             */
            eventScope: { get: () => scope },
            
            /**
             * 监听事件
             * 
             * @param event 事件名称
             * @param handler 事件处理器函数
             * @returns void
             */
            on: (event: string, handler: EventHandler) => scope.on(event, handler),
            
            /**
             * 监听一次性事件（触发一次后自动移除）
             * 
             * @param event 事件名称
             * @param handler 事件处理器函数
             * @returns void
             */
            once: (event: string, handler: EventHandler) => scope.once(event, handler),
            
            /**
             * 发射事件
             * 
             * @param event 事件名称
             * @param data 传递的数据（可选）
             * @returns void
             */
            emit: (event: string, data?: any) => {
                scope.emit(event, data, this.host);
            },
        };
    }
}
