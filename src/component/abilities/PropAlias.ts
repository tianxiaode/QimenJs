/**
 * Ability 属性别名与初始化协议
 *
 * Ability 可以通过特殊属性声明自己关心的 props 键名和别名映射，
 * 以及从 props 初始化自身状态的逻辑。
 *
 * @example
 * ```typescript
 * const InputTypeAbility: AbilityDefinition = {
 *     // 声明 props 别名映射：props.inputType → 组件.inputType
 *     __propAliases: { inputType: 'type' },
 *
 *     inputType: {
 *         get(): string {
 *             return this.abilityState('InputTypeAbility:inputType', () => 'text');
 *         },
 *         set(value: string): void {
 *             this.setAbilityState('InputTypeAbility:inputType', value);
 *             if (this.el?.tagName === 'INPUT') {
 *                 (this.el as HTMLInputElement).type = value;
 *             }
 *         },
 *     },
 * };
 * ```
 */

import type { AbilityDefinition } from '@qimenjs/composable';

/**
 * 属性别名映射类型
 *
 * key: props 中的键名（用户在布局定义中使用的名称）
 * value: 对应的 HTML/组件属性名（实际要设置的属性）
 *
 * 例如：{ inputType: 'type' } 表示 props.inputType 映射到 HTML input 的 type 属性
 */
export type PropAliasMap = Record<string, string>;

/**
 * 从 AbilityDefinition 中提取 __propAliases
 */
export function getPropAliases(ability: AbilityDefinition): PropAliasMap {
    const aliases = ability.__propAliases;
    if (aliases && typeof aliases === 'object') {
        return aliases as PropAliasMap;
    }
    return {};
}

/**
 * 从 AbilityDefinition 中提取 __initProps
 *
 * __initProps 是一个函数，在组件构造后调用，用于从 props 初始化能力状态
 */
export function getInitProps(ability: AbilityDefinition): ((props: Record<string, any>) => void) | undefined {
    const init = ability.__initProps;
    if (typeof init === 'function') {
        return init;
    }
    return undefined;
}

/**
 * 合并所有能力的属性别名映射
 *
 * @param abilities - 能力定义数组
 * @returns 合并后的别名映射
 */
export function mergePropAliases(abilities: AbilityDefinition[]): PropAliasMap {
    const merged: PropAliasMap = {};
    for (const ability of abilities) {
        const aliases = getPropAliases(ability);
        Object.assign(merged, aliases);
    }
    return merged;
}

/**
 * 应用属性别名：将 props 中的别名键映射到实际属性
 *
 * 处理逻辑：
 * 1. 遍历 aliasMap，如果 props 中有别名键（如 inputType），将其值设置到组件的对应属性（如 type）
 * 2. 如果组件已有该属性值（非 undefined），不覆盖
 *
 * @param component - 组件实例
 * @param props - 原始 props
 * @param aliasMap - 属性别名映射
 */
export function applyPropAliases(
    component: any,
    props: Record<string, any>,
    aliasMap: PropAliasMap
): void {
    for (const [aliasKey, targetProp] of Object.entries(aliasMap)) {
        if (props[aliasKey] !== undefined) {
            // 只在组件属性未设置时才从 props 别名赋值
            if (component[targetProp] === undefined || component[targetProp] === '') {
                component[targetProp] = props[aliasKey];
            }
        }
    }
}

/**
 * 调用所有能力的 __initProps 方法
 *
 * @param component - 组件实例
 * @param abilities - 能力定义数组
 * @param props - 原始 props
 */
export function initAbilitiesFromProps(
    component: any,
    abilities: AbilityDefinition[],
    props: Record<string, any>
): void {
    for (const ability of abilities) {
        const initFn = getInitProps(ability);
        if (initFn) {
            initFn.call(component, props);
        }
    }
}
