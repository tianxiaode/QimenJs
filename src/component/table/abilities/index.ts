export * from './types';
export * from './ZebraAbility';
export * from './RowEventAbility';
export * from './RowSelectAbility';
export * from './TableColumnAbility';
export * from './GroupAbility';
export * from './SummaryAbility';
export * from './VirtualEntityAbility';
export * from './RowBodyAbility';

import { ZebraAbility } from './ZebraAbility';
import { RowEventAbility } from './RowEventAbility';
import { RowSelectAbility } from './RowSelectAbility';
import { TableColumnAbility } from './TableColumnAbility';
import { GroupAbility } from './GroupAbility';
import { SummaryAbility } from './SummaryAbility';
import { VirtualEntityAbility } from './VirtualEntityAbility';
import { RowBodyAbility } from './RowBodyAbility';

export const TABLE_ABILITIES = [
    ZebraAbility,
    RowEventAbility,
    RowSelectAbility,
    TableColumnAbility,
    GroupAbility,
    SummaryAbility,
    VirtualEntityAbility,
    RowBodyAbility,
] as const;
