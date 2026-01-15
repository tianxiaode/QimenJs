import {
    ComposableEntry,
    CollectionAbilityName,
    RemoteListAbilityName,
    LocalListAbilityName,
    SechmaAbilityName,
} from '../../types';
import { CollectionAbility } from './CollectionAbility';
import { RemoteListAbility } from './RemoteListAbility';
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
    deps: [CollectionAbilityName],
    ctor: RemoteListAbility,
};

export const LocalListAbilityEntry: ComposableEntry = {
    name: LocalListAbilityName,
    description: '为实体管理者提供本地列表接口，已包含本地过滤、查询和排序功能',
    deps: [CollectionAbilityName, SechmaAbilityName],
    ctor: RemoteListAbility,
};
