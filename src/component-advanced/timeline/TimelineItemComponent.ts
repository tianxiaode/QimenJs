import { Component } from '@qimenjs/component-core';
import type { TemplateDecl } from '@qimenjs/component-core';
import { Definitions } from '@/composable';
import { TIMELINE_ITEM_TPL } from './timeline-item-tpl';
import './timelineitem.css';

export type TimelineColor = 'default' | 'primary' | 'success' | 'warning' | 'error';

const TimelineItemComponentDefs: Definitions = {
    options: {
        title: '',
        description: '',
        timestamp: '',
        color: 'default',
        dot: '',
    },
} as const;

class TimelineItemComponent extends Component {
    static type = 'timeline-item';

    get tpl(): TemplateDecl {
        return TIMELINE_ITEM_TPL;
    }

    _onTitleOptionChange(value: string): void {
        this.setNodeText(value, 'title');
    }

    _onDescriptionOptionChange(value: string): void {
        this.setNodeText(value, 'desc');
        this.setNodeHidden(!value, 'desc');
    }

    _onTimestampOptionChange(value: string): void {
        this.setNodeText(value, 'timestamp');
        this.setNodeHidden(!value, 'timestamp');
    }

    _onColorOptionChange(value: TimelineColor): void {
        this._applyColor(value);
    }

    _onDotOptionChange(value: string): void {
        this._applyDot(value);
    }

    onAfterInit(): void {
        this._applyColor(this.color);
        this._applyDot(this.dot);
    }

    private _applyColor(color: TimelineColor): void {
        this.removeCls(
            'q-timeline__item--primary q-timeline__item--success q-timeline__item--warning q-timeline__item--error'
        );
        if (color !== 'default') this.addCls(`q-timeline__item--${color}`);
    }

    private _applyDot(dot: string): void {
        if (dot) {
            this.setNodeText(dot, 'dot');
            this.addCls('q-timeline__dot--custom', 'dot');
        } else {
            this.setNodeText('', 'dot');
            this.removeCls('q-timeline__dot--custom', 'dot');
        }
    }
}

TimelineItemComponent.define(TimelineItemComponentDefs);

export { TimelineItemComponent };
export type TimelineItemComponentInstance = InstanceType<typeof TimelineItemComponent>;
