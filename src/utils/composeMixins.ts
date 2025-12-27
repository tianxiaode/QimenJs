export abstract class DisposableBase {
    dispose(): void {}
}

export type Constructor<T extends DisposableBase = DisposableBase> = new (...args: any[]) => T;

/** mixin 只是一种：构造函数 → 构造函数 */
export type Mixin = (base: Constructor) => Constructor;

export function composeMixins(BaseClass: Constructor, mixins: Mixin[]): Constructor {
    return mixins.reduce<Constructor>((acc, mixin) => mixin(acc), BaseClass);
}
