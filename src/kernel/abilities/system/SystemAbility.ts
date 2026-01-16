import { SystemConfig, SystemRegistrar } from '@orbitjs/registry';
import { AbilityBase } from '../../composable';
import { IComposableBase, IExposeResult } from '../../types';

export class SystemAbility<T extends IComposableBase> extends AbilityBase<T> {
    protected expose(): IExposeResult {
        const registrar = SystemRegistrar.getInstance();

        /**
         * 统一入口：systemConfig
         * 1. 不传参：systemConfig() -> SystemConfig (全量)
         * 2. 传参：systemConfig('theme') -> string (单项)
         */
        const systemConfig = <K extends keyof SystemConfig>(key?: K) => {
            if (key !== undefined) {
                return registrar.get(key);
            }
            return registrar.getAll();
        };

        return {
            systemConfig: systemConfig,
        };
    }
}
