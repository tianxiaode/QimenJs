import { BaseCellComponent } from './BaseCellComponent';

class RowNumberCellComponent extends BaseCellComponent {
    _onValueOptionChange(value: any): void {
        this.setNodeText(String(value ?? ''), 'content');
    }
}

export { RowNumberCellComponent };
