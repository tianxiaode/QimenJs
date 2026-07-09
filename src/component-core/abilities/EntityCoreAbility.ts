/**
 * EntityCoreAbility — 实体管理
 *
 * 对应 LayoutNode 的 EntityProps 字段：entity
 *
 * entity 可以是字符串（EntityManager 名称）或类引用（new 创建 Manager）。
 * 在 __init__ 阶段创建 EntityManager（依赖 __initProps 设置的配置）。
 */

import type { ComposableBase } from '../ComposableBase';
import { ABILITY_INIT_PROPS } from '../ComposableBase';
import { AbilityBase } from './AbilityBase';

const STATE_KEY = 'EntityCoreAbility';

/** EntityManager 接口（框架定义） */
export interface EntityManager {
    dispose(): void;
}

const entityDescriptors: PropertyDescriptorMap = {
    entity: {
        get(this: ComposableBase) { return this.abilityState(`${STATE_KEY}:entity`); },
        set(this: ComposableBase, v: string | (new (...args: any[]) => any) | undefined) {
            this.abilityState(`${STATE_KEY}:entity`, v);
            // 实际的 Manager 创建在 __init__ 阶段执行
        },
        configurable: true, enumerable: true,
    },
};

export class EntityCoreAbility extends AbilityBase {
    /** 声明初始化方法名，在 __initProps 之后调用 */
    static __init__ = 'initEntity';

    static install(component: ComposableBase, config?: Record<string, any>): void {
        Object.defineProperties(component, entityDescriptors);
        component.abilityState(`${STATE_KEY}:instance`, new EntityCoreAbility());
    }

    [ABILITY_INIT_PROPS](props: Record<string, any>): void {
        // entity 值在阶段 4 通过 setter 设置
    }
}

/**
 * initEntity — 在 __init__ 阶段调用
 * 需要作为方法混入组件实例
 */
export function initEntity(this: ComposableBase): void {
    const entityDef = this.abilityState(`${STATE_KEY}:entity`);
    if (!entityDef) return;

    let manager: EntityManager;

    if (typeof entityDef === 'string') {
        // TODO: 从 EntityManager 注册表查找
        throw new Error(`EntityManager "${entityDef}" not found in registry`);
    } else if (typeof entityDef === 'function') {
        manager = new entityDef();
    } else {
        return;
    }

    this.abilityState(`${STATE_KEY}:manager`, manager);
    this.onCleanup(() => manager.dispose());
}
