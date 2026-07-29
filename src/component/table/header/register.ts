import { BaseHeaderCellComponent } from './BaseHeaderCellComponent';
import { BASE_HEADER_CELL_TPL } from './base-header-cell-tpl';

export function registerBaseHeaderCellTemplates(): void {
    BaseHeaderCellComponent.register(BASE_HEADER_CELL_TPL);
}