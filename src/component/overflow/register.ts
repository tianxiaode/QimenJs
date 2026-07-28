import { registerOverflowScrollTemplates } from './register-scroll';
import { registerOverflowMenuTemplates } from './register-menu';

export function registerOverflowTemplates(): void {
    registerOverflowScrollTemplates();
    registerOverflowMenuTemplates();
}
