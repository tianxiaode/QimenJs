import { BaseCellComponent } from './BaseCellComponent';
import { BASE_CELL_TPL } from './base-cell-tpl';

export function registerBaseCellTemplates(): void {
    BaseCellComponent.register(BASE_CELL_TPL);
}