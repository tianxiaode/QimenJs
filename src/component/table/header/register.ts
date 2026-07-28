import { TemplateRegistrar } from '@/component-core/engine/ComponentRegistrar';
import { BASE_HEADER_CELL_TPL } from './base-header-cell-tpl';
import { BaseHeaderCellComponent } from './BaseHeaderCellComponent';

export function registerBaseHeaderCellTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('BaseHeaderCell', BASE_HEADER_CELL_TPL);
}
