import { ItemGroupPooledComponent } from '../itemgroup/ItemGroupPooledComponent';
import type { ItemGroupProps } from '../itemgroup/ItemGroupBaseComponent';
import { DomEventsMap } from '@qimenjs/component-core';
import './accordion.css.ts';

/** 手风琴模式类型 */
export type AccordionMode = 'single' | 'multiple';

/** 手风琴属性接口 */
export interface AccordionProps extends ItemGroupProps {
    mode?: AccordionMode;
    expandedIndex?: number;
    expandedIndices?: number[];
}

/** 手风琴组件 */
class AccordionComponent extends ItemGroupPooledComponent {
    _mode: AccordionMode = 'single';
    _expandedIndex: number = -1;

    /**
     * domEvents — 跨层委托 + 自定义方法名
     *
     * 'Panel.header.action' 路径：
     *   第一段 Panel → 按 Panel 类型在 _items 中查找
     *   第二段 header → 在 Panel.nodeMap 中定位 HeaderComponent
     *   第三段 action → 在 Header.nodeMap 中定位 action 按钮
     *
     * handler 为字符串时直接作为方法名，避免冗长的自动推导名称。
     */
    domEvents?: DomEventsMap | undefined = {
        click: {
            'Panel.header.action': {
                handler: '_onPanelAction',
                emits: ['[action]'],
            },
        },
    };

    /**
     * Panel 的 action 按钮点击（collapse/close 等）
     * handler 字符串 'onPanelAction' 指定，方法名简洁。
     */
    _onPanelAction(domEvt: any): void {
        const item = this.getTargetItem(domEvt.target);
        if (!item) return;

        const action = item.component?.action;
        if (action === 'collapse') {
            this.toggleAt(item.index);
        } else if (action === 'close') {
            this.removeAt(item.index);
        }
    }

    onAfterInit(props?: AccordionProps): void {
        const self = this as any;
        self._mode = props?.mode ?? 'single';

        this.toggleCls('q-accordion--multiple', self._mode === 'multiple');
        this.addCls('q-accordion');
        this.addCls('q-accordion__items', 'itemContainer');

        super.onAfterInit({
            ...props,
            direction: props?.direction ?? 'vertical',
            gap: props?.gap ?? '0',
            defaultItemType: 'Panel',
        });

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

    _expandPanel(index: number): void {
        const self = this as any;
        const panel = self.getAt(index);
        if (!panel) return;
        panel.setNodeHidden(false, 'body');
        panel.addCls('q-expand-arrow--expanded', 'expand');
        panel.removeCls('q-expand-arrow--collapsed', 'expand');
        panel.removeCls('q-panel--collapsed');
    }

    _collapsePanel(index: number): void {
        const self = this as any;
        const panel = self.getAt(index);
        if (!panel) return;
        panel.setNodeHidden(true, 'body');
        panel.addCls('q-expand-arrow--collapsed', 'expand');
        panel.removeCls('q-expand-arrow--expanded', 'expand');
        panel.addCls('q-panel--collapsed');
    }

    _isExpanded(index: number): boolean {
        const self = this as any;
        const panel = self.getAt(index);
        return panel ? !panel.containsCls('q-panel--collapsed') : false;
    }

    onUpdated(props?: Record<string, any>): void {
        const self = this as any;
        if (props?.mode !== undefined) {
            self._mode = props.mode;
            this.toggleCls('q-accordion--multiple', self._mode === 'multiple');
        }
        if (props?.expandedIndex !== undefined) self.expandAt(props.expandedIndex);
    }
}

AccordionComponent.register();
export { AccordionComponent };
/** 手风琴实例类型 */
export type AccordionComponentInstance = InstanceType<typeof AccordionComponent>;
