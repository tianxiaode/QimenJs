export * from './types';
export * from './ZebraAbility';
export * from './RowEventAbility';
export * from './RowSelectAbility';
export * from './TableColumnAbility';
export * from './GroupAbility';
export * from './SummaryAbility';
export * from './VirtualEntityAbility';
export * from './RowBodyAbility';
export * from './TableEditAbility';

import { ZebraAbility } from './ZebraAbility';
import { RowEventAbility } from './RowEventAbility';
import { RowSelectAbility } from './RowSelectAbility';
import { TableColumnAbility } from './TableColumnAbility';
import { GroupAbility } from './GroupAbility';
import { SummaryAbility } from './SummaryAbility';
import { VirtualEntityAbility } from './VirtualEntityAbility';
import { RowBodyAbility } from './RowBodyAbility';
import { TableEditAbility } from './TableEditAbility';

export const TABLE_ABILITIES = [
    ZebraAbility,
    RowEventAbility,
    RowSelectAbility,
    TableColumnAbility,
    GroupAbility,
    SummaryAbility,
    VirtualEntityAbility,
    RowBodyAbility,
    TableEditAbility,
] as const;
