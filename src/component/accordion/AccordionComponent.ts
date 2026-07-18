import { ItemGroupComponent } from '../itemgroup/ItemGroupComponent';
import type { ItemGroupProps } from '../itemgroup/ItemGroupComponent';

export type AccordionMode = 'single' | 'multiple';

export interface AccordionProps extends ItemGroupProps {
    mode?: AccordionMode;
    expandedIndex?: number;
    expandedIndices?: number[];
}

export let AccordionComponent = ItemGroupComponent.replace({
    type: 'Accordion',
    cls: 'q-accordion',
    itemsCls: 'q-accordion__items',
    config: {
        direction: 'vertical',
        gap: '0',
        itemType: 'Panel',
        eventKey: 'accordion',
        events: ['click'],
    },
    body: {
        _mode: 'single' as AccordionMode,
        _expandedIndex: -1,

        onAfterInit(props?: AccordionProps): void {
            this._mode = props?.mode ?? 'single';
            this.el.classList.toggle('q-accordion--multiple', this._mode === 'multiple');

            this.on('accordion:click', (data: any) => this._onPanelClick(data));

            if (this._mode === 'single' && props?.expandedIndex !== undefined) {
                this.expandAt(props.expandedIndex, true);
            }
            if (this._mode === 'multiple' && props?.expandedIndices?.length) {
                for (const idx of props.expandedIndices) this.expandAt(idx, true);
            }
        },

        get mode(): AccordionMode {
            return this._mode;
        },
        get expandedIndex(): number {
            return this._expandedIndex;
        },
        get expandedIndices(): number[] {
            const indices: number[] = [];
            for (let i = 0; i < this.count; i++) {
                if (this._isExpanded(i)) indices.push(i);
            }
            return indices;
        },

        expandAt(index: number, silent: boolean = false): void {
            if (index < 0 || index >= this.count) return;
            if (this._mode === 'single') {
                if (this._expandedIndex >= 0 && this._expandedIndex < this.count)
                    this._collapsePanel(this._expandedIndex);
                this._expandPanel(index);
                this._expandedIndex = index;
            } else {
                this._expandPanel(index);
            }
            if (!silent) this.emit('select', { index, expanded: true }, { source: 'accordion' });
        },

        collapseAt(index: number, silent: boolean = false): void {
            if (index < 0 || index >= this.count) return;
            if (this._mode === 'single') {
                if (index === this._expandedIndex) {
                    this._collapsePanel(index);
                    this._expandedIndex = -1;
                }
            } else {
                this._collapsePanel(index);
            }
            if (!silent) this.emit('select', { index, expanded: false }, { source: 'accordion' });
        },

        toggleAt(index: number, silent: boolean = false): void {
            this._isExpanded(index) ? this.collapseAt(index, silent) : this.expandAt(index, silent);
        },

        _onPanelClick(data: any): void {
            const index = data?.index;
            if (index !== undefined) this.toggleAt(index);
        },

        _expandPanel(index: number): void {
            const panel = this.getAt(index);
            if (!panel) return;
            if (panel.nodeMap?.body?.el) panel.nodeMap.body.el.hidden = false;
            if (panel.nodeMap?.expand?.el) {
                panel.nodeMap.expand.el.classList.remove('q-expand-arrow--collapsed');
                panel.nodeMap.expand.el.classList.add('q-expand-arrow--expanded');
            }
            panel.el.classList.remove('q-panel--collapsed');
        },

        _collapsePanel(index: number): void {
            const panel = this.getAt(index);
            if (!panel) return;
            if (panel.nodeMap?.body?.el) panel.nodeMap.body.el.hidden = true;
            if (panel.nodeMap?.expand?.el) {
                panel.nodeMap.expand.el.classList.remove('q-expand-arrow--expanded');
                panel.nodeMap.expand.el.classList.add('q-expand-arrow--collapsed');
            }
            panel.el.classList.add('q-panel--collapsed');
        },

        _isExpanded(index: number): boolean {
            const panel = this.getAt(index);
            return panel ? !panel.el.classList.contains('q-panel--collapsed') : false;
        },

        onUpdated(props?: Record<string, any>): void {
            if (props?.mode !== undefined) {
                this._mode = props.mode;
                this.el.classList.toggle('q-accordion--multiple', this._mode === 'multiple');
            }
            if (props?.expandedIndex !== undefined) this.expandAt(props.expandedIndex);
        },
    },
});
