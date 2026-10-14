import { BaseCellComponent } from './BaseCellComponent';
import type { ExpandCellData } from '../column-types';
import type { TemplateDecl } from '@qimenjs/component-core';
import { Definitions } from '@/composable';
import { QIcon } from '@/icon/QIcon';
import { EXPAND_CELL_TPL } from './expand-cell-tpl';

const ExpandCellComponentDefs: Definitions = {
    options: {},
} as const;

class ExpandCellComponent extends BaseCellComponent {
    get tpl(): TemplateDecl {
        return EXPAND_CELL_TPL;
    }

    _expanded: boolean = false;

    update(data: ExpandCellData): void {
        this._expanded = data.expanded ?? false;
        this._applyState();
    }

    get expanded(): boolean {
        return this._expanded;
    }
    set expanded(v: boolean) {
        this._expanded = v;
        this._applyState();
    }

    _applyState(): void {
        const iconName = this._expanded ? 'collapse' : 'expand';
        this.setNodeHtml(QIcon.svg(iconName, 14), 'icon');
    }

    _onValueOptionChange(_value: any): void {
    }

    onRootClick(): void {
        this._expanded = !this._expanded;
        this._applyState();
    }

    getEventData(_nodeName: string, _eventName: string, _eventType: string): Record<string, any> {
        return { expanded: this._expanded };
    }
}

ExpandCellComponent.define(ExpandCellComponentDefs);

export { ExpandCellComponent };
export type ExpandCellComponentInstance = InstanceType<typeof ExpandCellComponent>;
