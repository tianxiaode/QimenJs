import { BaseCellComponent } from './BaseCellComponent';
import { Definitions } from '@/composable';

const RowNumberCellComponentDefs: Definitions = {
    options: {},
} as const;

class RowNumberCellComponent extends BaseCellComponent {
    _onValueOptionChange(value: any): void {
        this.setNodeText(String(value ?? ''), 'content');
    }
}

RowNumberCellComponent.define(RowNumberCellComponentDefs);
RowNumberCellComponent.register();

export { RowNumberCellComponent };
