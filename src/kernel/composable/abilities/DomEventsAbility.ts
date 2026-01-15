import { BindOptions, GestureSemantic, IComposableBase, IEventAdapter } from '../../types';
import { createEventAdapter } from '../../events';
import { AbilityBase } from './AbilityBase';

export class DomEventsAbility<T extends IComposableBase> extends AbilityBase<T> {
    // 1. 定义为可选 (使用 ?)
    private _adapter?: IEventAdapter<any>;

    private getAdapter(): IEventAdapter<any> {
        if (!this._adapter) {
            this._adapter = createEventAdapter();
        }
        return this._adapter;
    }

    protected onAttach(): void {
        Object.assign(this.host, {
            bind: (target: EventTarget, semantic: GestureSemantic, options?: BindOptions) => {
                const scope = this.host.eventScope;

                // 2. 使用可选链调用，确保安全
                return this.getAdapter().bind(target, semantic, scope, options, this.host);
            },
        });
    }

    protected onDispose(): void {
        (this.host as any).bind = null;
        this._adapter = undefined;
    }
}
