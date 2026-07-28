import { ItemGroupPooledComponent } from '../itemgroup/ItemGroupPooledComponent';
import type { ItemGroupProps } from '../itemgroup/ItemGroupBaseComponent';

export type AccordionMode = 'single' | 'multiple';

export interface AccordionProps extends ItemGroupProps {
    mode?: AccordionMode;
    expandedIndex?: number;
    expandedIndices?: number[];
}

class AccordionComponent extends ItemGroupPooledComponent {
    static type = 'Accordion';

    type = 'Accordion';

    onInitState() {
        return {
            ...super.onInitState(),
            _mode: 'single' as AccordionMode,
            _expandedIndex: -1,
        };
    }

    onAfterInit(props?: AccordionProps): void {
        const self = this as any;
        self._mode = props?.mode ?? 'single';
        self.el.classList.toggle('q-accordion--multiple', self._mode === 'multiple');

        this.addCls('q-accordion');
        (this as any).itemContainer?.el?.classList.add('q-accordion__items');

        super.onAfterInit({
            ...props,
            direction: props?.direction ?? 'vertical',
            gap: props?.gap ?? '0',
            defaultItemType: 'Panel',
        });

        self.on('click', (data: any) => self._onPanelClick(data));

        if (self._mode === 'single' && props?.expandedIndex !== undefined) {
            self.expandAt(props.expandedIndex, true);
        }
        if (self._mode === 'multiple' && props?.expandedIndices?.length) {
            for (const idx of props.expandedIndices) self.expandAt(idx, true);
        }
    }

    get mode(): AccordionMode {
        const self = this as any;
        return self._mode;
    }
    get expandedIndex(): number {
        const self = this as any;
        return self._expandedIndex;
    }
    get expandedIndices(): number[] {
        const self = this as any;
        const indices: number[] = [];
        for (let i = 0; i < self.count; i++) {
            if (self._isExpanded(i)) indices.push(i);
        }
        return indices;
    }

    expandAt(index: number, silent: boolean = false): void {
        const self = this as any;
        if (index < 0 || index >= self.count) return;
        if (self._mode === 'single') {
            if (self._expandedIndex >= 0 && self._expandedIndex < self.count)
                self._collapsePanel(self._expandedIndex);
            self._expandPanel(index);
            self._expandedIndex = index;
        } else {
            self._expandPanel(index);
        }
        if (!silent) self.emit('select', { index, expanded: true });
    }

    collapseAt(index: number, silent: boolean = false): void {
        const self = this as any;
        if (index < 0 || index >= self.count) return;
        if (self._mode === 'single') {
            if (index === self._expandedIndex) {
                self._collapsePanel(index);
                self._expandedIndex = -1;
            }
        } else {
            self._collapsePanel(index);
        }
        if (!silent) self.emit('select', { index, expanded: false });
    }

    toggleAt(index: number, silent: boolean = false): void {
        const self = this as any;
        self._isExpanded(index) ? self.collapseAt(index, silent) : self.expandAt(index, silent);
    }

    _onPanelClick(data: any): void {
        const self = this as any;
        const index = data?.index;
        if (index !== undefined) self.toggleAt(index);
    }

    _expandPanel(index: number): void {
        const self = this as any;
        const panel = self.getAt(index);
        if (!panel) return;
        if (panel.nodeMap?.body?.el) panel.nodeMap.body.el.hidden = false;
        if (panel.nodeMap?.expand?.el) {
            panel.nodeMap.expand.el.classList.remove('q-expand-arrow--collapsed');
            panel.nodeMap.expand.el.classList.add('q-expand-arrow--expanded');
        }
        panel.el.classList.remove('q-panel--collapsed');
    }

    _collapsePanel(index: number): void {
        const self = this as any;
        const panel = self.getAt(index);
        if (!panel) return;
        if (panel.nodeMap?.body?.el) panel.nodeMap.body.el.hidden = true;
        if (panel.nodeMap?.expand?.el) {
            panel.nodeMap.expand.el.classList.remove('q-expand-arrow--expanded');
            panel.nodeMap.expand.el.classList.add('q-expand-arrow--collapsed');
        }
        panel.el.classList.add('q-panel--collapsed');
    }

    _isExpanded(index: number): boolean {
        const self = this as any;
        const panel = self.getAt(index);
        return panel ? !panel.el.classList.contains('q-panel--collapsed') : false;
    }

    onUpdated(props?: Record<string, any>): void {
        const self = this as any;
        if (props?.mode !== undefined) {
            self._mode = props.mode;
            self.el.classList.toggle('q-accordion--multiple', self._mode === 'multiple');
        }
        if (props?.expandedIndex !== undefined) self.expandAt(props.expandedIndex);
    }
}

export { AccordionComponent };
export type AccordionComponentInstance = InstanceType<typeof AccordionComponent>;
