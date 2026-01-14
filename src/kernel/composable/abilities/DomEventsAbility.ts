import {
    createEventAdapter,
    EventAdapter,
    GestureSemantic,
} from '../../events';
import { AbilityBase } from './AbilityBase';

export class DomEventsAbility extends AbilityBase {
    // 1. 定义为可选 (使用 ?)
    private _adapter?: EventAdapter<any>;

    private getAdapter(): EventAdapter<any> {
        if (!this._adapter) {
            this._adapter = createEventAdapter();
        }
        return this._adapter;
    }

    protected onAttach(): void {
        this.host.bind = (target: EventTarget, semantic: GestureSemantic, options?: any) => {
            const scope = this.host.eventScope;

            // 2. 使用可选链调用，确保安全
            return this.getAdapter().bind(target, semantic, scope, options, this.host);
        };
    }

    protected onDispose(): void {
        this.host.bind = null;
        this._adapter = undefined;
    }
}
