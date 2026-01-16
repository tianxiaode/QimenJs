import { EventHandler, IComposableBase, IEventScope, IExposeResult } from '@/kernel/types';
import { globalEventBus } from '../../events';
import { AbilityBase } from '../../composable';

export class EventAbility<T extends IComposableBase> extends AbilityBase<T> {

    protected expose(): IExposeResult {
        const scope = globalEventBus.createEventScope();

        // 只暴露必要的 API
        return {
            eventScope: { get: () => scope },
            on: (event: string, handler: EventHandler) => scope.on(event, handler),
            once: (event: string, handler: EventHandler) => scope.once(event, handler),
            emit: (event: string, data?: any) => {
                scope.emit(event, data, this.host);
            },
        };
    }
}
