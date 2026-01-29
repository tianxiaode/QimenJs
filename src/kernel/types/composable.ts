import { ILogger } from "@orbitjs/logger";

export interface IComposable {
    attach: (host: any) => void;
    dispose?: () => void;
}

export interface IComposableBase {
    domain?: string;
    logger: ILogger
    getStatic<T>(key: string | symbol): T | undefined;
    setStatic<T>(key: string | symbol, value: T): void;
    [key: string]: any
}

export type AbilityHostBase = Omit<
  IComposableBase,
  'getStatic' | 'setStatic'
>;

/**
 * Ability 暴露给 Host 的属性描述符扩展
 * 允许直接返回属性值，或者返回标准的 PropertyDescriptor (getter/setter)
 */
export type ExposeValue = PropertyDescriptor | any;

/**
 * 暴露清单接口
 */
export interface IExposeResult {
    [key: string | symbol]: ExposeValue;
}