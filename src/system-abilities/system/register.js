"use strict";
/**
 * 系统能力自动注册
 *
 * 将所有系统能力注册到 ComposableRegistrar
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSystemAbilities = registerSystemAbilities;
const composable_1 = require("@/composable");
const entries_1 = require("./entries");
/**
 * 注册所有系统能力
 *
 * @param registrar - ComposableRegistrar 实例（可选，默认使用单例）
 */
function registerSystemAbilities(registrar) {
    const composableRegistrar = registrar || composable_1.ComposableRegistrar.getInstance();
    // 注册事件能力
    composableRegistrar.register({ name: entries_1.EventAbilityEntry.name, ctor: entries_1.EventAbilityEntry.abilityClass }, entries_1.EventAbilityEntry.abilityClass, { immediate: false });
    // 注册 DOM 事件能力（依赖事件能力）
    composableRegistrar.register({ name: entries_1.DomEventsAbilityEntry.name, ctor: entries_1.DomEventsAbilityEntry.abilityClass }, entries_1.DomEventsAbilityEntry.abilityClass, { immediate: false });
    // 注册域能力
    composableRegistrar.register({ name: entries_1.DomainConfigAbilityEntry.name, ctor: entries_1.DomainConfigAbilityEntry.abilityClass }, entries_1.DomainConfigAbilityEntry.abilityClass, { immediate: false });
    // 注册系统能力
    composableRegistrar.register({ name: entries_1.SystemConfigAbilityEntry.name, ctor: entries_1.SystemConfigAbilityEntry.abilityClass }, entries_1.SystemConfigAbilityEntry.abilityClass, { immediate: false });
}
/**
 * 自动注册（模块加载时执行）
 */
// registerSystemAbilities();
//# sourceMappingURL=register.js.map