import { AbilityBase } from "./base";

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

