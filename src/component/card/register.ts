/**
 * Card 模板注册
 */

import { TemplateRegistrar } from '@/component-core/engine/ComponentRegistrar';
import { CARD_TPL } from './card-tpl';

export function registerCardTemplates(): void {
    const registry = TemplateRegistrar.getInstance();
    registry.register('Card', CARD_TPL);
}
