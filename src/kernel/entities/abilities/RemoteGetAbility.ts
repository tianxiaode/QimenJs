import { AbilityBase } from '../../composable';
import { IEntityManagerBase } from '../../types';
import { debounce } from '@orbitjs/async';

export class RemoteGetAbility extends AbilityBase<IEntityManagerBase> {
    private debouncers = new Map<string, any>();

    protected onAttach(): void {
        this.host.get = (id: any) => {
            const key = `get:${id}`;
            if (!this.debouncers.has(key)) {
                this.debouncers.set(
                    key,
                    debounce((res, rej) => {
                        this.host
                            .fetch('get', id, data => {
                                this.host.state.item = data.item;
                            })
                            .then(res)
                            .catch(rej);
                    }, 300)
                );
            }
            return new Promise((res, rej) => this.debouncers.get(key)(res, rej));
        };
    }

    public onDispose(): void {
        this.debouncers.forEach(d => d.cancel?.());
        this.debouncers.clear();
        delete this.host.get;
    }
}
