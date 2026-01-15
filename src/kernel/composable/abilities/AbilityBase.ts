import { IComposable, IComposableBase } from "../../types";

/**
 * Ability 抽象基类：封装通用的宿主管理逻辑
 */
export abstract class AbilityBase<T extends IComposableBase> implements IComposable {
    protected host: T = null as any;

    public attach(host: T): void {
        this.host = host;
        this.onAttach();
    }

    public dispose(): void {
        if (this.host) {
            this.onDispose();
            this.host = null as any;
        }
    }

    /** 子类实现具体的挂载逻辑 */
    protected abstract onAttach(): void;
    
    /** 子类实现具体的清理逻辑 */
    protected abstract onDispose(): void;
}