import { TimelineComponent } from './TimelineComponent';
import { TIMELINE_TPL } from './timeline-tpl';

export function registerTimelineTemplates(): void {
    TimelineComponent.register(TIMELINE_TPL);
}