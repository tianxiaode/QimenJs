import { Logger } from '@orbitjs/logger';
import { EventBus } from './EventBus';
import { EventScope } from './EventScope';

export class GlobalEventBus {
    private bus = new EventBus(Logger.for('global-bus'));

    on = this.bus.on.bind(this.bus);
    once = this.bus.once.bind(this.bus);
    emit = this.bus.emit.bind(this.bus);
    clear = this.bus.clear.bind(this.bus);

    createEventScope(): EventScope {
        return this.bus.createScope();
    }

    getBusId() {
        return this.bus.getBusId();
    }
}

// 单例
export const globalEventBus = new GlobalEventBus();
