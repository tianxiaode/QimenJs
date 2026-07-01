import type { 
    IEventAdapter,
    BindOptions,
    GestureSemantic,
} from '../types/abilities';
import type { IExposeResult } from '@/composable';
import { createEventAdapter } from '@/event-dom';
import { AbilityBase } from '@/composable';

/**
 * DomEventsAbility - DOM事件能力
 * 
 * 为类提供绑定DOM事件的能力，创建事件适配器来处理各种手势事件
 */
export class DomEventsAbility extends AbilityBase {
    /**
     * 事件适配器（延迟创建）
     * @private
     */
    private _adapter?: any;

    /**
     * 获取或创建事件适配器
     * 
     * @returns 事件适配器实例
     * @private
     */
    private getAdapter(): any {
        if (!this._adapter) {
            this._adapter = createEventAdapter();
        }
        return this._adapter;
    }

    /**
     * 暴露绑定事件的方法
     */
    protected expose(host: any): IExposeResult {
        return {
            /**
             * 绑定DOM事件到目标元素
             */
            bind: (target: EventTarget, semantic: GestureSemantic, options?: BindOptions) => {
                const scope = host.eventScope;
                return this.getAdapter().bind(target, semantic, scope, options, host);
            },
        };
    }

    /**
     * 在能力被释放时清理资源
     */
    protected onDispose(host: any): void {
        if (this._adapter) {
            this._adapter = undefined;
        }
    }
}
