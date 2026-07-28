/**
 * Loading 模板注册
 */

import { TemplateRegistrar } from '@/component-core/engine/TemplateRegistrar';
import { LOADING_TPL } from './loading-tpl';

export function registerLoadingTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('Loading', LOADING_TPL);
}
