import { AbilityBase } from '@/composable/AbilityBase';
import type { IExposeResult } from '@/types/composable';
import { globalEventBus, EventHandler } from '@orbitjs/events';

/**
 * EventAbility - 事件能力类
 * 
 * 提供事件监听、一次性监听和事件发射的能力。
 * 通过创建独立的事件作用域（event scope）来管理事件，避免全局污染。
 * 每个实例拥有独立的事件生命周期。
 */
export class EventAbility extends AbilityBase {
    readonly name = 'Event';
    
    /**
     * 事件作用域引用
     * @private
     */
    private scope: any;
    
    /**
     * 暴露事件相关的操作接口
     */
    protected expose(): IExposeResult {
        // 创建事件作用域
        this.scope = globalEventBus.createEventScope();
        
        return {
            /**
             * 获取当前事件作用域
             */
            eventScope: { get: () => this.scope },
            
            /**
             * 监听事件
             */
            on: (event: string, handler: EventHandler) => this.scope.on(event, handler),
            
            /**
             * 监听一次性事件
             */
            once: (event: string, handler: EventHandler) => this.scope.once(event, handler),
            
            /**
             * 发射事件
             */
            emit: (event: string, data?: any) => {
                this.scope.emit(event, data, this.host);
            },
        };
    }
    
    /**
     * 销毁事件作用域
     */
    protected onDispose(): void {
        this.scope?.dispose();
        this.scope = null;
    }
}
