import { IEventScope } from '../scope';
import { GestureSemantic } from './map';
export interface BindOptions {
    /** 是否阻止默认行为 */
    preventDefault?: boolean;
    /** 是否阻止冒泡 */
    stopPropagation?: boolean;
    /** 是否使用 capture */
    capture?: boolean;
    /** 是否只触发一次 */
    once?: boolean;
    /** 仅 press / longPress */
    threshold?: number;
    /** 是否禁用 mouse / touch fallback */
    disableFallback?: boolean;
}
export interface IEventAdapter<TTarget = any> {
    bind(target: TTarget, semantic: GestureSemantic, scope: IEventScope, options?: BindOptions, source?: any): void;
}
//# sourceMappingURL=base.d.ts.map