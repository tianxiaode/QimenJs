import { ILogger } from '@orbitjs/logger';
import { CollectionState } from './state';
import { EnvType } from '@orbitjs/registry';

export class AbilityBase<T,TC> {
    constructor(
        protected state: CollectionState<any>,
        protected reload: (force:boolean) => Promise<T[]>,
        protected logger: ILogger,
        protected env: EnvType
    ) {}
}
