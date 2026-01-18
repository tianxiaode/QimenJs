import {
    ComposableEntry,
    CollectionAbilityName,
    RemoteListAbilityName,
    LocalListAbilityName,
    SechmaAbilityName,
    RemoteGetAbilityName,
    RemoteGetAllAbilityName,
    RemoteCreateAbilityName,
    LocalCreateAbilityName,
    RemoteUpdateAbilityName,
    LocalUpdateAbilityName,
    RemoteDeleteAbilityName,
    LocalDeleteAbilityName,
    RemoteToggleAbilityName,
    LocalToggleAbilityName,
    RemoteQueryAbilityName,
    SystemAbilityName,
} from '../../types';
import { CollectionAbility } from './CollectionAbility';
import { LocalCreateAbility } from './LocalCreateAbility';
import { LocalDeleteAbility } from './LocalDeleteAbility';
import { LocalToggleAbility } from './LocalToggleAbility';
import { LocalUpdateAbility } from './LocalUpdateAbility';
import { RemoteCreateAbility } from './RemoteCreateAbility';
import { RemoteDeleteAbility } from './RemoteDeleteAbility';
import { RemoteGetAbility } from './RemoteGetAbility';
import { RemoteGetAllAbility } from './RemoteGetAllAbility';
import { RemoteListAbility } from './RemoteListAbility';
import { RemoteToggleAbility } from './RemoteToggleAbility';
import { RemoteUpdateAbility } from './RemoteUpdateAbility';
import { SchemaAbility } from './SchemaAbility';

/**
 * 集合能力入口定义
 * 提供对实体集合的基本访问接口
 */
export const CollectionAbilityEntry: ComposableEntry = {
    name: CollectionAbilityName,
    description: '为实体管理者提供集合接口',
    ctor: CollectionAbility,
};

/**
 * 模式能力入口定义
 * 提供实体结构定义和验证能力
 */
export const SchemaAbilityEntry: ComposableEntry = {
    name: SechmaAbilityName,
    description: '为实体管理者提供数据结构定义接口',
    ctor: SchemaAbility,
};

/**
 * 远程列表能力入口定义
 * 提供获取远程列表数据的能力
 */
export const RemoteListAbilityEntry: ComposableEntry = {
    name: RemoteListAbilityName,
    description: '为实体管理者提供远程列表接口',
    deps: [CollectionAbilityName, SechmaAbilityName],
    ctor: RemoteListAbility,
};

/**
 * 本地列表能力入口定义
 * 提供本地列表操作功能，包括过滤、搜索、排序等
 */
export const LocalListAbilityEntry: ComposableEntry = {
    name: LocalListAbilityName,
    description: '为实体管理者提供本地列表接口，已包含本地过滤、查询和排序功能',
    deps: [CollectionAbilityName, SechmaAbilityName],
    ctor: RemoteListAbility,
};

/**
 * 远程获取能力入口定义
 * 提供获取远程单个实体的能力
 */
export const RemoteGetAbilityEntry: ComposableEntry = {
    name: RemoteGetAbilityName,
    description: '为实体管理者提供远程获取单个实体接口',
    deps: [CollectionAbilityName, SechmaAbilityName],
    ctor: RemoteGetAbility,
};

/**
 * 远程获取全部能力入口定义
 * 提供获取所有远程实体的能力
 */
export const RemoteGetAllAbilityEntry: ComposableEntry = {
    name: RemoteGetAllAbilityName,
    description: '为实体管理者提供远程获取所有实体接口',
    deps: [CollectionAbilityName, SechmaAbilityName],
    ctor: RemoteGetAllAbility,
};

/**
 * 远程创建能力入口定义
 * 提供创建远程实体的能力
 */
export const RemoteCreateAbilityEntry: ComposableEntry = {
    name: RemoteCreateAbilityName,
    description: '为实体管理者提供远程创建实体接口',
    deps: [CollectionAbilityName, SechmaAbilityName],
    ctor: RemoteCreateAbility,
};

/**
 * 本地创建能力入口定义
 * 提供在本地创建实体的能力
 */
export const LocalCreateAbilityEntry: ComposableEntry = {
    name: LocalCreateAbilityName,
    description: '为实体管理者提供本地创建实体接口',
    deps: [CollectionAbilityName, SechmaAbilityName],
    ctor: LocalCreateAbility,
};

/**
 * 远程更新能力入口定义
 * 提供更新远程实体的能力
 */
export const RemoteUpdateAbilityEntry: ComposableEntry = {
    name: RemoteUpdateAbilityName,
    description: '为实体管理者提供远程更新实体接口',
    deps: [CollectionAbilityName, SechmaAbilityName],
    ctor: RemoteUpdateAbility,
};

/**
 * 本地更新能力入口定义
 * 提供在本地更新实体的能力
 */
export const LocalUpdateAbilityEntry: ComposableEntry = {
    name: LocalUpdateAbilityName,
    description: '为实体管理者提供本地更新实体接口',
    deps: [CollectionAbilityName, SechmaAbilityName],
    ctor: LocalUpdateAbility,
};

/**
 * 远程删除能力入口定义
 * 提供删除远程实体的能力
 */
export const RemoteDeleteAbilityEntry: ComposableEntry = {
    name: RemoteDeleteAbilityName,
    description: '为实体管理者提供远程删除实体接口',
    deps: [CollectionAbilityName, SechmaAbilityName],
    ctor: RemoteDeleteAbility,
};

/**
 * 本地删除能力入口定义
 * 提供在本地删除实体的能力
 */
export const LocalDeleteAbilityEntry: ComposableEntry = {
    name: LocalDeleteAbilityName,
    description: '为实体管理者提供本地删除实体接口',
    deps: [CollectionAbilityName, SechmaAbilityName],
    ctor: LocalDeleteAbility,
};

/**
 * 远程切换能力入口定义
 * 提供切换远程实体状态的能力
 */
export const RemoteToggleAbilityEntry: ComposableEntry = {
    name: RemoteToggleAbilityName,
    description: '为实体管理者提供远程切换实体状态接口',
    deps: [CollectionAbilityName, SechmaAbilityName],
    ctor: RemoteToggleAbility,
};

/**
 * 本地切换能力入口定义
 * 提供切换本地实体状态的能力
 */
export const LocalToggleAbilityEntry: ComposableEntry = {
    name: LocalToggleAbilityName,
    description: '为实体管理者提供本地切换实体状态接口',
    deps: [CollectionAbilityName, SechmaAbilityName],
    ctor: LocalToggleAbility,
};

/**
 * 远程查询能力入口定义
 * 提供远程查询接口
 */
export const RemoteQueryAbilityEntry: ComposableEntry = {
    name: RemoteQueryAbilityName,
    description: '为实体管理者提供远程查询接口',
    deps: [CollectionAbilityName, SechmaAbilityName, SystemAbilityName, RemoteListAbilityName],
    ctor: RemoteListAbility,
};