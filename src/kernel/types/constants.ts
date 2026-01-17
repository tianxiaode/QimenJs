export const DOMAIN_CACHE_SYMBOL = Symbol('DomainConfigCache');
export const SCHEMA_CACHE_SYMBOL = Symbol('SCHEMA_FINAL_CACHE');

//系统组
export const EventAbilityName = 'event' as const;
export const DomEventsAbilityName = 'dom-events' as const;
export const DomainAbilityName = 'domain' as const;
export const SystemAbilityName = 'system-config' as const;

//实体组
export const CollectionAbilityName = 'em-collection' as const;
export const SechmaAbilityName = 'em-schema' as const;
export const RemoteListAbilityName = 'em-remote-list' as const;
export const LocalListAbilityName = 'em-local-list' as const;
export const RemoteGetAbilityName = 'em-remote-get' as const;
export const RemoteGetAllAbilityName = 'em-remote-get-all' as const;
export const RemoteCreateAbilityName = 'em-remote-create' as const;
export const LocalCreateAbilityName = 'em-local-create' as const;
export const RemoteUpdateAbilityName = 'em-remote-update' as const;
export const LocalUpdateAbilityName = 'em-local-update' as const;
export const RemoteDeleteAbilityName = 'em-remote-delete' as const;
export const LocalDeleteAbilityName = 'em-local-delete' as const;
export const RemoteToggleAbilityName = 'em-remote-toggle' as const;
export const LocalToggleAbilityName = 'em-local-toggle' as const;
export const RemoteQueryAbilityName = 'em-remote-query' as const;
