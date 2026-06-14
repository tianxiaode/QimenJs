"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemConfigAbilityEntry = exports.DomainConfigAbilityEntry = exports.DomEventsAbilityEntry = exports.EventAbilityEntry = void 0;
const types_1 = require("../../types");
const EventAbility_1 = require("./EventAbility");
const DomEventsAbility_1 = require("./DomEventsAbility");
const DomainAbility_1 = require("./DomainAbility");
const SystemAbility_1 = require("./SystemAbility");
/**
 * 事件能力入口定义
 * 为类添加事件发射和监听能力
 */
exports.EventAbilityEntry = {
    name: types_1.EventAbilityName,
    description: '为类添加事件能力',
    abilityClass: EventAbility_1.EventAbility, // ← 构造函数，不是实例
};
/**
 * DOM事件能力入口定义
 * 为类添加DOM事件绑定和处理能力
 */
exports.DomEventsAbilityEntry = {
    name: types_1.DomEventsAbilityName,
    description: '为类添加DOM事件能力',
    deps: [types_1.EventAbilityName],
    abilityClass: DomEventsAbility_1.DomEventsAbility, // ← 构造函数，不是实例
};
/**
 * 域配置能力入口定义
 * 为类添加域相关的配置和管理能力
 */
exports.DomainConfigAbilityEntry = {
    name: types_1.DomainAbilityName,
    description: '为类添加域配置能力',
    abilityClass: DomainAbility_1.DomainAbility, // ← 构造函数，不是实例
};
/**
 * 系统配置能力入口定义
 * 为类添加系统级配置和管理能力
 */
exports.SystemConfigAbilityEntry = {
    name: types_1.SystemAbilityName,
    description: '为类添加系统配置能力',
    abilityClass: SystemAbility_1.SystemAbility, // ← 构造函数，不是实例
};
//# sourceMappingURL=entries.js.map