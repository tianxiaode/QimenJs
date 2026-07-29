import { BreadcrumbComponent } from './BreadcrumbComponent';
import { BREADCRUMB_TPL } from './breadcrumb-tpl';

export function registerBreadcrumbTemplates(): void {
    BreadcrumbComponent.register(BREADCRUMB_TPL);
}
