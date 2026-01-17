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

export const CollectionAbilityEntry: ComposableEntry = {
    name: CollectionAbilityName,
    description: '为实体管理者提供集合接口',
    ctor: CollectionAbility,
};

export const SchemaAbilityEntry: ComposableEntry = {
    name: SechmaAbilityName,
    description: '为实体管理者提供数据结构定义接口',
    ctor: SchemaAbility,
};

export const RemoteListAbilityEntry: ComposableEntry = {
    name: RemoteListAbilityName,
    description: '为实体管理者提供远程列表接口',
    deps: [CollectionAbilityName, SechmaAbilityName],
    ctor: RemoteListAbility,
};

export const LocalListAbilityEntry: ComposableEntry = {
    name: LocalListAbilityName,
    description: '为实体管理者提供本地列表接口，已包含本地过滤、查询和排序功能',
    deps: [CollectionAbilityName, SechmaAbilityName],
    ctor: RemoteListAbility,
};

export const RemoteGetAbilityEntry: ComposableEntry = {
    name: RemoteGetAbilityName,
    description: '为实体管理者提供远程获取单个实体接口',
    deps: [CollectionAbilityName, SechmaAbilityName],
    ctor: RemoteGetAbility,
};

export const RemoteGetAllAbilityEntry: ComposableEntry = {
    name: RemoteGetAllAbilityName,
    description: '为实体管理者提供远程获取所有实体接口',
    deps: [CollectionAbilityName, SechmaAbilityName],
    ctor: RemoteGetAllAbility,
};

export const RemoteCreateAbilityEntry: ComposableEntry = {
    name: RemoteCreateAbilityName,
    description: '为实体管理者提供远程创建实体接口',
    deps: [CollectionAbilityName, SechmaAbilityName],
    ctor: RemoteCreateAbility,
};

export const LocalCreateAbilityEntry: ComposableEntry = {
    name: LocalCreateAbilityName,
    description: '为实体管理者提供本地创建实体接口',
    deps: [CollectionAbilityName, SechmaAbilityName],
    ctor: LocalCreateAbility,
};

export const RemoteUpdateAbilityEntry: ComposableEntry = {
    name: RemoteUpdateAbilityName,
    description: '为实体管理者提供远程更新实体接口',
    deps: [CollectionAbilityName, SechmaAbilityName],
    ctor: RemoteUpdateAbility,
};

export const LocalUpdateAbilityEntry: ComposableEntry = {
    name: LocalUpdateAbilityName,
    description: '为实体管理者提供本地更新实体接口',
    deps: [CollectionAbilityName, SechmaAbilityName],
    ctor: LocalUpdateAbility,
};

export const RemoteDeleteAbilityEntry: ComposableEntry = {
    name: RemoteDeleteAbilityName,
    description: '为实体管理者提供远程删除实体接口',
    deps: [CollectionAbilityName, SechmaAbilityName],
    ctor: RemoteDeleteAbility,
};

export const LocalDeleteAbilityEntry: ComposableEntry = {
    name: LocalDeleteAbilityName,
    description: '为实体管理者提供本地删除实体接口',
    deps: [CollectionAbilityName, SechmaAbilityName],
    ctor: LocalDeleteAbility,
};

export const RemoteToggleAbilityEntry: ComposableEntry = {
    name: RemoteToggleAbilityName,
    description: '为实体管理者提供远程切换实体状态接口',
    deps: [CollectionAbilityName, SechmaAbilityName],
    ctor: RemoteToggleAbility,
};

export const LocalToggleAbilityEntry: ComposableEntry = {
    name: LocalToggleAbilityName,
    description: '为实体管理者提供本地切换实体状态接口',
    deps: [CollectionAbilityName, SechmaAbilityName],
    ctor: LocalToggleAbility,
};
