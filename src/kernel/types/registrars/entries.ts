import { ActionHandler } from '../actions';
import { ActionCategory } from '../base';
import type { IPrecompilableAbility } from '../composable';

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

/**
 * 可组合能力注册条目
 * 
 * 用于注册能力到 ComposableRegistrar
 */
export interface ComposableEntry {
    /**
     * 能力名称（唯一标识）
     */
    name: string;
    
    /**
     * 能力描述
     */
    description?: string;
    
    /**
     * 依赖的其他能力
     */
    deps?: readonly string[];
    
    /**
     * 可预编译的能力类（构造函数）
     * 
     * 注意：这是构造函数，不是实例
     * 例如：EventAbility（不是 new EventAbility()）
     * 
     * 实例化会在注册时延迟执行
     */
    abilityClass?: new () => IPrecompilableAbility;
}
