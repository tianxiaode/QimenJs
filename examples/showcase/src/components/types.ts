import type { TemplateDecl } from '@qimenjs/component-core';

export interface DemoConfig {
    title: string;
    description: string;
    sections: { label: string; template: TemplateDecl; code?: string }[];
}
