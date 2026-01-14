import { EventHandler, IEventScope } from '@/kernel/types';
import {  globalEventBus } from '../../events';
import { AbilityBase } from './AbilityBase';

export class EventAbility extends AbilityBase {
    private _eventScope?: IEventScope;

    protected onAttach(): void {
        const scope = globalEventBus.createEventScope();
        this._eventScope = scope; // Ability 自己留着用于销毁

        // 只暴露必要的 API
        this.host.on = (event: string, handler: EventHandler) => scope.on(event, handler);
        this.host.once = (event: string, handler: EventHandler) => scope.once(event, handler);
        this.host.emit = (event: string, data?: any) => {
            scope.emit(event, data, this.host);
        };
    }

    protected onDispose(): void {
        // 1. 核心：销毁 Scope，这将自动解绑所有在该 Scope 下注册的事件
        this._eventScope?.dispose();
        this._eventScope = undefined;

        // 2. 清理宿主引用，防止 OOM (Out of Memory) 和过时调用
        this.host.on = null;
        this.host.once = null;
        this.host.emit = null;
    }
}
