import { ILogger } from "@orbitjs/logger";
import { EnvType } from "@orbitjs/registry";
import { AbilityBase } from "./base";
import { CollectionState } from "./state";

export class FilterAbility<T, TC> extends AbilityBase<T, TC> {
    async search(criteria: Partial<TC>, force: boolean = false) {
        this.state.reset(false); // 解决同步：过滤时重置页码
        this.state.criteria = criteria;
        return await this.reload(force);
    }

    async filter(text: string, force: boolean = false) {
        this.state.reset(false); // 解决同步：过滤时重置页码
        this.state.filter = text;
        return await this.reload(force);
    }
}

export class LocalFilterAbility<T, TC> extends AbilityBase<T, TC> {

    constructor(
        protected state: CollectionState<any>,
        protected reload: (force:boolean) => Promise<T[]>,
        protected logger: ILogger,
        protected env: EnvType,
        protected filterFn: () => T[],
        protected searchFn: ()=>T[],
    ){
        super(state, reload, logger, env);
    }
    

    async search(criteria: Partial<TC>, force: boolean = false) {
        this.state.reset(false); // 解决同步：过滤时重置页码
        this.state.criteria = criteria;
        return this.searchFn();
    }

    async filter(text: string, force: boolean = false) {
        this.state.reset(false); // 解决同步：过滤时重置页码
        this.state.filter = text;
        return this.filterFn();
    }
}