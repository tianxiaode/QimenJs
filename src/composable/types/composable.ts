/**
 * 可组合能力系统类型定义
 */

import type { ILogger } from '@qimenjs/logger';

export interface IComposableBase {
    logger: ILogger;
    getData(key: string): any;
    setData(key: string, value: any): void;
    get optionsKeys(): Set<string>;
    get propertyKeys(): Set<string>;
    _onOptionChange(_key: string, _value: any, _old: any): void;
    abilityState(key: string, creator?: () => any): any | undefined;
    setAbilityState(key: string, value: any): void;
    onCleanup(callback: () => void): void;
    onBeforeDispose(): void;
    onDisposed(): void;
    dispose(): void;
    [key: string]: any;
}
