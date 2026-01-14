import { ComposableRegistrar } from '../registrars';
import { IComposable } from '../types';

export abstract class ComposableBase {
    private _composables: IComposable[] = [];

    /**
     * 子类需通过此数组定义要注入的功能 Key
     * 例如: protected abilityKeys = ['logger', 'event'];
     */
    protected abstract abilityKeys: string[];

    /**
     * 自动装配方法
     */
    protected setupAbilities() {
        // 防止重复初始化
        if (this._composables.length > 0) return;

        const registrar = ComposableRegistrar.getInstance();

        // 1. 批量获取“处方条目”
        const entries = registrar.get(this.abilityKeys);

        // 2. 统一实例化并注入
        entries.forEach(entry => {
            const instance = new entry.ctor();

            // 执行注入契约
            instance.attach(this);

            // 存入实例池用于生命周期管理
            this._composables.push(instance);
        });
    }

    /**
     * 统一销毁逻辑
     */
    public dispose() {
        // 建议：倒序销毁更符合依赖逻辑（后加载的先卸载）
        for (let i = this._composables.length - 1; i >= 0; i--) {
            const c = this._composables[i];
            try {
                c.dispose?.();
            } catch (e) {
                console.error(`Dispose error in ${typeof c}:`, e);
            }
        }
        this._composables = [];
    }
}
