import { AbilityBase, type IExposeResult } from '@/composable';
import { globalEventBus, EventHandler } from '@/events';

/**
 * EventAbility - 事件能力类
 * 
 * 提供事件监听、一次性监听和事件发射的能力。
 * 通过创建独立的事件作用域（event scope）来管理事件，避免全局污染。
 * 每个宿主拥有独立的事件生命周期。
 */
export class EventAbility extends AbilityBase {
    /**
     * per-host 事件作用域映射
     * @private
     */
    private scopes = new WeakMap<object, any>();
    
    /**
     * 暴露事件相关的操作接口
     */
    protected expose(host: any): IExposeResult {
        // 创建 per-host 事件作用域
        const scope = globalEventBus.createEventScope();
        this.scopes.set(host, scope);
        
        return {
            /**
             * 获取当前事件作用域
             */
            eventScope: { get: () => scope },
            
            /**
             * 监听事件
             */
            on: (event: string, handler: EventHandler) => scope.on(event, handler),
            
            /**
             * 监听一次性事件
             */
            once: (event: string, handler: EventHandler) => scope.once(event, handler),
            
            /**
             * 发射事件
             */
            emit: (event: string, data?: any) => {
                scope.emit(event, data, host);
            },
        };
    }
    
    /**
     * 销毁事件作用域
     * 
     * @param host - 正在销毁的宿主对象
     */
    protected onDispose(host: any): void {
        const scope = this.scopes.get(host);
        if (scope) {
            scope.dispose();
            this.scopes.delete(host);
        }
    }
}
