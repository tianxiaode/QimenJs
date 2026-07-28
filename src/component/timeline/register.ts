import { TemplateRegistrar } from '@/component-core/engine/TemplateRegistrar';
import { TIMELINE_TPL } from './timeline-tpl';

export function registerTimelineTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('Timeline', TIMELINE_TPL);
}
