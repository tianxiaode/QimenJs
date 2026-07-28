/**
 * Progress 模板注册
 */

import { TemplateRegistrar } from '@/component-core/engine/TemplateRegistrar';
import { PROGRESS_TPL } from './progress-tpl';

export function registerProgressTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('Progress', PROGRESS_TPL);
}
