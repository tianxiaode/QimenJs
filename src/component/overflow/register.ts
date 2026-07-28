import { TemplateRegistrar } from '@/component-core/engine/TemplateRegistrar';
import { DelegatedEventEngine } from '@/component-core/engine/DelegatedEventEngine';
import { registerOverflowScrollTemplates } from './register-scroll';
import { registerOverflowMenuTemplates } from './register-menu';

export function registerOverflowTemplates(): void {
    registerOverflowScrollTemplates();
    registerOverflowMenuTemplates();
}
