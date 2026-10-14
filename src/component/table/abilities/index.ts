export * from './types';
export * from './ZebraAbility';
export * from './RowSelectAbility';
export * from './TableColumnAbility';
export * from './GroupAbility';
export * from './SummaryAbility';
export * from './VirtualEntityAbility';

import { ZebraAbility } from './ZebraAbility';
import { RowSelectAbility } from './RowSelectAbility';
import { TableColumnAbility } from './TableColumnAbility';
import { GroupAbility } from './GroupAbility';
import { SummaryAbility } from './SummaryAbility';
import { VirtualEntityAbility } from './VirtualEntityAbility';

export const TABLE_ABILITIES = [
    ZebraAbility,
    RowSelectAbility,
    TableColumnAbility,
    GroupAbility,
    SummaryAbility,
    VirtualEntityAbility,
] as const;
