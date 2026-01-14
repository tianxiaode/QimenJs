import { ActionHandler } from '../actions';
import { ActionCategory } from '../base';
import { IComposable } from '../composable';

/**
 * 处理器条目：包含逻辑和优先级
 */
export interface ActionEntry {
    name: string;
    category: ActionCategory; // 明确它的功能属性
    description: string; // 给人类看的：说明具体业务意图

    isHttp?: boolean; // 场景开关

    offset: number; // 同层内的细微排序
    handler: ActionHandler;
}

export interface ComposableEntry {
    name: string;
    description?: string;
    ctor: new (...args: any[]) => IComposable;
}
