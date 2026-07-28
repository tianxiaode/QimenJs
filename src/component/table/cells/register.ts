import { TemplateRegistrar } from '@/component-core/engine/ComponentRegistrar';
import { BASE_CELL_TPL } from './base-cell-tpl';
import { BaseCellComponent } from './BaseCellComponent';

export function registerBaseCellTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('BaseCell', BASE_CELL_TPL);
}
