import { EventHandler, IComposableBase, IEventScope } from '@/kernel/types';
import { globalEventBus } from '../../events';
import { AbilityBase } from './AbilityBase';

export class EventAbility<T extends IComposableBase> extends AbilityBase<T> {
    private _eventScope?: IEventScope;

    protected onAttach(): void {
        const scope = globalEventBus.createEventScope();
        this._eventScope = scope; // Ability 自己留着用于销毁

        // 只暴露必要的 API
        Object.assign(this.host, {
            on: (event: string, handler: EventHandler) => scope.on(event, handler),
            once: (event: string, handler: EventHandler) => scope.once(event, handler),
            emit: (event: string, data?: any) => {
                scope.emit(event, data, this.host);
            },
        });
    }

    protected onDispose(): void {
        // 1. 核心：销毁 Scope，这将自动解绑所有在该 Scope 下注册的事件
        this._eventScope?.dispose();
        this._eventScope = undefined;
        const host = this.host as any;
        // 2. 清理宿主引用，防止 OOM (Out of Memory) 和过时调用
        host.on = null;
        host.once = null;
        host.emit = null;
    }
}
